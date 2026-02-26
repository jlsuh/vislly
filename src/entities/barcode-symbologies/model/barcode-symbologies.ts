import type { InputHTMLAttributes } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';

const BarcodeSymbology = {
  Code128: 'code-128',
  Ean13: 'ean-13',
  Itf14: 'itf-14',
  QrCode: 'qr-code',
} as const;

const AVAILABLE_BARCODE_SYMBOLOGIES = Object.values(BarcodeSymbology);

type BarcodeSymbology =
  (typeof BarcodeSymbology)[keyof typeof BarcodeSymbology];

function assertIsBarcodeSymbology(
  value: unknown,
): asserts value is BarcodeSymbology {
  if (!AVAILABLE_BARCODE_SYMBOLOGIES.includes(value as BarcodeSymbology)) {
    throw new Error(`Invalid barcode symbology: ${String(value)}`);
  }
}

const CODE128_PATTERN = '[\\x00-\\x7F]*';
const NUMERIC_PATTERN = '[0-9]*';

type SymbologyConfig = {
  allowedPattern: string;
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  label: string;
  loadingDimensions: { width: number; height: number };
  maxInputLength: number;
  paddingLength: number;
  rightPaddingChar?: string;
  type: InputHTMLAttributes<HTMLInputElement>['type'];
  value: BarcodeSymbology;
  wasmFile: string;
};

const BARCODE_SYMBOLOGIES: ReadonlyDeep<
  Record<BarcodeSymbology, SymbologyConfig>
> = {
  [BarcodeSymbology.Code128]: {
    allowedPattern: CODE128_PATTERN,
    inputMode: 'text',
    label: 'Code 128',
    loadingDimensions: { width: 140, height: 160 },
    maxInputLength: 64,
    paddingLength: 0,
    type: 'text',
    value: BarcodeSymbology.Code128,
    wasmFile: 'code_128.wasm',
  },
  [BarcodeSymbology.Ean13]: {
    allowedPattern: NUMERIC_PATTERN,
    inputMode: 'numeric',
    label: 'EAN-13',
    loadingDimensions: { width: 380, height: 184 },
    maxInputLength: 12,
    paddingLength: 12,
    rightPaddingChar: '0',
    type: 'text',
    value: BarcodeSymbology.Ean13,
    wasmFile: 'ean_13.wasm',
  },
  [BarcodeSymbology.Itf14]: {
    allowedPattern: NUMERIC_PATTERN,
    inputMode: 'numeric',
    label: 'ITF-14',
    loadingDimensions: { width: 528, height: 160 },
    maxInputLength: 13,
    paddingLength: 13,
    rightPaddingChar: '0',
    type: 'text',
    value: BarcodeSymbology.Itf14,
    wasmFile: 'itf_14.wasm',
  },
  [BarcodeSymbology.QrCode]: {
    allowedPattern: NUMERIC_PATTERN,
    inputMode: 'numeric',
    label: 'QR Code',
    loadingDimensions: { width: 250, height: 250 },
    maxInputLength: 7089,
    paddingLength: 41,
    rightPaddingChar: '0',
    type: 'text',
    value: BarcodeSymbology.QrCode,
    wasmFile: 'qr_code.wasm',
  },
};

const BARCODE_OPTIONS: ReadonlyDeep<Option[]> = Object.values(
  BARCODE_SYMBOLOGIES,
).map(({ label, value }) => ({
  label,
  value,
}));

const INITIAL_SYMBOLOGY: BarcodeSymbology = BarcodeSymbology.Code128;

export {
  assertIsBarcodeSymbology,
  BARCODE_OPTIONS,
  BARCODE_SYMBOLOGIES,
  INITIAL_SYMBOLOGY,
  type BarcodeSymbology,
  type SymbologyConfig,
};
