import type { ChangeEvent, JSX } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import {
  BARCODE_TYPE_LABELS,
  BarcodeType,
  ErrorCorrectionLevel,
  type SymbologyConfig,
} from '../model/barcode-symbologies';
import styles from './barcode-controls.module.css';

type BarcodeSymbologiesControlsProps = {
  barcodeInput: string;
  capacityWarning: boolean;
  currentSymbology: SymbologyConfig;
  dpr: number;
  remainingChars: number | null;
  selectedBarcodeType: BarcodeType;
  selectedErrorCorrectionLevel: ErrorCorrectionLevel;
  symbologyOptions: ReadonlyDeep<Option[]>;
  handleOnChangeBarcodeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleOnChangeBarcodeSymbology: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeBarcodeType: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeDpr: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeErrorCorrectionLevel: (
    e: ChangeEvent<HTMLSelectElement>,
  ) => void;
};

const DPR_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: '1x', value: '1' },
  { label: '2x', value: '2' },
  { label: '3x', value: '3' },
  { label: '4x', value: '4' },
];

const EC_LEVEL_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: 'L (Low)', value: ErrorCorrectionLevel.L },
  { label: 'M (Medium)', value: ErrorCorrectionLevel.M },
  { label: 'Q (Quartile)', value: ErrorCorrectionLevel.Q },
  { label: 'H (High)', value: ErrorCorrectionLevel.H },
];

const BARCODE_TYPE_OPTIONS: ReadonlyDeep<Option[]> = Object.entries(
  BARCODE_TYPE_LABELS,
).map(([value, label]) => ({
  label,
  value,
}));

function composeCounter(length: number, remainingChars: number | null): string {
  if (remainingChars === null) {
    throw new Error('Invalid remainingChars value');
  }
  return `${length} / ${length + Math.max(0, remainingChars)}`;
}

function BarcodeControls({
  barcodeInput,
  capacityWarning,
  currentSymbology,
  dpr,
  remainingChars,
  selectedBarcodeType,
  selectedErrorCorrectionLevel,
  symbologyOptions,
  handleOnChangeBarcodeInput,
  handleOnChangeBarcodeSymbology,
  handleOnChangeBarcodeType,
  handleOnChangeDpr,
  handleOnChangeErrorCorrectionLevel,
}: BarcodeSymbologiesControlsProps): JSX.Element {
  const { allowedPattern, inputMode, inputType, type, value, maxInputLength } =
    currentSymbology;
  const isMatrix2D = type === BarcodeType.Matrix2D;
  const isEcLevelSelectDisabled = !isMatrix2D;
  const counter =
    remainingChars !== null
      ? composeCounter(barcodeInput.length, remainingChars)
      : undefined;
  const helperText = capacityWarning
    ? 'Maximum capacity reached for this text format.'
    : undefined;

  return (
    <>
      <div className={styles.row}>
        <Select
          handleOnSelectChange={handleOnChangeBarcodeType}
          label="Barcode Type"
          options={BARCODE_TYPE_OPTIONS}
          value={selectedBarcodeType}
        />
      </div>
      <div className={styles.row}>
        <Select
          handleOnSelectChange={handleOnChangeBarcodeSymbology}
          label="Symbology"
          options={symbologyOptions}
          value={value}
        />
      </div>
      <div className={styles.row}>
        <Select
          disabled={isEcLevelSelectDisabled}
          handleOnSelectChange={handleOnChangeErrorCorrectionLevel}
          label="Error Correction Level"
          options={EC_LEVEL_OPTIONS}
          value={selectedErrorCorrectionLevel}
        />
        <Select
          handleOnSelectChange={handleOnChangeDpr}
          label="Device Pixel Ratio"
          options={DPR_OPTIONS}
          value={`${dpr}`}
        />
      </div>
      <div className={styles.row}>
        <Input
          characterCount={counter}
          handleOnChange={handleOnChangeBarcodeInput}
          helperText={helperText}
          helperTextVariant="warning"
          inputMode={inputMode}
          label="Barcode Data"
          maxLength={maxInputLength}
          name="barcode-data-input"
          pattern={allowedPattern}
          placeholder="Enter barcode data"
          type={inputType}
          value={barcodeInput}
        />
      </div>
    </>
  );
}

export default BarcodeControls;
