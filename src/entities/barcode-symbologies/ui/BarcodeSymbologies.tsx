'use client';

import {
  type ChangeEvent,
  type JSX,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { fetchBarcodeWasm } from '../lib/barcode-wasm';
import {
  assertIsBarcodeSymbology,
  BARCODE_SYMBOLOGIES,
  type BarcodeSymbology,
  INITIAL_SYMBOLOGY,
} from '../model/barcode-symbologies';
import styles from './barcode-symbologies.module.css';

function BarcodeSymbologies(): JSX.Element {
  const [scale, setScale] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const [inputText, setInputText] = useState('');
  const [symbology, setSymbology] =
    useState<BarcodeSymbology>(INITIAL_SYMBOLOGY);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaleSelectId = useId();
  const symbologySelectId = useId();

  const activeSymbology = BARCODE_SYMBOLOGIES[symbology];
  const barcodeWasm = use(fetchBarcodeWasm(activeSymbology.wasmFile));
  const maxInputLength = barcodeWasm.get_max_input_length();

  const handleOnChangeBarcodeSymbology = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSymbology = e.target.value;
    assertIsBarcodeSymbology(newSymbology);
    setSymbology(newSymbology);
    setInputText('');
  };

  const renderBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let textToRender = inputText;
    if (activeSymbology.paddingChar && activeSymbology.targetLength) {
      textToRender = textToRender.padEnd(
        activeSymbology.targetLength,
        activeSymbology.paddingChar,
      );
    }
    barcodeWasm.set_dpr(scale);
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
    canvas.style.width = `${width / scale}px`;
    const pixelPtr = barcodeWasm.get_pixel_buffer();
    const pixelData = new Uint8ClampedArray(
      barcodeWasm.memory.buffer,
      pixelPtr,
      width * height * 4,
    );
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [activeSymbology, barcodeWasm, inputText, scale]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor={symbologySelectId} className={styles.label}>
            Type:
          </label>
          <select
            id={symbologySelectId}
            value={symbology}
            onChange={handleOnChangeBarcodeSymbology}
            className={styles.select}
          >
            {Object.values(BARCODE_SYMBOLOGIES).map((config) => (
              <option key={config.value} value={config.value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          name="data"
          value={inputText}
          onChange={(e) => {
            const val = e.target.value;
            if (activeSymbology.allowedChars.test(val)) {
              setInputText(val);
            }
          }}
          maxLength={maxInputLength}
          placeholder="Enter data"
          className={styles.input}
        />
        <div className={styles.controlGroup}>
          <label htmlFor={scaleSelectId} className={styles.label}>
            Scale:
          </label>
          <select
            id={scaleSelectId}
            value={scale}
            onChange={(e) => setScale(+e.target.value)}
            className={styles.select}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <p className={styles.description}>
        ⚡️ This barcode is generated on the fly by raw{' '}
        <span className={styles.codeBadge}>C code</span> running in your browser
        via WebAssembly.{' '}
        <a
          href="https://github.com/jlsuh/vislly/tree/dev/src/entities/barcode-symbologies/lib"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          See the source code
        </a>
      </p>
    </div>
  );
}

export default BarcodeSymbologies;
