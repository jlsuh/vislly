const WASM_BASE_PATH = '/vislly/wasm';

async function fetchBytes(fileName: string): Promise<ArrayBuffer> {
  const response = await fetch(`${WASM_BASE_PATH}/${fileName}`);
  if (!response.ok) {
    throw new Error(
      `Failed to load WASM (${fileName}): ${response.status} ${response.statusText}`,
    );
  }
  return response.arrayBuffer();
}

async function fetchWasmModule(fileName: string): Promise<WebAssembly.Module> {
  const bytes = await fetchBytes(fileName);
  return WebAssembly.compile(bytes);
}

export { fetchWasmModule };
