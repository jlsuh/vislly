import { type JSX, use, useCallback, useEffect, useRef } from 'react';
import { fetchBarcodeWasm } from '../lib/barcode-wasm.ts';
import type { BarcodeConfig } from '../model/barcode-symbologies.ts';
import styles from './barcode-canvas.module.css';

interface BarcodeCanvasProps {
  currentSymbology: BarcodeConfig;
  dpr: number;
  inputText: string;
}

function BarcodeCanvas({
  currentSymbology,
  dpr,
  inputText,
}: BarcodeCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rightPaddingChar, wasmFile } = currentSymbology;
  const barcodeWasm = use(fetchBarcodeWasm(wasmFile));
  const maxInputLength = barcodeWasm.get_max_input_length();

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
    const inputPtr = barcodeWasm.get_data_buffer();
    const wasmMem = new Uint8Array(barcodeWasm.memory.buffer);
    for (let i = 0; i < textToRender.length; i += 1) {
      wasmMem[inputPtr + i] = textToRender.charCodeAt(i);
    }
    wasmMem[inputPtr + textToRender.length] = 0;
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
  }, [barcodeWasm, dpr, inputText, maxInputLength, rightPaddingChar]);

  useEffect(() => renderBarcode(), [renderBarcode]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

export default BarcodeCanvas;
