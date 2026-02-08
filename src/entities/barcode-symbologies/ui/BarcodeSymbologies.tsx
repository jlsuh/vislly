'use client';

import {
  type JSX,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { fetchBarcodeWasm } from '../lib/barcode-wasm';

const BarcodeSymbology = {
  Code128: 'code-128',
  Ean13: 'ean-13',
} as const;

type BarcodeSymbology =
  (typeof BarcodeSymbology)[keyof typeof BarcodeSymbology];

const CODE128_PATTERN = '^[\\x00-\\x7F]*$';

const BARCODE_SYMBOLOGIES: Record<
  BarcodeSymbology,
  {
    allowedChars: RegExp;
    label: string;
    paddingChar?: string;
    targetLength?: number;
    value: BarcodeSymbology;
    wasmFile: string;
  }
> = {
  [BarcodeSymbology.Code128]: {
    allowedChars: new RegExp(CODE128_PATTERN),
    label: 'Code 128',
    value: BarcodeSymbology.Code128,
    wasmFile: 'code_128.wasm',
  },
  [BarcodeSymbology.Ean13]: {
    allowedChars: /^[0-9]*$/,
    label: 'EAN-13',
    paddingChar: '0',
    targetLength: 12,
    value: BarcodeSymbology.Ean13,
    wasmFile: 'ean_13.wasm',
  },
} as const;

const INITIAL_SYMBOLOGY = BarcodeSymbology.Code128;

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
  const wasmModule = use(fetchBarcodeWasm(activeSymbology.wasmFile));
  const maxInputLength = wasmModule.get_max_input_length();

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
    wasmModule.set_dpr(scale);
    const inputPtr = wasmModule.get_data_buffer();
    const wasmMem = new Uint8Array(wasmModule.memory.buffer);
    for (let i = 0; i < textToRender.length; i += 1) {
      wasmMem[inputPtr + i] = textToRender.charCodeAt(i);
    }
    wasmMem[inputPtr + textToRender.length] = 0;
    wasmModule.render();
    const width = wasmModule.get_width();
    const height = wasmModule.get_height();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width / scale}px`;
    const pixelPtr = wasmModule.get_pixel_buffer();
    const pixelData = new Uint8ClampedArray(
      wasmModule.memory.buffer,
      pixelPtr,
      width * height * 4,
    );
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [inputText, scale, wasmModule, activeSymbology]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label
            htmlFor={symbologySelectId}
            style={{ fontSize: '0.9rem', color: '#aaa' }}
          >
            Type:
          </label>
          <select
            id={symbologySelectId}
            value={symbology}
            onChange={(e) => {
              setSymbology(e.target.value as BarcodeSymbology);
              setInputText('');
            }}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              background: '#333',
              color: 'white',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
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
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#333',
            color: 'white',
            fontFamily: 'monospace',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label
            htmlFor={scaleSelectId}
            style={{ fontSize: '0.9rem', color: '#aaa' }}
          >
            Scale:
          </label>
          <select
            id={scaleSelectId}
            value={scale}
            onChange={(e) => setScale(+e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              background: '#333',
              color: 'white',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          background: '#000',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}

export default BarcodeSymbologies;
