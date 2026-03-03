'use client';

import { type ChangeEvent, type JSX, Suspense, useState } from 'react';
import {
  assertIsBarcodeSymbology,
  assertIsBarcodeType,
  BARCODE_SYMBOLOGIES,
  DEFAULT_SYMBOLOGY_BY_TYPE,
  INITIAL_BARCODE_TYPE,
  INITIAL_SYMBOLOGY,
  SYMBOLOGY_OPTIONS_BY_TYPE,
} from '../model/barcode-symbologies';
import BarcodeCanvas from './BarcodeCanvas.tsx';
import BarcodeControls from './BarcodeControls.tsx';
import BarcodeLoadingSkeleton from './BarcodeLoadingSkeleton.tsx';
import styles from './barcode-symbologies.module.css';

function BarcodeSymbologies(): JSX.Element {
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedBarcodeType, setSelectedBarcodeType] =
    useState(INITIAL_BARCODE_TYPE);
  const [selectedSymbology, setSelectedSymbology] = useState(INITIAL_SYMBOLOGY);

  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { allowedPattern } = currentSymbology;
  const symbologyOptions = SYMBOLOGY_OPTIONS_BY_TYPE[selectedBarcodeType];

  const handleOnChangeBarcodeType = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    assertIsBarcodeType(newType);
    setSelectedBarcodeType(newType);
    setSelectedSymbology(DEFAULT_SYMBOLOGY_BY_TYPE[newType]);
    setBarcodeInput('');
  };

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
    const regex = new RegExp(`^${allowedPattern}$`);
    if (regex.test(newBarcodeInput)) {
      setBarcodeInput(newBarcodeInput);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <BarcodeControls
          barcodeInput={barcodeInput}
          currentSymbology={currentSymbology}
          dpr={dpr}
          selectedBarcodeType={selectedBarcodeType}
          symbologyOptions={symbologyOptions}
          handleOnChangeBarcodeInput={handleOnChangeBarcodeInput}
          handleOnChangeBarcodeSymbology={handleOnChangeBarcodeSymbology}
          handleOnChangeBarcodeType={handleOnChangeBarcodeType}
          handleOnChangeDpr={handleOnChangeDpr}
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
