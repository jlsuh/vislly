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
  totalCapacity: number;
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

function formatBarcodeText(
  text: string,
  pattern: string,
  maxLength: number,
  paddingChar?: string,
): string {
  let formattedText = text;
  const isValidPattern = new RegExp(`^${pattern}$`).test(formattedText);
  if (!isValidPattern) {
    formattedText = '';
  }
  if (formattedText.length > maxLength) {
    formattedText = formattedText.slice(0, maxLength);
  }
  if (paddingChar) {
    formattedText = formattedText.padEnd(maxLength, paddingChar);
  }
  return formattedText;
}

function BarcodeCanvas({
  currentSymbology,
  dpr,
  inputText,
  selectedErrorCorrectionLevel,
  totalCapacity,
  onProcessComplete,
}: BarcodeCanvasProps): JSX.Element {
  const { allowedPattern, maxInputLength, rightPaddingChar, type, wasmFile } =
    currentSymbology;

  const barcodeWasm = use(fetchBarcodeWasm(wasmFile, type));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderBarcode = useCallback(() => {
    if (inputText.length > totalCapacity) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const textToRender = formatBarcodeText(
      inputText,
      allowedPattern,
      maxInputLength,
      rightPaddingChar,
    );
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
    ctx.putImageData(new ImageData(pixelData, width, height), 0, 0);
    onProcessComplete(currentBits, validText);
  }, [
    allowedPattern,
    barcodeWasm,
    dpr,
    inputText,
    maxInputLength,
    onProcessComplete,
    rightPaddingChar,
    selectedErrorCorrectionLevel,
    totalCapacity,
  ]);

  useEffect(() => renderBarcode(), [renderBarcode]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

export default BarcodeCanvas;
