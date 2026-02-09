const BarcodeSymbology = {
  Code128: 'code-128',
  Ean13: 'ean-13',
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

const CODE128_PATTERN = '^[\\x00-\\x7F]*$';

const BARCODE_SYMBOLOGIES: Record<
  BarcodeSymbology,
  {
    allowedChars: RegExp;
    label: string;
    paddingChar?: string;
    targetLength?: number;
    value: BarcodeSymbology;
    wasmFile: string;
  }
> = {
  [BarcodeSymbology.Code128]: {
    allowedChars: new RegExp(CODE128_PATTERN),
    label: 'Code 128',
    value: BarcodeSymbology.Code128,
    wasmFile: 'code_128.wasm',
  },
  [BarcodeSymbology.Ean13]: {
    allowedChars: /^[0-9]*$/,
    label: 'EAN-13',
    paddingChar: '0',
    targetLength: 12,
    value: BarcodeSymbology.Ean13,
    wasmFile: 'ean_13.wasm',
  },
} as const;

const INITIAL_SYMBOLOGY: BarcodeSymbology = BarcodeSymbology.Code128;

export {
  assertIsBarcodeSymbology,
  BARCODE_SYMBOLOGIES,
  INITIAL_SYMBOLOGY,
  type BarcodeSymbology,
};
