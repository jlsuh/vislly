'use client';

import { type ChangeEvent, type JSX, Suspense, useState } from 'react';
import {
  assertIsBarcodeSymbology,
  BARCODE_SYMBOLOGIES,
  type BarcodeSymbology,
  INITIAL_SYMBOLOGY,
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
  const [selectedSymbology, setSelectedSymbology] =
    useState<BarcodeSymbology>(INITIAL_SYMBOLOGY);
  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { allowedPattern } = currentSymbology;

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
          handleOnChangeBarcodeInput={handleOnChangeBarcodeInput}
          handleOnChangeBarcodeSymbology={handleOnChangeBarcodeSymbology}
          handleOnChangeDpr={handleOnChangeDpr}
          selectedSymbology={selectedSymbology}
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
