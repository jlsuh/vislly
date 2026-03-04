import { type JSX, use, useCallback, useEffect, useRef } from 'react';
import {
  fetchBarcodeWasm,
  isMatrix2DBarcodeWasm,
} from '../lib/barcode-wasm.ts';
import type {
  ErrorCorrectionLevel,
  SymbologyConfig,
} from '../model/barcode-symbologies.ts';
import styles from './barcode-canvas.module.css';

interface BarcodeCanvasProps {
  currentSymbology: SymbologyConfig;
  dpr: number;
  inputText: string;
  selectedErrorCorrectionLevel: ErrorCorrectionLevel;
}

function BarcodeCanvas({
  currentSymbology,
  dpr,
  inputText,
  selectedErrorCorrectionLevel,
}: BarcodeCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { maxInputLength, rightPaddingChar, type, wasmFile } = currentSymbology;
  const barcodeWasm = use(fetchBarcodeWasm(wasmFile, type));

  const renderBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let textToRender = inputText;
    if (rightPaddingChar) {
      textToRender = textToRender.padEnd(maxInputLength, rightPaddingChar);
    }
    barcodeWasm.set_dpr(dpr);
    if (isMatrix2DBarcodeWasm(barcodeWasm)) {
      barcodeWasm.set_error_correction_level(+selectedErrorCorrectionLevel);
    }
    const inputPtr = barcodeWasm.get_data_buffer();
    const wasmMem = new Uint8Array(barcodeWasm.memory.buffer);
    const encodedText = new TextEncoder().encode(textToRender);
    wasmMem.set(encodedText, inputPtr);
    wasmMem[inputPtr + encodedText.length] = 0;
    barcodeWasm.render();
    const width = barcodeWasm.get_width();
    const height = barcodeWasm.get_height();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width / dpr}px`;
    const pixelPtr = barcodeWasm.get_pixel_buffer();
    const pixelData = new Uint8ClampedArray(
      barcodeWasm.memory.buffer,
      pixelPtr,
      width * height * 4,
    );
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [
    barcodeWasm,
    dpr,
    maxInputLength,
    rightPaddingChar,
    inputText,
    selectedErrorCorrectionLevel,
  ]);

  useEffect(() => renderBarcode(), [renderBarcode]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

export default BarcodeCanvas;
