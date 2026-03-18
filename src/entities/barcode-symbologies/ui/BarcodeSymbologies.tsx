'use client';

import {
  type ChangeEvent,
  type JSX,
  Suspense,
  useDeferredValue,
  useRef,
  useState,
} from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import ButtonWithOptions from '@/shared/ui/ButtonWithOptions/ButtonWithOptions.tsx';
import DownloadIcon from '@/shared/ui/DownloadIcon/DownloadIcon.tsx';
import {
  assertIsBarcodeSymbology,
  assertIsBarcodeType,
  assertIsErrorCorrectionLevel,
  BARCODE_SYMBOLOGIES,
  type BarcodeSymbology,
  BarcodeType,
  DEFAULT_SYMBOLOGY_BY_TYPE,
  INITIAL_BARCODE_TYPE,
  INITIAL_ERROR_CORRECTION_LEVEL,
  INITIAL_SYMBOLOGY,
  SYMBOLOGY_OPTIONS_BY_TYPE,
} from '../model/barcode-symbologies';
import BarcodeCanvas from './BarcodeCanvas.tsx';
import BarcodeControls from './BarcodeControls.tsx';
import { SKELETON_BY_BARCODE_SYMBOLOGY } from './barcode-loading-skeletons.ts';
import styles from './barcode-symbologies.module.css';

const DOWNLOAD_FORMAT_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'WebP', value: 'webp' },
];

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

function getTrailingMatchLength(text: string, regex: RegExp): number {
  return text.match(regex)?.[0].length ?? 0;
}

function getKanjiCapacity(remainingBits: number, text: string): number | null {
  const trailingKanji = getTrailingMatchLength(
    text,
    /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]+$/,
  );
  if (trailingKanji === 0) return null;
  if (trailingKanji === text.length || trailingKanji >= 13) {
    return calculateModeCapacity(
      remainingBits,
      trailingKanji,
      1,
      13,
      [0],
      [{ bits: 13, items: 1 }],
    );
  }
  return null;
}

function getNumericCapacity(
  remainingBits: number,
  text: string,
): number | null {
  const trailingDigits = getTrailingMatchLength(text, /[0-9]+$/);
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
  const trailingAlpha = getTrailingMatchLength(text, /[0-9A-Z $%*+\-./:]+$/);
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
  if (text.length === 0) {
    return calculateModeCapacity(
      remainingBits,
      0,
      3,
      10,
      [2, 4, 7],
      [
        { bits: 7, items: 2 },
        { bits: 4, items: 1 },
      ],
    );
  }
  const kanjiCapacity = getKanjiCapacity(remainingBits, text);
  if (kanjiCapacity !== null) return kanjiCapacity;
  const numCapacity = getNumericCapacity(remainingBits, text);
  if (numCapacity !== null) return numCapacity;
  const alphaCapacity = getAlphanumericCapacity(remainingBits, text);
  if (alphaCapacity !== null) return alphaCapacity;
  return Math.floor(remainingBits / 8);
}

function composeTotalCapacity(
  remainingBits: number,
  barcodeType: BarcodeType,
  evaluatedText: string,
): number {
  const baseCapacity =
    barcodeType === BarcodeType.Matrix2D
      ? getMatrix2DCapacity(remainingBits, evaluatedText)
      : Math.floor(remainingBits / 8);
  return evaluatedText.length + baseCapacity;
}

function BarcodeSymbologies(): JSX.Element {
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [barcodeInput, setBarcodeInput] = useState('');
  const deferredBarcodeInput = useDeferredValue(barcodeInput);
  const [totalCapacity, setTotalCapacity] = useState(Number.POSITIVE_INFINITY);
  const [selectedBarcodeType, setSelectedBarcodeType] =
    useState(INITIAL_BARCODE_TYPE);
  const [selectedSymbology, setSelectedSymbology] = useState(INITIAL_SYMBOLOGY);
  const [selectedErrorCorrectionLevel, setSelectedErrorCorrectionLevel] =
    useState(INITIAL_ERROR_CORRECTION_LEVEL);
  const [selectedFormat, setSelectedFormat] = useState<Option>(
    DOWNLOAD_FORMAT_OPTIONS[0],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedSymbologiesRef = useRef<Set<BarcodeSymbology>>(new Set());

  const currentSymbology = BARCODE_SYMBOLOGIES[selectedSymbology];
  const { allowedPattern, value } = currentSymbology;
  const isSymbologyLoading =
    totalCapacity === Number.POSITIVE_INFINITY &&
    !loadedSymbologiesRef.current.has(selectedSymbology);
  const LoadingSkeleton = SKELETON_BY_BARCODE_SYMBOLOGY[value];
  const symbologyOptions = SYMBOLOGY_OPTIONS_BY_TYPE[selectedBarcodeType];

  const resetBarcodeData = () => {
    setBarcodeInput('');
    setTotalCapacity(Number.POSITIVE_INFINITY);
  };

  const handleProcessComplete = (bits: number, evaluatedText: string) => {
    loadedSymbologiesRef.current.add(currentSymbology.value);
    const newCapacity = composeTotalCapacity(
      bits,
      currentSymbology.type,
      evaluatedText,
    );
    setTotalCapacity(newCapacity);
  };

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

  const handleOnChangeDpr = (e: ChangeEvent<HTMLSelectElement>) => {
    setDpr(+e.target.value);
  };

  const handleOnChangeBarcodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const regex = new RegExp(`^${allowedPattern}$`);
    if (rawInput !== '' && !regex.test(rawInput)) {
      return;
    }
    setBarcodeInput(rawInput);
  };

  const handleOnChangeErrorCorrectionLevel = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLevel = e.target.value;
    assertIsErrorCorrectionLevel(newLevel);
    setSelectedErrorCorrectionLevel(newLevel);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentSymbology.value}.${selectedFormat.value}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      `image/${selectedFormat.value}`,
      1.0,
    );
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
      <div className={styles.canvasAndDownloadWrapper}>
        <div className={styles.canvasWrapper}>
          <Suspense
            fallback={<LoadingSkeleton currentSymbology={currentSymbology} />}
          >
            <BarcodeCanvas
              canvasRef={canvasRef}
              currentSymbology={currentSymbology}
              dpr={dpr}
              inputText={deferredBarcodeInput}
              selectedErrorCorrectionLevel={selectedErrorCorrectionLevel}
              onProcessComplete={handleProcessComplete}
            />
          </Suspense>
        </div>
        <div className={styles.downloadButtonWrapper}>
          <ButtonWithOptions
            disabled={isSymbologyLoading}
            icon={<DownloadIcon />}
            label="Download"
            options={DOWNLOAD_FORMAT_OPTIONS}
            selectedOption={selectedFormat}
            theme="light"
            handleOnChangeOption={setSelectedFormat}
            handleOnClickButton={handleDownload}
          />
        </div>
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
