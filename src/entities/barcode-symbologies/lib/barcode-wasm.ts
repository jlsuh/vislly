interface BarcodeWasmExports {
  memory: WebAssembly.Memory;
  get_max_input_length: () => number;
  set_dpr: (dpr: number) => void;
  get_data_buffer: () => number;
  render: () => void;
  get_width: () => number;
  get_height: () => number;
  get_pixel_buffer: () => number;
}

const wasmCache = new Map<string, Promise<BarcodeWasmExports>>();

function fetchBarcodeWasm(fileName: string): Promise<BarcodeWasmExports> {
  const cachedPromise = wasmCache.get(fileName);
  if (cachedPromise) {
    return cachedPromise;
  }
  const promise = (async () => {
    const response = await fetch(`/vislly/wasm/${fileName}`);
    if (!response.ok) {
      throw new Error(
        `Failed to load WASM (${fileName}): ${response.status} ${response.statusText}`,
      );
    }
    const bytes = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes);
    return instance.exports as unknown as BarcodeWasmExports;
  })();
  wasmCache.set(fileName, promise);
  return promise;
}

export { fetchBarcodeWasm, type BarcodeWasmExports };
