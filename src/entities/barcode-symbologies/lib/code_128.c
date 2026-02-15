#include <stdbool.h>
#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define CODE128_ASCII_DEL 127
#define CODE128_ASCII_GRAVE_ACCENT 96
#define CODE128_ASCII_LOWER_A 97
#define CODE128_ASCII_LOWER_Z 122
#define CODE128_ASCII_NUL 0
#define CODE128_ASCII_SPACE 32
#define CODE128_ASCII_UNDERSCORE 95
#define CODE128_CARET '^'
#define CODE128_CTRL_CHAR_OFFSET 64
#define CODE128_MAX_CONTROL_CHAR 31

#define CODE128_CHECKSUM_MODULO 103
#define CODE128_MODULES_PER_SYMBOL 11

#define CODE128_ANY_CODE_SET -1
#define CODE128_CODE_SET_A 0
#define CODE128_CODE_SET_B 1
#define CODE128_CODE_SET_C 2

#define CODE128_CODE_A 101
#define CODE128_CODE_B 100
#define CODE128_CODE_C 99
#define CODE128_FNC4_CODE_SET_A 101
#define CODE128_FNC4_CODE_SET_B 100
#define CODE128_FNC_1 102
#define CODE128_FNC_2 97
#define CODE128_FNC_3 96
#define CODE128_SENTINEL_FNC_4 107
#define CODE128_SHIFT 98
#define CODE128_START_A 103
#define CODE128_START_B 104
#define CODE128_START_C 105
#define CODE128_STOP 106

#define CODE128_KEYWORDS_LEN 37
#define CODE128_PATTERN_WIDTHS_LEN 107

typedef struct {
    const char *key;
    int len;
    int value;
    int dest_code_set;
} Keyword;

typedef struct {
    int *next_input_idx;
    int *next_symbol_idx;
    int *curr_code_set;
    int data_len;
} RenderContext;

typedef void (*SymbolComposer)(RenderContext *ctx);

static const char *const PATTERN_WIDTHS[CODE128_PATTERN_WIDTHS_LEN] = {
    "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
    "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
    "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
    "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
    "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
    "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
    "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
    "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
    "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
    "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
    "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
    "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
    "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
    "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
    "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
    "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
    "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
    "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
    "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
    "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
    "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
    "11010011100", "11000111010"};

static Keyword KEYWORDS[CODE128_KEYWORDS_LEN] = {
    {"NUL", 3, 64, CODE128_CODE_SET_A},
    {"SOH", 3, 65, CODE128_CODE_SET_A},
    {"STX", 3, 66, CODE128_CODE_SET_A},
    {"ETX", 3, 67, CODE128_CODE_SET_A},
    {"EOT", 3, 68, CODE128_CODE_SET_A},
    {"ENQ", 3, 69, CODE128_CODE_SET_A},
    {"ACK", 3, 70, CODE128_CODE_SET_A},
    {"BEL", 3, 71, CODE128_CODE_SET_A},
    {"BS", 2, 72, CODE128_CODE_SET_A},
    {"HT", 2, 73, CODE128_CODE_SET_A},
    {"LF", 2, 74, CODE128_CODE_SET_A},
    {"VT", 2, 75, CODE128_CODE_SET_A},
    {"FF", 2, 76, CODE128_CODE_SET_A},
    {"CR", 2, 77, CODE128_CODE_SET_A},
    {"SO", 2, 78, CODE128_CODE_SET_A},
    {"SI", 2, 79, CODE128_CODE_SET_A},
    {"DLE", 3, 80, CODE128_CODE_SET_A},
    {"DC1", 3, 81, CODE128_CODE_SET_A},
    {"DC2", 3, 82, CODE128_CODE_SET_A},
    {"DC3", 3, 83, CODE128_CODE_SET_A},
    {"DC4", 3, 84, CODE128_CODE_SET_A},
    {"NAK", 3, 85, CODE128_CODE_SET_A},
    {"SYN", 3, 86, CODE128_CODE_SET_A},
    {"ETB", 3, 87, CODE128_CODE_SET_A},
    {"CAN", 3, 88, CODE128_CODE_SET_A},
    {"EM", 2, 89, CODE128_CODE_SET_A},
    {"SUB", 3, 90, CODE128_CODE_SET_A},
    {"ESC", 3, 91, CODE128_CODE_SET_A},
    {"FS", 2, 92, CODE128_CODE_SET_A},
    {"GS", 2, 93, CODE128_CODE_SET_A},
    {"RS", 2, 94, CODE128_CODE_SET_A},
    {"US", 2, 95, CODE128_CODE_SET_A},
    {"DEL", 3, 95, CODE128_CODE_SET_B},
    {"FNC1", 4, CODE128_FNC_1, CODE128_ANY_CODE_SET},
    {"FNC2", 4, CODE128_FNC_2, CODE128_ANY_CODE_SET},
    {"FNC3", 4, CODE128_FNC_3, CODE128_ANY_CODE_SET},
    {"FNC4", 4, CODE128_SENTINEL_FNC_4, CODE128_ANY_CODE_SET}};

