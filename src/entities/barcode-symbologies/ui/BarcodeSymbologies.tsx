'use client';

import {
  type ChangeEvent,
  type JSX,
  Suspense,
  useCallback,
  useDeferredValue,
  useRef,
  useState,
} from 'react';
import {
  assertIsBarcodeSymbology,
  assertIsBarcodeType,
  assertIsErrorCorrectionLevel,
  BARCODE_SYMBOLOGIES,
  BarcodeType,
  DEFAULT_SYMBOLOGY_BY_TYPE,
  INITIAL_BARCODE_TYPE,
  INITIAL_ERROR_CORRECTION_LEVEL,
  INITIAL_SYMBOLOGY,
  SYMBOLOGY_OPTIONS_BY_TYPE,
} from '../model/barcode-symbologies';
import BarcodeCanvas from './BarcodeCanvas.tsx';
import BarcodeControls from './BarcodeControls.tsx';
import BarcodeLoadingSkeleton from './BarcodeLoadingSkeleton.tsx';
import styles from './barcode-symbologies.module.css';

function calculateModeCapacity(
  remainingBits: number,
  textLength: number,
  groupSize: number,
  bitsPerGroup: number,
  refunds: number[],
  thresholds: { bits: number; items: number }[],
): number {
  const partialCount = textLength % groupSize;
  const virtualRemaining = remainingBits + (refunds[partialCount] ?? 0);
  const groups = Math.floor(virtualRemaining / bitsPerGroup);
  const leftover = virtualRemaining % bitsPerGroup;
  let extraItems = groups * groupSize;
  for (const { bits, items } of thresholds) {
    if (leftover >= bits) {
      extraItems += items;
      break;
    }
  }
  return extraItems - partialCount;
}

function getNumericCapacity(
  remainingBits: number,
  text: string,
): number | null {
  const trailingDigits = text.match(/[0-9]+$/)?.[0].length ?? 0;
  if (trailingDigits === 0) return null;
  const precedingChar = text.slice(0, -trailingDigits).slice(-1);
  const threshold = /^[A-Z $%*+\-./:]$/.test(precedingChar) ? 17 : 8;
  if (trailingDigits === text.length || trailingDigits >= threshold) {
    return calculateModeCapacity(
      remainingBits,
      trailingDigits,
      3,
      10,
      [0, 4, 7],
      [
        { bits: 7, items: 2 },
        { bits: 4, items: 1 },
      ],
    );
  }
  return null;
}

function getAlphanumericCapacity(
  remainingBits: number,
  text: string,
): number | null {
  const trailingAlpha = text.match(/[0-9A-Z $%*+\-./:]+$/)?.[0].length ?? 0;
  if (trailingAlpha === 0) return null;
  if (trailingAlpha === text.length || trailingAlpha >= 16) {
    return calculateModeCapacity(
      remainingBits,
      trailingAlpha,
      2,
      11,
      [0, 6],
      [{ bits: 6, items: 1 }],
    );
  }
  return null;
}

function getMatrix2DCapacity(remainingBits: number, text: string): number {
  const numCapacity = getNumericCapacity(remainingBits, text);
  if (numCapacity !== null) return numCapacity;
  const alphaCapacity = getAlphanumericCapacity(remainingBits, text);
  if (alphaCapacity !== null) return alphaCapacity;
  return Math.floor(remainingBits / 8);
}

function estimateEncodingCapacity(
  remainingBits: number | null,
  barcodeType: BarcodeType,
  barcodeInput: string,
  syncedInput: string = '',
): number | null {
  if (remainingBits === null) return null;
  const inputLengthDelta = barcodeInput.length - syncedInput.length;
  const baseCapacity =
    barcodeType === BarcodeType.Matrix2D
      ? getMatrix2DCapacity(remainingBits, syncedInput)
      : Math.floor(remainingBits / 8);
  return Math.max(0, baseCapacity - inputLengthDelta);
}

