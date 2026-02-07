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

interface Barcode128 {
  memory: WebAssembly.Memory;
  get_max_input_length: () => number;
  set_dpr: (dpr: number) => void;
  get_data_buffer: () => number;
  render: () => void;
  get_width: () => number;
  get_height: () => number;
  get_pixel_buffer: () => number;
}

let barcode128Wasm: Promise<Barcode128> | null = null;

function fetchBarcode128Wasm(): Promise<Barcode128> {
  if (!barcode128Wasm) {
    barcode128Wasm = (async () => {
      const response = await fetch('/vislly/wasm/barcode_128.wasm');
      if (!response.ok) {
        throw new Error(
          `Failed to load WASM: ${response.status} ${response.statusText}`,
        );
      }
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes);
      return instance.exports as unknown as Barcode128;
    })();
  }
  return barcode128Wasm;
}

function BarcodeSymbologies(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wasmModule = use(fetchBarcode128Wasm());
  const maxInputLength = wasmModule.get_max_input_length();
  const [inputText, setInputText] = useState('');
  const [scale, setScale] = useState(
    Math.min(Math.ceil(window.devicePixelRatio || 1), 4),
  );
  const scaleSelectId = useId();

  const renderBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    wasmModule.set_dpr(scale);
    const inputPtr = wasmModule.get_data_buffer();
    const wasmMem = new Uint8Array(wasmModule.memory.buffer);
    for (let i = 0; i < inputText.length; i++) {
      wasmMem[inputPtr + i] = inputText.charCodeAt(i);
    }
    wasmMem[inputPtr + inputText.length] = 0;
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
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(pixelData, width, height);
      ctx.putImageData(imageData, 0, 0);
    }
  }, [inputText, scale, wasmModule]);

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
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          name="data"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={maxInputLength}
          placeholder="Enter data"
          title={`Max buffer: ${maxInputLength} chars`}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#333',
            color: 'white',
            fontFamily: 'monospace',
          }}
        />
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
  );
}

export default BarcodeSymbologies;
