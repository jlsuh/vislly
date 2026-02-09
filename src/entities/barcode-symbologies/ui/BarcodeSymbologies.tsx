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
  }, [activeSymbology, inputText, scale, barcodeWasm]);

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
            onChange={handleOnChangeBarcodeSymbology}
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
