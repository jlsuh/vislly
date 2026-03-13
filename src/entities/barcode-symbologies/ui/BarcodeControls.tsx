import { type ChangeEvent, type JSX, useEffect, useState } from 'react';
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
  currentSymbology: SymbologyConfig;
  dpr: number;
  selectedBarcodeType: BarcodeType;
  selectedErrorCorrectionLevel: ErrorCorrectionLevel;
  symbologyOptions: ReadonlyDeep<Option[]>;
  totalCapacity: number;
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

const CALCULATING_TEXT = 'Calculating...';

const BARCODE_TYPE_OPTIONS: ReadonlyDeep<Option[]> = Object.entries(
  BARCODE_TYPE_LABELS,
).map(([value, label]) => ({ label, value }));

function useCounterDisplay(counter: string | undefined, isAtMaxLimit: boolean) {
  const [debouncedCounter, setDebouncedCounter] = useState<string | undefined>(
    counter,
  );

  useEffect(() => {
    if (counter === undefined) return;
    if (counter === debouncedCounter) return;
    const timeoutId = setTimeout(() => setDebouncedCounter(counter), 150);
    return () => clearTimeout(timeoutId);
  }, [counter, debouncedCounter]);

  if (isAtMaxLimit) {
    return counter;
  }

  const isCalculating = counter !== undefined && counter !== debouncedCounter;

  return isCalculating ? CALCULATING_TEXT : debouncedCounter;
}

function BarcodeControls({
  barcodeInput,
  currentSymbology,
  dpr,
  selectedBarcodeType,
  selectedErrorCorrectionLevel,
  symbologyOptions,
  totalCapacity,
  handleOnChangeBarcodeInput,
  handleOnChangeBarcodeSymbology,
  handleOnChangeBarcodeType,
  handleOnChangeDpr,
  handleOnChangeErrorCorrectionLevel,
}: BarcodeSymbologiesControlsProps): JSX.Element {
  const { allowedPattern, inputMode, inputType, type, value } =
    currentSymbology;
  const isCalculatingCapacity = totalCapacity === Number.POSITIVE_INFINITY;
  const isAtMaxLimit =
    !isCalculatingCapacity && barcodeInput.length >= totalCapacity;
  const isOverLimit =
    !isCalculatingCapacity && barcodeInput.length > totalCapacity;
  const counter = !isCalculatingCapacity
    ? `${barcodeInput.length} / ${totalCapacity}`
    : undefined;
  const displayCounter = useCounterDisplay(counter, isAtMaxLimit);
  const characterCount = isCalculatingCapacity
    ? CALCULATING_TEXT
    : displayCounter;

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
          disabled={type !== BarcodeType.Matrix2D}
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
          characterCount={characterCount}
          handleOnChange={handleOnChangeBarcodeInput}
          inputMode={inputMode}
          isError={isOverLimit}
          label="Barcode Data"
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
