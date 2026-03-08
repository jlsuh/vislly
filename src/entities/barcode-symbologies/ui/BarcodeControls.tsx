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
).map(([value, label]) => ({ label, value }));

function composeCounter(length: number, remainingChars: number): string {
  return `${length} / ${length + Math.max(0, remainingChars)}`;
}

function useCounterDisplay(counter: string | undefined, isAtMaxLimit: boolean) {
  const [debouncedCounter, setDebouncedCounter] = useState<string | undefined>(
    counter,
  );
  const [isForceCleared, setIsForceCleared] = useState(false);

  useEffect(() => {
    if (counter === undefined) return;
    if (counter === debouncedCounter) return;
    const timeoutId = setTimeout(() => setDebouncedCounter(counter), 150);
    return () => clearTimeout(timeoutId);
  }, [counter, debouncedCounter]);

  useEffect(() => {
    if (!isAtMaxLimit) {
      setIsForceCleared(false);
      return;
    }
    let rafId: number;
    const forceClear = (frame: number) => {
      if (frame > 10) {
        setIsForceCleared(true);
      } else {
        rafId = requestAnimationFrame(() => forceClear(frame + 1));
      }
    };
    rafId = requestAnimationFrame(() => forceClear(0));
    return () => cancelAnimationFrame(rafId);
  }, [isAtMaxLimit]);

  const isCalculating =
    counter !== undefined && !isForceCleared && counter !== debouncedCounter;

  return isCalculating
    ? 'Calculating...'
    : isAtMaxLimit
      ? counter
      : debouncedCounter;
}

function BarcodeControls({
  barcodeInput,
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
  const counter =
    remainingChars !== null
      ? composeCounter(barcodeInput.length, remainingChars)
      : undefined;
  const isAtMaxLimit = remainingChars !== null && remainingChars <= 0;
  const displayCounter = useCounterDisplay(counter, isAtMaxLimit);
  const characterCount =
    remainingChars === null ? 'Calculating...' : displayCounter;

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
