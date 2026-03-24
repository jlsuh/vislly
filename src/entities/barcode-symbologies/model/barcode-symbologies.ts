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
    throw new Error(`Invalid barcode symbology: ${value}`);
  }
}

const BarcodeType = {
  Linear: 'Linear',
  Matrix2D: 'Matrix2D',
} as const;

type BarcodeType = (typeof BarcodeType)[keyof typeof BarcodeType];

const AVAILABLE_BARCODE_TYPES = Object.values(BarcodeType);

function assertIsBarcodeType(value: unknown): asserts value is BarcodeType {
  if (!AVAILABLE_BARCODE_TYPES.includes(value as BarcodeType)) {
    throw new Error(`Invalid barcode type: ${value}`);
  }
}

const BARCODE_TYPE_LABELS: Record<BarcodeType, string> = {
  [BarcodeType.Matrix2D]: 'Matrix (2D) Codes',
  [BarcodeType.Linear]: 'Linear Barcodes',
} as const;

const CODE128_PATTERN = '[\\x00-\\x7F]*';
const NUMERIC_PATTERN = '[0-9]*';
const QR_PATTERN = '.*';

type SymbologyConfig = {
  allowedPattern: string;
  checksumDigits?: number;
  horizontalQuietZone: number;
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  inputType: InputHTMLAttributes<HTMLInputElement>['type'];
  label: string;
  loadingDimensions: { width: number; height: number };
  maxInputLength: number;
  rightPaddingChar?: string;
  type: BarcodeType;
  value: BarcodeSymbology;
  wasmFile: string;
};

const BARCODE_SYMBOLOGIES: ReadonlyDeep<
  Record<BarcodeSymbology, SymbologyConfig>
> = {
  [BarcodeSymbology.Code128]: {
    allowedPattern: CODE128_PATTERN,
    checksumDigits: 1,
    horizontalQuietZone: 40,
    inputMode: 'text',
    inputType: 'text',
    label: 'Code 128',
    loadingDimensions: { width: 140, height: 194 },
    maxInputLength: 64,
    type: BarcodeType.Linear,
    value: BarcodeSymbology.Code128,
    wasmFile: 'code_128.wasm',
  },
  [BarcodeSymbology.Ean13]: {
    allowedPattern: NUMERIC_PATTERN,
    checksumDigits: 1,
    horizontalQuietZone: 40,
    inputMode: 'numeric',
    inputType: 'text',
    label: 'EAN-13',
    loadingDimensions: { width: 380, height: 194 },
    maxInputLength: 12,
    rightPaddingChar: '0',
    type: BarcodeType.Linear,
    value: BarcodeSymbology.Ean13,
    wasmFile: 'ean_13.wasm',
  },
  [BarcodeSymbology.Itf14]: {
    allowedPattern: NUMERIC_PATTERN,
    checksumDigits: 1,
    horizontalQuietZone: 50,
    inputMode: 'numeric',
    inputType: 'text',
    label: 'ITF-14',
    loadingDimensions: { width: 549, height: 194 },
    maxInputLength: 13,
    rightPaddingChar: '0',
    type: BarcodeType.Linear,
    value: BarcodeSymbology.Itf14,
    wasmFile: 'itf_14.wasm',
  },
  [BarcodeSymbology.QrCode]: {
    allowedPattern: QR_PATTERN,
    horizontalQuietZone: 0,
    inputMode: 'text',
    inputType: 'text',
    label: 'QR Code',
    loadingDimensions: { width: 116, height: 116 },
    maxInputLength: 7089,
    type: BarcodeType.Matrix2D,
    value: BarcodeSymbology.QrCode,
    wasmFile: 'qr_code.wasm',
  },
};

const SYMBOLOGY_OPTIONS_BY_TYPE: ReadonlyDeep<Record<BarcodeType, Option[]>> = {
  [BarcodeType.Linear]: Object.values(BARCODE_SYMBOLOGIES)
    .filter((config) => config.type === BarcodeType.Linear)
    .map(({ label, value }) => ({ label, value })),
  [BarcodeType.Matrix2D]: Object.values(BARCODE_SYMBOLOGIES)
    .filter((config) => config.type === BarcodeType.Matrix2D)
    .map(({ label, value }) => ({ label, value })),
};

const ErrorCorrectionLevel = {
  L: '0',
  M: '1',
  Q: '2',
  H: '3',
} as const;

type ErrorCorrectionLevel =
  (typeof ErrorCorrectionLevel)[keyof typeof ErrorCorrectionLevel];

const AVAILABLE_ERROR_CORRECTION_LEVELS = Object.values(ErrorCorrectionLevel);

function assertIsErrorCorrectionLevel(
  value: unknown,
): asserts value is ErrorCorrectionLevel {
  if (
    !AVAILABLE_ERROR_CORRECTION_LEVELS.includes(value as ErrorCorrectionLevel)
  ) {
    throw new Error(`Invalid error correction level: ${value}`);
  }
}

const INITIAL_BARCODE_TYPE: BarcodeType = BarcodeType.Matrix2D;

const DEFAULT_SYMBOLOGY_BY_TYPE: ReadonlyDeep<
  Record<BarcodeType, BarcodeSymbology>
> = {
  [BarcodeType.Linear]: BarcodeSymbology.Code128,
  [BarcodeType.Matrix2D]: BarcodeSymbology.QrCode,
};

const INITIAL_SYMBOLOGY: BarcodeSymbology =
  DEFAULT_SYMBOLOGY_BY_TYPE[INITIAL_BARCODE_TYPE];

const INITIAL_ERROR_CORRECTION_LEVEL: ErrorCorrectionLevel =
  ErrorCorrectionLevel.M;

export {
  assertIsBarcodeSymbology,
  assertIsBarcodeType,
  assertIsErrorCorrectionLevel,
  BARCODE_SYMBOLOGIES,
  BARCODE_TYPE_LABELS,
  BarcodeSymbology,
  BarcodeType,
  DEFAULT_SYMBOLOGY_BY_TYPE,
  ErrorCorrectionLevel,
  INITIAL_BARCODE_TYPE,
  INITIAL_ERROR_CORRECTION_LEVEL,
  INITIAL_SYMBOLOGY,
  SYMBOLOGY_OPTIONS_BY_TYPE,
  type SymbologyConfig,
};
