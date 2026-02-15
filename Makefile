ARCH := $(shell uname -m)
CC := gcc
CFLAGS := -O3 -Wall -Wextra -Wpedantic
BARCODE_LIB_DIR := src/entities/barcode-symbologies/lib
SHARED_GRAPHICS_DIR := src/shared/lib/graphics
GRAPHICS_SRC := $(SHARED_GRAPHICS_DIR)/graphics.c
GRAPHICS_WASM := public/wasm/graphics.wasm
TO_WASM_SCRIPT := ./to_wasm.sh
USAGE := Usage: make pre TU=path/to/file.c

ifeq ($(ARCH),x86_64)
	ASM_DIALECT := -masm=intel
else
	ASM_DIALECT :=
endif

.PHONY: bar prebar asmbar graphics

graphics:
	@echo "Building $(GRAPHICS_WASM)"
	@mkdir -p $(dir $(GRAPHICS_WASM))
	$(CC) --target=wasm32 -O3 -flto -nostdlib \
		-mbulk-memory -Wall -Wextra -Wpedantic \
		-Wl,--no-entry -Wl,--export-all -Wl,--import-memory \
		-Wl,--lto-O3 -Wl,--strip-all \
		-I$(SHARED_GRAPHICS_DIR) \
		-o $(GRAPHICS_WASM) $(GRAPHICS_SRC)
	@echo "Built: $(GRAPHICS_WASM)"

bar: graphics
	LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/code_128.c
	LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/ean_13.c
	LINK_DYNAMIC=true $(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/itf_14.c

prebar:
	$(if $(TU),,$(error $(USAGE)))
	$(CC) -E -P $(TU) -I $(BARCODE_LIB_DIR) -I $(SHARED_GRAPHICS_DIR)

asmbar:
	$(if $(TU),,$(error $(USAGE)))
	@echo "Architecture: $(ARCH)"
	$(CC) -S $(ASM_DIALECT) $(CFLAGS) $(TU) -I $(BARCODE_LIB_DIR) -I $(SHARED_GRAPHICS_DIR) -o -
