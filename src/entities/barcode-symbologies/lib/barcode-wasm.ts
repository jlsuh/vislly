import type { ReadonlyDeep } from 'type-fest';
import { keysFromObject } from '@/shared/lib/array.ts';
import { fetchWasmModule } from '@/shared/lib/wasm.ts';

const GRAPHICS_LIB = 'graphics.wasm';
const INITIAL_MEMORY_PAGES = 1024;

interface BarcodeWasm {
  memory: WebAssembly.Memory;
  get_data_buffer: () => number;
  get_height: () => number;
  get_max_input_length: () => number;
  get_module_width: () => number;
  get_pixel_buffer: () => number;
  get_width: () => number;
  render: () => void;
  set_dpr: (newDpr: number) => void;
}

const BARCODE_REQUIRED_FUNCTIONS: ReadonlyDeep<
  Exclude<keyof BarcodeWasm, 'memory'>[]
> = keysFromObject({
  get_data_buffer: true,
  get_height: true,
  get_max_input_length: true,
  get_module_width: true,
  get_pixel_buffer: true,
  get_width: true,
  render: true,
  set_dpr: true,
});

const graphicsLibCache = new Map<string, Promise<WebAssembly.Module>>();
const barcodesCache = new Map<string, Promise<BarcodeWasm>>();

function assertIsBarcodeWasm(value: unknown): asserts value is BarcodeWasm {
  if (typeof value !== 'object' || value === null) {
    throw new Error('WASM exports is not an object');
  }
  const exports = value as Record<string, unknown>;
  for (const fnName of BARCODE_REQUIRED_FUNCTIONS) {
    if (typeof exports[fnName] !== 'function') {
      throw new Error(`Missing required export function "${fnName}"`);
    }
  }
  if (!('memory' in exports && exports.memory instanceof WebAssembly.Memory)) {
    throw new Error('Missing exported memory');
  }
}

function fetchGraphicsLibWasm(): Promise<WebAssembly.Module> {
  let graphicsLibPromise = graphicsLibCache.get(GRAPHICS_LIB);
  if (!graphicsLibPromise) {
    graphicsLibPromise = fetchWasmModule(GRAPHICS_LIB);
    graphicsLibCache.set(GRAPHICS_LIB, graphicsLibPromise);
  }
  return graphicsLibPromise;
}

async function instantiateBarcodeWasm(fileName: string): Promise<BarcodeWasm> {
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
  assertIsBarcodeWasm(exports);
  return exports;
}

function fetchBarcodeWasm(fileName: string): Promise<BarcodeWasm> {
  let barcodePromise = barcodesCache.get(fileName);
  if (!barcodePromise) {
    barcodePromise = instantiateBarcodeWasm(fileName);
    barcodesCache.set(fileName, barcodePromise);
  }
  return barcodePromise;
}

export { fetchBarcodeWasm, type BarcodeWasm };
