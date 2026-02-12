BARCODE_LIB_DIR := src/entities/barcode-symbologies/lib
SHARED_GRAPHICS_DIR := src/shared/lib/graphics
TO_WASM_SCRIPT := ./to_wasm.sh
USAGE := Usage: make pre TU=path/to/file.c

.PHONY: bar prebar

bar:
	$(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/code_128.c
	$(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/ean_13.c

prebar:
	$(if $(TU),,$(error $(USAGE)))
	gcc -E -P $(TU) -I $(BARCODE_LIB_DIR) -I $(SHARED_GRAPHICS_DIR)