static inline bool is_optimizable_with_code_set_C(const char *buf, int index,
                                                  int count, int total_len)
{
    if (index + count > total_len)
        return false;
    for (int i = 0; i < count; ++i)
        if (!is_digit(buf[index + i]))
            return false;
    return true;
}

static inline int match_keyword(const char *data_buffer, int idx)
{
    if (CODE128_CARET != data_buffer[idx])
        return -1;
    for (int k = 0; k < CODE128_KEYWORDS_LEN; ++k)
        if (kernighan_ritchie_strncmp(&data_buffer[idx + 1], KEYWORDS[k].key,
                                      KEYWORDS[k].len))
            return k;
    return -1;
}

static inline void switch_code_set(RenderContext *ctx, int new_subset,
                                   int symbol)
{
    symbol_buffer[(*ctx->next_symbol_idx)++] = symbol;
    *ctx->curr_code_set = new_subset;
}

static inline void fallback_fnc4_in_code_set_C(RenderContext *ctx)
{
    switch_code_set(ctx, CODE128_CODE_SET_B, CODE128_CODE_B);
    symbol_buffer[(*ctx->next_symbol_idx)++] = CODE128_FNC4_CODE_SET_B;
}

static inline bool parse_keyword(RenderContext *ctx)
{
    int keyword_idx = match_keyword(data_buffer, *ctx->next_input_idx);
    if (-1 == keyword_idx)
        return false;
    Keyword keyword = KEYWORDS[keyword_idx];
    if (keyword.dest_code_set != *ctx->curr_code_set) {
        switch (keyword.dest_code_set) {
        case CODE128_CODE_SET_A:
            switch_code_set(ctx, CODE128_CODE_SET_A, CODE128_CODE_A);
            break;
        case CODE128_CODE_SET_B:
            switch_code_set(ctx, CODE128_CODE_SET_B, CODE128_CODE_B);
            break;
        }
    }
    if (CODE128_SENTINEL_FNC_4 != keyword.value) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = keyword.value;
    } else {
        switch (*ctx->curr_code_set) {
        case CODE128_CODE_SET_A:
            symbol_buffer[(*ctx->next_symbol_idx)++] = CODE128_FNC4_CODE_SET_A;
            break;
        case CODE128_CODE_SET_B:
            symbol_buffer[(*ctx->next_symbol_idx)++] = CODE128_FNC4_CODE_SET_B;
            break;
        default:
            fallback_fnc4_in_code_set_C(ctx);
            break;
        }
    }
    *ctx->next_input_idx += 1 + keyword.len;
    return true;
}

static inline void compose_code_set_A(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    int idx = *ctx->next_input_idx;
    if (match_keyword(data_buffer, idx) == -1 &&
        is_optimizable_with_code_set_C(data_buffer, idx, 4, ctx->data_len)) {
        switch_code_set(ctx, CODE128_CODE_SET_C, CODE128_CODE_C);
        return;
    }
    char c = data_buffer[idx];
    if (c >= CODE128_ASCII_LOWER_A && c <= CODE128_ASCII_LOWER_Z) {
        bool next_is_lower = false;
        if (idx + 1 < ctx->data_len) {
            char next = data_buffer[idx + 1];
            next_is_lower = (next >= CODE128_ASCII_LOWER_A &&
                             next <= CODE128_ASCII_LOWER_Z);
        }
        if (next_is_lower)
            switch_code_set(ctx, CODE128_CODE_SET_B, CODE128_CODE_B);
        else
            symbol_buffer[(*ctx->next_symbol_idx)++] = CODE128_SHIFT;
        symbol_buffer[(*ctx->next_symbol_idx)++] = c - CODE128_ASCII_SPACE;
        (*ctx->next_input_idx)++;
        return;
    }
    if (c >= CODE128_ASCII_SPACE && c <= CODE128_ASCII_UNDERSCORE) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c - CODE128_ASCII_SPACE;
        (*ctx->next_input_idx)++;
        return;
    }
    if (c >= CODE128_ASCII_NUL && c <= CODE128_MAX_CONTROL_CHAR) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c + CODE128_CTRL_CHAR_OFFSET;
        (*ctx->next_input_idx)++;
        return;
    }
    if (c >= CODE128_ASCII_GRAVE_ACCENT && c <= CODE128_ASCII_DEL) {
        switch_code_set(ctx, CODE128_CODE_SET_B, CODE128_CODE_B);
        return;
    }
    (*ctx->next_input_idx)++;
}

