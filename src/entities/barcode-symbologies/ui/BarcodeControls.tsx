import type { ChangeEvent, JSX } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import {
  BARCODE_OPTIONS,
  type BarcodeSymbology,
  type SymbologyConfig,
} from '../model/barcode-symbologies';
import styles from './barcode-controls.module.css';

const DPR_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: '1x', value: '1' },
  { label: '2x', value: '2' },
  { label: '3x', value: '3' },
  { label: '4x', value: '4' },
];

type BarcodeSymbologiesControlsProps = {
  barcodeInput: string;
  currentSymbology: SymbologyConfig;
  dpr: number;
  handleOnChangeBarcodeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleOnChangeBarcodeSymbology: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleOnChangeDpr: (e: ChangeEvent<HTMLSelectElement>) => void;
  selectedSymbology: BarcodeSymbology;
};

function BarcodeControls({
  barcodeInput,
  currentSymbology,
  dpr,
  handleOnChangeBarcodeInput,
  handleOnChangeBarcodeSymbology,
  handleOnChangeDpr,
  selectedSymbology,
}: BarcodeSymbologiesControlsProps): JSX.Element {
  const { allowedPattern, inputMode, maxInputLength, type } = currentSymbology;

  return (
    <>
      <div className={styles.row}>
        <Select
          handleOnSelectChange={handleOnChangeBarcodeSymbology}
          label="Barcode Type"
          options={BARCODE_OPTIONS}
          value={selectedSymbology}
        />
        <Select
          handleOnSelectChange={handleOnChangeDpr}
          label="Device Pixel Ratio"
          options={DPR_OPTIONS}
          value={`${dpr}`}
        />
      </div>
      <Input
        handleOnChange={handleOnChangeBarcodeInput}
        inputMode={inputMode}
        label="Barcode Data"
        maxLength={maxInputLength}
        name="barcode-data-input"
        pattern={allowedPattern}
        placeholder="Enter barcode data"
        type={type}
        value={barcodeInput}
      />
    </>
  );
}

export default BarcodeControls;
