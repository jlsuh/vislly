'use client';

import {
  type ChangeEvent,
  type JSX,
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  composeTotalCapacity,
  evaluateCapacitySync,
} from '../lib/barcode-capacity.ts';
import {
  findInsertionDiff,
  findMaxValidText,
  sanitizeInput,
} from '../lib/barcode-input.ts';
import { type BaseBarcodeWasm, fetchBarcodeWasm } from '../lib/barcode-wasm.ts';
import {
  assertIsBarcodeSymbology,
  assertIsBarcodeType,
  assertIsErrorCorrectionLevel,
  BARCODE_SYMBOLOGIES,
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

function BarcodeSymbologies(): JSX.Element {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeWasm, setBarcodeWasm] = useState<BaseBarcodeWasm | null>(null);
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [remainingBits, setRemainingBits] = useState<number | null>(null);
  const [selectedBarcodeType, setSelectedBarcodeType] =
    useState(INITIAL_BARCODE_TYPE);
  const [selectedErrorCorrectionLevel, setSelectedErrorCorrectionLevel] =
    useState(INITIAL_ERROR_CORRECTION_LEVEL);
  const [selectedSymbology, setSelectedSymbology] = useState(INITIAL_SYMBOLOGY);
  const [syncedInput, setSyncedInput] = useState('');
  const barcodeInputRef = useRef(barcodeInput);
  const deferredBarcodeInput = useDeferredValue(barcodeInput);

  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { allowedPattern } = currentSymbology;
  const symbologyOptions = SYMBOLOGY_OPTIONS_BY_TYPE[selectedBarcodeType];

  useEffect(() => {
    barcodeInputRef.current = barcodeInput;
  }, [barcodeInput]);

  const resetBarcodeData = () => {
    setBarcodeInput('');
    setSyncedInput('');
    setRemainingBits(null);
  };

  const evaluateText = (text: string) => {
    return evaluateCapacitySync(
      text,
      barcodeWasm,
      currentSymbology,
      selectedErrorCorrectionLevel,
    );
  };

  useEffect(() => {
    let shouldIgnore = false;
    const initializeWasmAndEvaluate = async () => {
      try {
        const wasm = await fetchBarcodeWasm(
          currentSymbology.wasmFile,
          currentSymbology.type,
        );
        if (shouldIgnore) return;
        setBarcodeWasm(wasm);
        const currentInput = barcodeInputRef.current;
        const bits = evaluateCapacitySync(
          currentInput,
          wasm,
          currentSymbology,
          selectedErrorCorrectionLevel,
        );
        if (bits < 0) {
          const { validText, bits: optimalBits } = findMaxValidText({
            evaluateFn: (text: string) =>
              evaluateCapacitySync(
                text,
                wasm,
                currentSymbology,
                selectedErrorCorrectionLevel,
              ),
            inserted: currentInput,
            pattern: allowedPattern,
            prefix: '',
            suffix: '',
          });
          setBarcodeInput(validText);
          setSyncedInput(validText);
          setRemainingBits(optimalBits);
        } else {
          setRemainingBits(bits);
          setSyncedInput(currentInput);
        }
      } catch (error) {
        if (!shouldIgnore) {
          console.error('Failed to load or evaluate Barcode WASM:', error);
        }
      }
    };
    initializeWasmAndEvaluate();
    return () => {
      shouldIgnore = true;
    };
  }, [currentSymbology, selectedErrorCorrectionLevel, allowedPattern]);

  const totalCapacity = composeTotalCapacity(
    remainingBits,
    currentSymbology.type,
    syncedInput,
  );

  const handleOnChangeBarcodeType = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    assertIsBarcodeType(newType);
    setSelectedBarcodeType(newType);
    setSelectedSymbology(DEFAULT_SYMBOLOGY_BY_TYPE[newType]);
    resetBarcodeData();
  };

  const handleOnChangeBarcodeSymbology = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSymbology = e.target.value;
    assertIsBarcodeSymbology(newSymbology);
    setSelectedSymbology(newSymbology);
    resetBarcodeData();
  };

  const handleOnChangeDpr = (e: ChangeEvent<HTMLSelectElement>) =>
    setDpr(+e.target.value);

  const handleOnChangeErrorCorrectionLevel = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLevel = e.target.value;
    assertIsErrorCorrectionLevel(newLevel);
    setSelectedErrorCorrectionLevel(newLevel);
  };

  const handleOnChangeBarcodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const sanitizedInput = sanitizeInput(target.value, allowedPattern);
    if (sanitizedInput === barcodeInput) {
      target.value = barcodeInput;
      return;
    }
    const bits = evaluateText(sanitizedInput);
    if (bits >= 0) {
      setBarcodeInput(sanitizedInput);
      setRemainingBits(bits);
      setSyncedInput(sanitizedInput);
      return;
    }
    const { prefix, suffix, inserted } = findInsertionDiff(
      barcodeInput,
      sanitizedInput,
    );
    if (inserted.length === 0 || !barcodeWasm) {
      target.value = barcodeInput;
      return;
    }
    const {
      validText,
      bits: optimalBits,
      insertedLength,
    } = findMaxValidText({
      evaluateFn: evaluateText,
      inserted,
      pattern: allowedPattern,
      prefix,
      suffix,
    });
    setBarcodeInput(validText);
    setRemainingBits(optimalBits);
    setSyncedInput(validText);
    setTimeout(() => {
      const newPos = prefix.length + insertedLength;
      target.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <BarcodeControls
          barcodeInput={barcodeInput}
          currentSymbology={currentSymbology}
          dpr={dpr}
          selectedBarcodeType={selectedBarcodeType}
          selectedErrorCorrectionLevel={selectedErrorCorrectionLevel}
          symbologyOptions={symbologyOptions}
          totalCapacity={totalCapacity}
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
