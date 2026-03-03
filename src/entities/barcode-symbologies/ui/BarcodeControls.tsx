import type { ChangeEvent, JSX } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import {
  BARCODE_TYPE_LABELS,
  type BarcodeType,
  type SymbologyConfig,
} from '../model/barcode-symbologies';
import styles from './barcode-controls.module.css';

const DPR_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: '1x', value: '1' },
  { label: '2x', value: '2' },
  { label: '3x', value: '3' },
  { label: '4x', value: '4' },
];

const BARCODE_TYPE_OPTIONS: ReadonlyDeep<Option[]> = Object.entries(
  BARCODE_TYPE_LABELS,
).map(([value, label]) => ({
  label,
  value,
}));

type BarcodeSymbologiesControlsProps = {
  barcodeInput: string;
  currentSymbology: SymbologyConfig;
  dpr: number;
  selectedBarcodeType: BarcodeType;
  symbologyOptions: ReadonlyDeep<Option[]>;
  handleOnChangeBarcodeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleOnChangeBarcodeSymbology: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeBarcodeType: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeDpr: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function BarcodeControls({
  barcodeInput,
  currentSymbology,
  dpr,
  selectedBarcodeType,
  symbologyOptions,
  handleOnChangeBarcodeInput,
  handleOnChangeBarcodeSymbology,
  handleOnChangeBarcodeType,
  handleOnChangeDpr,
}: BarcodeSymbologiesControlsProps): JSX.Element {
  const { allowedPattern, inputMode, maxInputLength, inputType, value } =
    currentSymbology;

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
        <Select
          handleOnSelectChange={handleOnChangeDpr}
          label="Device Pixel Ratio"
          options={DPR_OPTIONS}
          value={`${dpr}`}
        />
      </div>
      <div className={styles.row}>
        <Input
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
