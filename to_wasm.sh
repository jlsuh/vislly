#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRAPHICS_DIR="$PROJECT_ROOT/src/shared/lib/graphics"
OUT_DIR="$PROJECT_ROOT/public/wasm"
CC="${CC:-clang}"

INPUT_SRC="$1"

if [[ -z "$INPUT_SRC" ]]; then
    echo "Usage: ./to_wasm.sh <path_to_c_file>"
    exit 1
fi

FILENAME=$(basename "$INPUT_SRC" .c)
OUT_WASM="$OUT_DIR/${FILENAME}.wasm"

mkdir -p "$OUT_DIR"

EXPORTS=(
    "-Wl,--export=render"
    "-Wl,--export=pixels"
    "-Wl,--export-memory"
    "-Wl,--export=get_data_buffer"
    "-Wl,--export=get_pixel_buffer"
    "-Wl,--export=get_width"
    "-Wl,--export=get_height"
    "-Wl,--export=get_max_input_length"
    "-Wl,--export=set_dpr"
)

FLAGS=(
    "--target=wasm32"
    "-O3"
    "-flto"
    "-nostdlib"
    "-Wl,--no-entry"
    "${EXPORTS[@]}"
    "-Wl,--allow-undefined"
    "-I$GRAPHICS_DIR" 
)

echo "Compiling $FILENAME"
"$CC" "${FLAGS[@]}" -o "$OUT_WASM" "$INPUT_SRC" "$GRAPHICS_DIR/graphics.c"

echo "Built: $OUT_WASM"