function BarcodeSymbologies(): JSX.Element {
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [barcodeInput, setBarcodeInput] = useState('');
  const deferredBarcodeInput = useDeferredValue(barcodeInput);
  const [syncedInput, setSyncedInput] = useState('');
  const validBarcodeInputRef = useRef('');
  const hasEclChangeRef = useRef(false);
  const [remainingBits, setRemainingBits] = useState<number | null>(null);
  const [selectedBarcodeType, setSelectedBarcodeType] =
    useState(INITIAL_BARCODE_TYPE);
  const [selectedSymbology, setSelectedSymbology] = useState(INITIAL_SYMBOLOGY);
  const [selectedErrorCorrectionLevel, setSelectedErrorCorrectionLevel] =
    useState(INITIAL_ERROR_CORRECTION_LEVEL);

  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { allowedPattern } = currentSymbology;
  const symbologyOptions = SYMBOLOGY_OPTIONS_BY_TYPE[selectedBarcodeType];

  const handleProcessComplete = useCallback(
    (bits: number, evaluatedText: string, didRollback: boolean) => {
      setRemainingBits(bits);
      setSyncedInput(evaluatedText);
      validBarcodeInputRef.current = evaluatedText;
      if (hasEclChangeRef.current) {
        setBarcodeInput(evaluatedText);
        hasEclChangeRef.current = false;
      } else if (didRollback) {
        setBarcodeInput(evaluatedText);
      }
    },
    [],
  );

  const estimatedCharsLeft = estimateEncodingCapacity(
    remainingBits,
    currentSymbology.type,
    barcodeInput,
    syncedInput,
  );

  const handleOnChangeBarcodeType = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    assertIsBarcodeType(newType);
    setSelectedBarcodeType(newType);
    setSelectedSymbology(DEFAULT_SYMBOLOGY_BY_TYPE[newType]);
    setBarcodeInput('');
    setSyncedInput('');
    validBarcodeInputRef.current = '';
    setRemainingBits(null);
  };

  const handleOnChangeBarcodeSymbology = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSymbology = e.target.value;
    assertIsBarcodeSymbology(newSymbology);
    setSelectedSymbology(newSymbology);
    setBarcodeInput('');
    setSyncedInput('');
    validBarcodeInputRef.current = '';
    setRemainingBits(null);
  };

  const handleOnChangeDpr = (e: ChangeEvent<HTMLSelectElement>) => {
    setDpr(+e.target.value);
  };

  const handleOnChangeBarcodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newBarcodeInput = e.target.value;
    const regex = new RegExp(`^${allowedPattern}$`);
    const isValidPattern =
      newBarcodeInput === '' || regex.test(newBarcodeInput);
    if (!isValidPattern) {
      e.target.value = barcodeInput;
      return;
    }
    const inputLengthDelta = newBarcodeInput.length - barcodeInput.length;
    if (inputLengthDelta < 0) {
      setBarcodeInput(newBarcodeInput);
      return;
    }
    if (estimatedCharsLeft !== null && estimatedCharsLeft <= 0) {
      e.target.value = barcodeInput;
      return;
    }
    if (inputLengthDelta > 1 && estimatedCharsLeft !== null) {
      const maxDelta = Math.max(10, estimatedCharsLeft * 4);
      if (inputLengthDelta > maxDelta) {
        const truncated = newBarcodeInput.slice(
          0,
          barcodeInput.length + maxDelta,
        );
        setBarcodeInput(truncated);
        e.target.value = truncated;
        return;
      }
    }
    setBarcodeInput(newBarcodeInput);
  };

  const handleOnChangeErrorCorrectionLevel = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLevel = e.target.value;
    assertIsErrorCorrectionLevel(newLevel);
    hasEclChangeRef.current = true;
    setSelectedErrorCorrectionLevel(newLevel);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <BarcodeControls
          barcodeInput={barcodeInput}
          currentSymbology={currentSymbology}
          dpr={dpr}
          remainingChars={estimatedCharsLeft}
          selectedBarcodeType={selectedBarcodeType}
          selectedErrorCorrectionLevel={selectedErrorCorrectionLevel}
          symbologyOptions={symbologyOptions}
          handleOnChangeBarcodeInput={handleOnChangeBarcodeInput}
          handleOnChangeBarcodeSymbology={handleOnChangeBarcodeSymbology}
          handleOnChangeBarcodeType={handleOnChangeBarcodeType}
          handleOnChangeDpr={handleOnChangeDpr}
          handleOnChangeErrorCorrectionLevel={
            handleOnChangeErrorCorrectionLevel
          }
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
            inputText={deferredBarcodeInput}
            selectedErrorCorrectionLevel={selectedErrorCorrectionLevel}
            onProcessComplete={handleProcessComplete}
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
