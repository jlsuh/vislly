#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRAPHICS_DIR="$PROJECT_ROOT/src/shared/lib/graphics"
BARCODE_LIB_DIR="$PROJECT_ROOT/src/entities/barcode-symbologies/lib"
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
    "-Wl,--export-memory"
    "-Wl,--export=get_data_buffer"
    "-Wl,--export=get_height"
    "-Wl,--export=get_pixel_buffer"
    "-Wl,--export=get_width"
    "-Wl,--export=pixels"
    "-Wl,--export=render"
    "-Wl,--export=set_dpr"
)

FLAGS=(
    "--target=wasm32"
    "-O3"
    "-flto"
    "-nostdlib"
    "-Wall"
    "-Wextra"
    "-Wpedantic"
    "-Wconversion"
    "-Wl,--no-entry"
    "${EXPORTS[@]}"
    "-Wl,--lto-O3"
    "-I$GRAPHICS_DIR"
    "-I$BARCODE_LIB_DIR"
)

if [[ "$LINK_DYNAMIC" == "true" ]]; then
    echo "Dynamic Linking graphics.c"
    FLAGS+=("-Wl,--allow-undefined")
    FLAGS+=("-Wl,--import-memory")
    SOURCES=("$INPUT_SRC" "$BARCODE_LIB_DIR/barcode.c")
else
    echo "Static Linking graphics.c"
    SOURCES=("$INPUT_SRC" "$GRAPHICS_DIR/graphics.c" "$BARCODE_LIB_DIR/barcode.c")
fi

echo "Compiling $FILENAME"
"$CC" "${FLAGS[@]}" -o "$OUT_WASM" "${SOURCES[@]}"

echo "Built: $OUT_WASM"
