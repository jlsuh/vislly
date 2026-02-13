'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  type JSX,
  Suspense,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReadonlyDeep } from 'type-fest';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import type { Option } from '@/shared/model/option.ts';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import { fetchBarcodeWasm } from '../lib/barcode-wasm';
import {
  assertIsBarcodeSymbology,
  BARCODE_OPTIONS,
  BARCODE_SYMBOLOGIES,
  type BarcodeSymbology,
  INITIAL_SYMBOLOGY,
} from '../model/barcode-symbologies';
import styles from './barcode-symbologies.module.css';

const DPR_OPTIONS: ReadonlyDeep<Option[]> = [
  { label: '1x', value: '1' },
  { label: '2x', value: '2' },
  { label: '3x', value: '3' },
  { label: '4x', value: '4' },
];

const LOADING_DIMENSIONS: Record<
  BarcodeSymbology,
  { width: number; height: number }
> = {
  'code-128': { width: 140, height: 160 },
  'ean-13': { width: 380, height: 184 },
};

const QUIET_ZONE_HORIZONTAL_PX = 80;

const MAX_INPUT_LENGTHS: Record<BarcodeSymbology, number> = {
  'code-128': 64,
  'ean-13': 12,
};

interface BarcodeRendererProps {
  symbology: BarcodeSymbology;
  inputText: string;
  dpr: number;
}

function BarcodeRenderer({
  symbology,
  inputText,
  dpr,
}: BarcodeRendererProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeSymbology = BARCODE_SYMBOLOGIES[symbology];

  const barcodeWasm = use(fetchBarcodeWasm(activeSymbology.wasmFile));
  const maxInputLength = barcodeWasm.get_max_input_length();

  const renderBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let textToRender = inputText;
    if (activeSymbology.rightPaddingChar) {
      textToRender = textToRender.padEnd(
        maxInputLength,
        activeSymbology.rightPaddingChar,
      );
    }
    barcodeWasm.set_dpr(dpr);
    const inputPtr = barcodeWasm.get_data_buffer();
    const wasmMem = new Uint8Array(barcodeWasm.memory.buffer);
    for (let i = 0; i < textToRender.length; i += 1) {
      wasmMem[inputPtr + i] = textToRender.charCodeAt(i);
    }
    wasmMem[inputPtr + textToRender.length] = 0;
    barcodeWasm.render();
    const width = barcodeWasm.get_width();
    const height = barcodeWasm.get_height();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width / dpr}px`;
    const pixelPtr = barcodeWasm.get_pixel_buffer();
    const pixelData = new Uint8ClampedArray(
      barcodeWasm.memory.buffer,
      pixelPtr,
      width * height * 4,
    );
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [activeSymbology, barcodeWasm, dpr, inputText, maxInputLength]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

interface BarcodeLoadingProps {
  style?: CSSProperties;
}

function BarcodeLoading({ style }: BarcodeLoadingProps): JSX.Element {
  return <div className={styles.loadingCanvas} style={style} />;
}

function BarcodeSymbologies(): JSX.Element {
  const [dpr, setDpr] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [inputText, setInputText] = useState('');
  const [symbology, setSymbology] =
    useState<BarcodeSymbology>(INITIAL_SYMBOLOGY);

  const activeSymbology = BARCODE_SYMBOLOGIES[symbology];
  const dimensions = LOADING_DIMENSIONS[symbology];
  const maxInputLength = MAX_INPUT_LENGTHS[symbology];

  const totalRenderedWidth = dimensions.width + QUIET_ZONE_HORIZONTAL_PX;
  const maxWidthPercentage = (dimensions.width / totalRenderedWidth) * 100;

  const aspectRatio = `${dimensions.width} / ${dimensions.height}`;

  const loadingStyle: CssCustomProperty = {
    ...composeCssCustomProperty(
      'loading-barcode-width',
      `${dimensions.width}px`,
    ),
    ...composeCssCustomProperty('loading-aspect-ratio', aspectRatio),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
  };

  const handleOnChangeBarcodeSymbology = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSymbology = e.target.value;
    assertIsBarcodeSymbology(newSymbology);
    setSymbology(newSymbology);
    setInputText('');
  };

  const handleOnChangeDpr = (e: ChangeEvent<HTMLSelectElement>) => {
    setDpr(+e.target.value);
  };

  const handleOnChangeBarcodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const regex = new RegExp(`^${activeSymbology.allowedPattern}$`);
    if (regex.test(val)) {
      setInputText(val);
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
            value={symbology}
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
          inputMode={activeSymbology.inputMode}
          label="Barcode Data"
          maxLength={maxInputLength}
          name="barcode-data-input"
          pattern={activeSymbology.allowedPattern}
          placeholder="Enter barcode data"
          type={activeSymbology.type}
          value={inputText}
        />
      </div>
      <div className={styles.canvasWrapper}>
        <Suspense fallback={<BarcodeLoading style={loadingStyle} />}>
          <BarcodeRenderer
            dpr={dpr}
            inputText={inputText}
            symbology={symbology}
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
