import { keysFromObject } from '@/shared/lib/array.ts';
import { fetchWasmModule } from '@/shared/lib/wasm.ts';
import '@/shared/polyfill/upsert.ts';
import type { ReadonlyDeep } from 'type-fest';
import { BarcodeType } from '../model/barcode-symbologies.ts';

const GRAPHICS_LIB = 'graphics.wasm';
const INITIAL_MEMORY_PAGES = 1024;

interface BaseBarcodeWasm {
  memory: WebAssembly.Memory;
  get_data_buffer: () => number;
  get_height: () => number;
  get_pixel_buffer: () => number;
  get_width: () => number;
  render: () => void;
  set_dpr: (newDpr: number) => void;
}

interface Matrix2DBarcodeWasm extends BaseBarcodeWasm {
  set_error_correction_level: (level: number) => void;
}

type BarcodeWasmMap = {
  [BarcodeType.Linear]: BaseBarcodeWasm;
  [BarcodeType.Matrix2D]: Matrix2DBarcodeWasm;
};

const BASE_REQUIRED_FUNCTIONS: ReadonlyDeep<
  Exclude<keyof BaseBarcodeWasm, 'memory'>[]
> = keysFromObject({
  get_data_buffer: true,
  get_height: true,
  get_pixel_buffer: true,
  get_width: true,
  render: true,
  set_dpr: true,
});

const MATRIX_2D_REQUIRED_FUNCTIONS: ReadonlyDeep<
  Exclude<keyof Matrix2DBarcodeWasm, keyof BaseBarcodeWasm>[]
> = keysFromObject({
  set_error_correction_level: true,
});

const graphicsLibCache = new Map<string, Promise<WebAssembly.Module>>();
const barcodesCache = new Map<string, Promise<unknown>>();

function isMatrix2DBarcodeWasm(value: unknown): value is Matrix2DBarcodeWasm {
  return (
    typeof value === 'object' &&
    value !== null &&
    'set_error_correction_level' in value &&
    typeof value.set_error_correction_level === 'function'
  );
}

function assertIsBarcodeWasm<T extends BarcodeType>(
  value: unknown,
  barcodeType: T,
): asserts value is BarcodeWasmMap[T] {
  if (typeof value !== 'object' || value === null) {
    throw new Error('WASM exports is not an object');
  }
  const exports = value as Record<string, unknown>;
  for (const fnName of BASE_REQUIRED_FUNCTIONS) {
    if (typeof exports[fnName] !== 'function') {
      throw new Error(`Missing required export function "${fnName}"`);
    }
  }
  if (barcodeType === BarcodeType.Matrix2D) {
    for (const fnName of MATRIX_2D_REQUIRED_FUNCTIONS) {
      if (typeof exports[fnName] !== 'function') {
        throw new Error(
          `Missing required Matrix2D export function "${fnName}"`,
        );
      }
    }
  }
  if (!('memory' in exports && exports.memory instanceof WebAssembly.Memory)) {
    throw new Error('Missing exported memory');
  }
}

function fetchGraphicsLibWasm(): Promise<WebAssembly.Module> {
  return graphicsLibCache.getOrInsertComputed(GRAPHICS_LIB, fetchWasmModule);
}

async function instantiateBarcodeWasm<T extends BarcodeType>(
  fileName: string,
  barcodeType: T,
): Promise<BarcodeWasmMap[T]> {
  const [graphicsLib, barcodeModule] = await Promise.all([
    fetchGraphicsLibWasm(),
    fetchWasmModule(fileName),
  ]);
  const memory = new WebAssembly.Memory({
    initial: INITIAL_MEMORY_PAGES,
  });
  const graphicsLibInstance = await WebAssembly.instantiate(graphicsLib, {
    env: { memory },
  });
  const imports = { env: { memory, ...graphicsLibInstance.exports } };
  const instance = await WebAssembly.instantiate(barcodeModule, imports);
  const { exports } = instance;
  assertIsBarcodeWasm(exports, barcodeType);
  return exports;
}

function fetchBarcodeWasm<T extends BarcodeType>(
  fileName: string,
  barcodeType: T,
): Promise<BarcodeWasmMap[T]> {
  return barcodesCache.getOrInsertComputed(fileName, () =>
    instantiateBarcodeWasm(fileName, barcodeType),
  ) as Promise<BarcodeWasmMap[T]>;
}

export {
  fetchBarcodeWasm,
  isMatrix2DBarcodeWasm,
  type BarcodeWasmMap,
  type BaseBarcodeWasm,
  type Matrix2DBarcodeWasm,
};
