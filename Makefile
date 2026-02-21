ARCH := $(shell uname -m)
CC := clang
CFLAGS := -O3 -Wall -Wextra -Wpedantic -Wconversion
WASMFLAGS := --target=wasm32 -flto -nostdlib -mbulk-memory -Wl,--no-entry -Wl,--lto-O3
BARCODE_LIB_DIR := src/entities/barcode-symbologies/lib
SHARED_GRAPHICS_DIR := src/shared/lib/graphics
GRAPHICS_SRC := $(SHARED_GRAPHICS_DIR)/graphics.c
GRAPHICS_WASM := public/wasm/graphics.wasm
TO_WASM_SCRIPT := ./to_wasm.sh
INCLUDES := -I$(BARCODE_LIB_DIR) -I$(SHARED_GRAPHICS_DIR) -Isrc/shared/lib
CFLAGS += $(INCLUDES)
BARCODE_COMMON_SRC := $(BARCODE_LIB_DIR)/barcode.c
USAGE := Usage: make pre TU=path/to/file.c
SRC := src
ALL_HEADER_FILES := $(shell find $(SRC) -type f -name "*.h")
ALL_SRC_FILES := $(shell find $(SRC) -type f -name "*.c")
QR_TEST_OUT := $(BARCODE_LIB_DIR)/qr_code_tests.out

ifeq ($(ARCH),x86_64)
	ASM_DIALECT := -masm=intel
else
	ASM_DIALECT :=
endif

.PHONY: bar prebar asmbar graphics tidy qrtest

graphics:
	@echo "Building $(GRAPHICS_WASM)"
	@mkdir -p $(dir $(GRAPHICS_WASM))
	$(CC) $(WASMFLAGS) $(CFLAGS) -Wl,--export-all -Wl,--import-memory -Wl,--strip-all -o $(GRAPHICS_WASM) $(GRAPHICS_SRC)
	@echo "Built: $(GRAPHICS_WASM)\n"

bar: graphics
	CC="$(CC)" CFLAGS="$(CFLAGS)" WASMFLAGS="$(WASMFLAGS)" LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/code_128.c $(BARCODE_COMMON_SRC)
	CC="$(CC)" CFLAGS="$(CFLAGS)" WASMFLAGS="$(WASMFLAGS)" LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/ean_13.c $(BARCODE_COMMON_SRC)
	CC="$(CC)" CFLAGS="$(CFLAGS)" WASMFLAGS="$(WASMFLAGS)" LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/itf_14.c $(BARCODE_COMMON_SRC)

prebar:
	$(if $(TU),,$(error $(USAGE)))
	$(CC) -E -P $(TU) $(INCLUDES)

asmbar:
	$(if $(TU),,$(error $(USAGE)))
	@echo "Architecture: $(ARCH)"
	$(CC) -S $(ASM_DIALECT) $(CFLAGS) $(TU) -o -

tidy:
	clang-format -i $(ALL_SRC_FILES) $(ALL_HEADER_FILES)
	clang-tidy --fix $(ALL_SRC_FILES) -- $(INCLUDES)

qrtest:
	@$(CC) $(CFLAGS) $(BARCODE_LIB_DIR)/qr_code_tests.c $(BARCODE_COMMON_SRC) $(GRAPHICS_SRC) -o $(QR_TEST_OUT)
	@./$(QR_TEST_OUT); EXIT_STATUS=$$?; rm -f $(QR_TEST_OUT); exit $$EXIT_STATUS