static inline void compose_code_set_B(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    int idx = *ctx->next_input_idx;
    if (match_keyword(data_buffer, idx) == -1 &&
        is_optimizable_with_code_set_C(data_buffer, idx, 4, ctx->data_len)) {
        switch_code_set(ctx, CODE128_CODE_SET_C, CODE128_CODE_C);
        return;
    }
    char c = data_buffer[idx];
    if (c >= CODE128_ASCII_NUL && c <= CODE128_MAX_CONTROL_CHAR) {
        bool next_is_ctrl = false;
        if (idx + 1 < ctx->data_len) {
            char next = data_buffer[idx + 1];
            next_is_ctrl =
                (next >= CODE128_ASCII_NUL && next <= CODE128_MAX_CONTROL_CHAR);
        }
        if (next_is_ctrl)
            switch_code_set(ctx, CODE128_CODE_SET_A, CODE128_CODE_A);
        else
            symbol_buffer[(*ctx->next_symbol_idx)++] = CODE128_SHIFT;
        symbol_buffer[(*ctx->next_symbol_idx)++] = c + CODE128_CTRL_CHAR_OFFSET;
        (*ctx->next_input_idx)++;
        return;
    }
    if (c >= CODE128_ASCII_SPACE && c <= CODE128_ASCII_DEL) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c - CODE128_ASCII_SPACE;
        (*ctx->next_input_idx)++;
        return;
    }
    symbol_buffer[(*ctx->next_symbol_idx)++] = 0;
    (*ctx->next_input_idx)++;
}

static inline void compose_code_set_C(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    int idx = *ctx->next_input_idx;
    if (!is_optimizable_with_code_set_C(data_buffer, idx, 2, ctx->data_len)) {
        switch_code_set(ctx, CODE128_CODE_SET_B, CODE128_CODE_B);
        return;
    }
    int d1 = char_to_digit(data_buffer[idx]);
    int d2 = char_to_digit(data_buffer[idx + 1]);
    symbol_buffer[(*ctx->next_symbol_idx)++] = (d1 * 10) + d2;
    *ctx->next_input_idx += 2;
}

static inline int compose_checksum(int *next_symbol_idx)
{
    int dividend = symbol_buffer[0];
    for (int i = 1; i < *next_symbol_idx; ++i)
        dividend += symbol_buffer[i] * i;
    return dividend % CODE128_CHECKSUM_MODULO;
}

static SymbolComposer code_set_composers[] = {
    compose_code_set_A, compose_code_set_B, compose_code_set_C};

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int vertical_quiet_zone_px = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int horizontal_quiet_zone_px =
        HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    int data_len = kernighan_ritchie_strlen(data_buffer);
    int next_symbol_idx = 0;
    int next_input_idx = 0;
    int curr_code_set = CODE128_CODE_SET_B;
    RenderContext ctx = {.next_input_idx = &next_input_idx,
                         .next_symbol_idx = &next_symbol_idx,
                         .curr_code_set = &curr_code_set,
                         .data_len = data_len};
    if (is_optimizable_with_code_set_C(data_buffer, 0, 4, data_len)) {
        switch_code_set(&ctx, CODE128_CODE_SET_C, CODE128_START_C);
    } else {
        int keyword_idx = match_keyword(data_buffer, 0);
        bool should_use_code_set_A =
            (keyword_idx != -1 &&
             KEYWORDS[keyword_idx].dest_code_set == CODE128_CODE_SET_A);
        if (should_use_code_set_A)
            switch_code_set(&ctx, CODE128_CODE_SET_A, CODE128_START_A);
        else
            switch_code_set(&ctx, CODE128_CODE_SET_B, CODE128_START_B);
    }
    while (next_input_idx < data_len)
        code_set_composers[curr_code_set](&ctx);
    symbol_buffer[next_symbol_idx++] = compose_checksum(&next_symbol_idx);
    symbol_buffer[next_symbol_idx++] = CODE128_STOP;
    int total_modules = next_symbol_idx * CODE128_MODULES_PER_SYMBOL + 2;
    canvas_width =
        total_modules * module_width_px + 2 * horizontal_quiet_zone_px;
    canvas_height = bar_height_px + 2 * vertical_quiet_zone_px;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    for (int i = 0; i < next_symbol_idx; ++i) {
        int value = symbol_buffer[i];
        curr_x += draw_pattern(&c, PATTERN_WIDTHS[value], curr_x, curr_y,
                               module_width_px, bar_height_px);
    }
    canvas_fill_rect(&c, curr_x, curr_y, 2 * module_width_px, bar_height_px,
                     C_BLACK);
}
