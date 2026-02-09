const WASM_BASE_PATH = '/vislly/wasm';

async function fetchWasm(fileName: string): Promise<WebAssembly.Exports> {
  const response = await fetch(`${WASM_BASE_PATH}/${fileName}`);
  if (!response.ok) {
    throw new Error(
      `Failed to load WASM (${fileName}): ${response.status} ${response.statusText}`,
    );
  }
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes);
  return instance.exports;
}

export { fetchWasm };
