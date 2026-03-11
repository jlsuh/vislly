import type {
  ErrorCorrectionLevel,
  SymbologyConfig,
} from '../model/barcode-symbologies.ts';
import { BarcodeType } from '../model/barcode-symbologies.ts';
import {
  type BaseBarcodeWasm,
  isMatrix2DBarcodeWasm,
  type Matrix2DBarcodeWasm,
} from './barcode-wasm.ts';

function calculateModeCapacity(
  remainingBits: number,
  textLength: number,
  groupSize: number,
  bitsPerGroup: number,
  refunds: number[],
  thresholds: { bits: number; items: number }[],
): number {
  const partialCount = textLength % groupSize;
  const virtualRemaining = remainingBits + (refunds[partialCount] ?? 0);
  const groups = Math.floor(virtualRemaining / bitsPerGroup);
  const leftover = virtualRemaining % bitsPerGroup;
  let extraItems = groups * groupSize;
  for (const { bits, items } of thresholds) {
    if (leftover >= bits) {
      extraItems += items;
      break;
    }
  }
  return extraItems - partialCount;
}

function getTrailingMatchLength(text: string, regex: RegExp): number {
  return text.match(regex)?.[0].length ?? 0;
}

function getKanjiCapacity(remainingBits: number, text: string): number | null {
  const trailingKanji = getTrailingMatchLength(
    text,
    /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]+$/,
  );
  if (trailingKanji === 0) return null;
  if (trailingKanji === text.length || trailingKanji >= 13) {
    return calculateModeCapacity(
      remainingBits,
      trailingKanji,
      1,
      13,
      [0],
      [{ bits: 13, items: 1 }],
    );
  }
  return null;
}

function getNumericCapacity(
  remainingBits: number,
  text: string,
): number | null {
  const trailingDigits = getTrailingMatchLength(text, /[0-9]+$/);
  if (trailingDigits === 0) return null;
  const precedingChar = text.slice(0, -trailingDigits).slice(-1);
  const threshold = /^[A-Z $%*+\-./:]$/.test(precedingChar) ? 17 : 8;
  if (trailingDigits === text.length || trailingDigits >= threshold) {
    return calculateModeCapacity(
      remainingBits,
      trailingDigits,
      3,
      10,
      [0, 4, 7],
      [
        { bits: 7, items: 2 },
        { bits: 4, items: 1 },
      ],
    );
  }
  return null;
}

function getAlphanumericCapacity(
  remainingBits: number,
  text: string,
): number | null {
  const trailingAlpha = getTrailingMatchLength(text, /[0-9A-Z $%*+\-./:]+$/);
  if (trailingAlpha === 0) return null;
  if (trailingAlpha === text.length || trailingAlpha >= 16) {
    return calculateModeCapacity(
      remainingBits,
      trailingAlpha,
      2,
      11,
      [0, 6],
      [{ bits: 6, items: 1 }],
    );
  }
  return null;
}

function getMatrix2DCapacity(remainingBits: number, text: string): number {
  if (text.length === 0) {
    return calculateModeCapacity(
      remainingBits,
      0,
      3,
      10,
      [2, 4, 7],
      [
        { bits: 7, items: 2 },
        { bits: 4, items: 1 },
      ],
    );
  }
  const kanjiCapacity = getKanjiCapacity(remainingBits, text);
  if (kanjiCapacity !== null) return kanjiCapacity;
  const numCapacity = getNumericCapacity(remainingBits, text);
  if (numCapacity !== null) return numCapacity;
  const alphaCapacity = getAlphanumericCapacity(remainingBits, text);
  if (alphaCapacity !== null) return alphaCapacity;
  return Math.floor(remainingBits / 8);
}

function composeTotalCapacity(
  remainingBits: number | null,
  barcodeType: BarcodeType,
  syncedInput: string = '',
): number | null {
  if (remainingBits === null) return null;
  const baseCapacity =
    barcodeType === BarcodeType.Matrix2D
      ? getMatrix2DCapacity(remainingBits, syncedInput)
      : Math.floor(remainingBits / 8);
  return syncedInput.length + baseCapacity;
}

function evaluateCapacitySync(
  text: string,
  wasm: BaseBarcodeWasm | Matrix2DBarcodeWasm | null,
  symbology: SymbologyConfig,
  ecl: ErrorCorrectionLevel,
): number {
  if (!wasm) return -1;
  const { maxInputLength } = symbology;
  if (text.length > maxInputLength) return -1;
  const inputPtr = wasm.get_data_buffer();
  const wasmMem = new Uint8Array(wasm.memory.buffer);
  const textEncoder = new TextEncoder();
  const encodedText = textEncoder.encode(text);
  wasmMem.set(encodedText, inputPtr);
  wasmMem[inputPtr + encodedText.length] = 0;
  if (isMatrix2DBarcodeWasm(wasm)) {
    wasm.set_error_correction_level(+ecl);
  }
  wasm.render();
  if (isMatrix2DBarcodeWasm(wasm)) return wasm.get_remaining_bits();
  return (maxInputLength - text.length) * 8;
}

export { composeTotalCapacity, evaluateCapacitySync };
