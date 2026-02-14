'use client';

import { type ChangeEvent, type JSX, Suspense, useState } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import {
  assertIsBarcodeSymbology,
  BARCODE_OPTIONS,
  BARCODE_SYMBOLOGIES,
  type BarcodeSymbology,
  INITIAL_SYMBOLOGY,
} from '../model/barcode-symbologies';
import BarcodeCanvas from './BarcodeCanvas.tsx';
import BarcodeLoadingSkeleton from './BarcodeLoadingSkeleton.tsx';
import styles from './barcode-symbologies.module.css';

const DPR_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: '1x', value: '1' },
  { label: '2x', value: '2' },
  { label: '3x', value: '3' },
  { label: '4x', value: '4' },
];

function BarcodeSymbologies(): JSX.Element {
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedSymbology, setSelectedSymbology] =
    useState<BarcodeSymbology>(INITIAL_SYMBOLOGY);
  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { maxInputLength } = currentSymbology;

  const handleOnChangeBarcodeSymbology = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSymbology = e.target.value;
    assertIsBarcodeSymbology(newSymbology);
    setSelectedSymbology(newSymbology);
    setBarcodeInput('');
  };

  const handleOnChangeDpr = (e: ChangeEvent<HTMLSelectElement>) => {
    setDpr(+e.target.value);
  };

  const handleOnChangeBarcodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newBarcodeInput = e.target.value;
    const regex = new RegExp(`^${currentSymbology.allowedPattern}$`);
    if (regex.test(newBarcodeInput)) {
      setBarcodeInput(newBarcodeInput);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
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
          inputMode={currentSymbology.inputMode}
          label="Barcode Data"
          maxLength={maxInputLength}
          name="barcode-data-input"
          pattern={currentSymbology.allowedPattern}
          placeholder="Enter barcode data"
          type={currentSymbology.type}
          value={barcodeInput}
        />
      </div>
      <div className={styles.canvasWrapper}>
        <Suspense
          fallback={
            <BarcodeLoadingSkeleton currentSymbology={currentSymbology} />
          }
        >
          <BarcodeCanvas
            currentSymbology={currentSymbology}
            dpr={dpr}
            inputText={barcodeInput}
          />
        </Suspense>
      </div>
      <p className={styles.description}>
        ⚡️ This barcode is generated on the fly by raw{' '}
        <span className={styles.codeBadge}>C code</span> running in your browser
        via WebAssembly.{' '}
        <a
          className={styles.link}
          href="https://github.com/jlsuh/vislly/tree/dev/src/entities/barcode-symbologies/lib"
          rel="noopener noreferrer"
          target="_blank"
        >
          See the source code
        </a>
      </p>
    </div>
  );
}

export default BarcodeSymbologies;
