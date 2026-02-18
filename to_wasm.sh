#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$PROJECT_ROOT/public/wasm"
CC="${CC:-clang}"
CFLAGS="${CFLAGS:-}"
WASMFLAGS="${WASMFLAGS:-}"
SOURCES=("$@")

if [[ ${#SOURCES[@]} -eq 0 ]]; then
    echo "Usage: ./to_wasm.sh <source_file_1> [source_file_2 ...]"
    exit 1
fi

FIRST_SRC="${SOURCES[0]}"
LIB_SOURCES="${SOURCES[*]:1}"
LIB_TARGET="${LIB_SOURCES:-None}"
FILENAME=$(basename "$FIRST_SRC" .c)
OUT_WASM="$OUT_DIR/${FILENAME}.wasm"

mkdir -p "$OUT_DIR"

EXPORTS=(
    "-Wl,--export-memory"
    "-Wl,--export=get_data_buffer"
    "-Wl,--export=get_height"
    "-Wl,--export=get_pixel_buffer"
    "-Wl,--export=get_width"
    "-Wl,--export=render"
    "-Wl,--export=set_dpr"
)

read -ra ENV_CFLAGS <<<"$CFLAGS"
read -ra ENV_WASM_FLAGS <<<"$WASMFLAGS"

FLAGS=(
    "${ENV_CFLAGS[@]}"
    "${ENV_WASM_FLAGS[@]}"
    "${EXPORTS[@]}"
)

if [[ "$LINK_DYNAMIC" == "true" ]]; then
    echo "Dynamic Linking against: $LIB_TARGET"
    FLAGS+=("-Wl,--allow-undefined")
    FLAGS+=("-Wl,--import-memory")
else
    echo "Static Linking against: $LIB_TARGET"
fi

echo "Compiling $FILENAME"

"$CC" "${FLAGS[@]}" -o "$OUT_WASM" "${SOURCES[@]}"

echo -e "Built: ${OUT_WASM#"$PROJECT_ROOT"/}\n"
