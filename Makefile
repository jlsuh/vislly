TO_WASM_SCRIPT := ./to_wasm.sh
BARCODE_LIB_DIR := src/entities/barcode-symbologies/lib

.PHONY: barcode

barcode:
	$(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/code_128.c
	$(TO_WASM_SCRIPT) $(BARCODE_LIB_DIR)/ean_13.c
