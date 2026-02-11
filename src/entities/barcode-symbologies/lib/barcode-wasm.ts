import type { ReadonlyDeep } from 'type-fest';
import { keysFromObject } from '@/shared/lib/array.ts';
import { fetchWasm } from '@/shared/lib/wasm';

interface BarcodeWasm {
  memory: WebAssembly.Memory;
  get_data_buffer: () => number;
  get_height: () => number;
  get_max_input_length: () => number;
  get_pixel_buffer: () => number;
  get_width: () => number;
  render: () => void;
  set_dpr: (newDpr: number) => void;
}

const REQUIRED_FUNCTIONS: ReadonlyDeep<Exclude<keyof BarcodeWasm, 'memory'>[]> =
  keysFromObject({
    get_data_buffer: true,
    get_height: true,
    get_max_input_length: true,
    get_pixel_buffer: true,
    get_width: true,
    render: true,
    set_dpr: true,
  });

const barcodeWasmCache = new Map<string, Promise<BarcodeWasm>>();

function assertIsBarcodeWasm(value: unknown): asserts value is BarcodeWasm {
  if (typeof value !== 'object' || value === null) {
    throw new Error('WASM exports is not an object');
  }
  const exports = value as Record<string, unknown>;
  for (const fnName of REQUIRED_FUNCTIONS) {
    if (typeof exports[fnName] !== 'function') {
      throw new Error(`Missing required export function "${fnName}"`);
    }
  }
  if (!('memory' in exports && exports.memory instanceof WebAssembly.Memory)) {
    throw new Error('Missing exported memory');
  }
}

function fetchBarcodeWasm(fileName: string): Promise<BarcodeWasm> {
  const cachedPromise = barcodeWasmCache.get(fileName);
  if (cachedPromise) {
    return cachedPromise;
  }
  const promise = (async () => {
    const exports = await fetchWasm(fileName);
    assertIsBarcodeWasm(exports);
    return exports;
  })();
  barcodeWasmCache.set(fileName, promise);
  return promise;
}

export { fetchBarcodeWasm, type BarcodeWasm };
