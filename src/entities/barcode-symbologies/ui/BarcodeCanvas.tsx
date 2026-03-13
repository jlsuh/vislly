import { type JSX, use, useCallback, useEffect, useRef } from 'react';
import {
  type BaseBarcodeWasm,
  fetchBarcodeWasm,
  isMatrix2DBarcodeWasm,
  type Matrix2DBarcodeWasm,
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
  onProcessComplete: (remainingBits: number, evaluatedText: string) => void;
}

function evaluateBarcodeText(
  originalText: string,
  barcodeWasm: BaseBarcodeWasm | Matrix2DBarcodeWasm,
  maxInputLength: number,
): { currentBits: number; validText: string } {
  const inputPtr = barcodeWasm.get_data_buffer();
  const wasmMem = new Uint8Array(barcodeWasm.memory.buffer);
  const textEncoder = new TextEncoder();
  const testTextInWasm = (text: string): number => {
    const encodedText = textEncoder.encode(text);
    wasmMem.set(encodedText, inputPtr);
    wasmMem[inputPtr + encodedText.length] = 0;
    barcodeWasm.render();
    if (isMatrix2DBarcodeWasm(barcodeWasm)) {
      return barcodeWasm.get_remaining_bits();
    }
    return (maxInputLength - text.length) * 8;
  };
  const currentBits = testTextInWasm(originalText);
  return { currentBits, validText: originalText };
}

function BarcodeCanvas({
  currentSymbology,
  dpr,
  inputText,
  selectedErrorCorrectionLevel,
  onProcessComplete,
}: BarcodeCanvasProps): JSX.Element {
  const { allowedPattern, maxInputLength, rightPaddingChar, type, wasmFile } =
    currentSymbology;

  const barcodeWasm = use(fetchBarcodeWasm(wasmFile, type));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let textToRender = inputText;
    const isValidPattern = new RegExp(`^${allowedPattern}$`).test(textToRender);
    if (!isValidPattern) {
      textToRender = '';
    }
    if (textToRender.length > maxInputLength) {
      textToRender = textToRender.slice(0, maxInputLength);
    }
    if (rightPaddingChar) {
      textToRender = textToRender.padEnd(maxInputLength, rightPaddingChar);
    }
    barcodeWasm.set_dpr(dpr);
    if (isMatrix2DBarcodeWasm(barcodeWasm)) {
      barcodeWasm.set_error_correction_level(+selectedErrorCorrectionLevel);
    }
    const { currentBits, validText } = evaluateBarcodeText(
      textToRender,
      barcodeWasm,
      maxInputLength,
    );
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
    if (onProcessComplete) {
      onProcessComplete(currentBits, validText);
    }
  }, [
    allowedPattern,
    barcodeWasm,
    dpr,
    inputText,
    maxInputLength,
    onProcessComplete,
    rightPaddingChar,
    selectedErrorCorrectionLevel,
  ]);

  useEffect(() => renderBarcode(), [renderBarcode]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

export default BarcodeCanvas;
