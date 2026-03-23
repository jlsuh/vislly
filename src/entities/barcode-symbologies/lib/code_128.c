#include <stdbool.h>
#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define CODE128_ASCII_DEL 127
#define CODE128_ASCII_GRAVE_ACCENT 96
#define CODE128_ASCII_SPACE 32
#define CODE128_ASCII_UNDERSCORE 95
#define CODE128_CARET '^'
#define CODE128_CTRL_CHAR_OFFSET 64

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

#define CODE128_KEYWORD_NOT_FOUND -1

typedef struct {
    const char *key;
    int len;
    int value;
    int dest_code_set;
} Keyword;

typedef struct {
    int target_set;
    int target_code;
    int symbol_val;
} ShiftConfig;

static int curr_code_set;
static int data_len;
static int next_input_idx;
static int next_symbol_idx;

typedef void (*SymbolComposer)(void);

static const char *const PATTERN_WIDTHS[CODE128_PATTERN_WIDTHS_LEN] = {
    "11011001100", "11001101100", "11001100110", "10010011000", "10010001100", "10001001100", "10011001000",
    "10011000100", "10001100100", "11001001000", "11001000100", "11000100100", "10110011100", "10011011100",
    "10011001110", "10111001100", "10011101100", "10011100110", "11001110010", "11001011100", "11001001110",
    "11011100100", "11001110100", "11101101110", "11101001100", "11100101100", "11100100110", "11101100100",
    "11100110100", "11100110010", "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
    "10001000110", "10110001000", "10001101000", "10001100010", "11010001000", "11000101000", "11000100010",
    "10110111000", "10110001110", "10001101110", "10111011000", "10111000110", "10001110110", "11101110110",
    "11010001110", "11000101110", "11011101000", "11011100010", "11011101110", "11101011000", "11101000110",
    "11100010110", "11101101000", "11101100010", "11100011010", "11101111010", "11001000010", "11110001010",
    "10100110000", "10100001100", "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
    "10110000100", "10011010000", "10011000010", "10000110100", "10000110010", "11000010010", "11001010000",
    "11110111010", "11000010100", "10001111010", "10100111100", "10010111100", "10010011110", "10111100100",
    "10011110100", "10011110010", "11110100100", "11110010100", "11110010010", "11011011110", "11011110110",
    "11110110110", "10101111000", "10100011110", "10001011110", "10111101000", "10111100010", "11110101000",
    "11110100010", "10111011110", "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
    "11010011100", "11000111010"};

static const Keyword KEYWORDS[CODE128_KEYWORDS_LEN] = {
    {"NUL",  3, 64,                     CODE128_CODE_SET_A  },
    {"SOH",  3, 65,                     CODE128_CODE_SET_A  },
    {"STX",  3, 66,                     CODE128_CODE_SET_A  },
    {"ETX",  3, 67,                     CODE128_CODE_SET_A  },
    {"EOT",  3, 68,                     CODE128_CODE_SET_A  },
    {"ENQ",  3, 69,                     CODE128_CODE_SET_A  },
    {"ACK",  3, 70,                     CODE128_CODE_SET_A  },
    {"BEL",  3, 71,                     CODE128_CODE_SET_A  },
    {"BS",   2, 72,                     CODE128_CODE_SET_A  },
    {"HT",   2, 73,                     CODE128_CODE_SET_A  },
    {"LF",   2, 74,                     CODE128_CODE_SET_A  },
    {"VT",   2, 75,                     CODE128_CODE_SET_A  },
    {"FF",   2, 76,                     CODE128_CODE_SET_A  },
    {"CR",   2, 77,                     CODE128_CODE_SET_A  },
    {"SO",   2, 78,                     CODE128_CODE_SET_A  },
    {"SI",   2, 79,                     CODE128_CODE_SET_A  },
    {"DLE",  3, 80,                     CODE128_CODE_SET_A  },
    {"DC1",  3, 81,                     CODE128_CODE_SET_A  },
    {"DC2",  3, 82,                     CODE128_CODE_SET_A  },
    {"DC3",  3, 83,                     CODE128_CODE_SET_A  },
    {"DC4",  3, 84,                     CODE128_CODE_SET_A  },
    {"NAK",  3, 85,                     CODE128_CODE_SET_A  },
    {"SYN",  3, 86,                     CODE128_CODE_SET_A  },
    {"ETB",  3, 87,                     CODE128_CODE_SET_A  },
    {"CAN",  3, 88,                     CODE128_CODE_SET_A  },
    {"EM",   2, 89,                     CODE128_CODE_SET_A  },
    {"SUB",  3, 90,                     CODE128_CODE_SET_A  },
    {"ESC",  3, 91,                     CODE128_CODE_SET_A  },
    {"FS",   2, 92,                     CODE128_CODE_SET_A  },
    {"GS",   2, 93,                     CODE128_CODE_SET_A  },
    {"RS",   2, 94,                     CODE128_CODE_SET_A  },
    {"US",   2, 95,                     CODE128_CODE_SET_A  },
    {"DEL",  3, 95,                     CODE128_CODE_SET_B  },
    {"FNC1", 4, CODE128_FNC_1,          CODE128_ANY_CODE_SET},
    {"FNC2", 4, CODE128_FNC_2,          CODE128_ANY_CODE_SET},
    {"FNC3", 4, CODE128_FNC_3,          CODE128_ANY_CODE_SET},
    {"FNC4", 4, CODE128_SENTINEL_FNC_4, CODE128_ANY_CODE_SET}
};

static inline bool is_optimizable_with_code_set_C(const char *buf, int index, int count, int total_len)
{
    if (index + count > total_len)
        return false;
    for (int i = 0; i < count; ++i)
        if (!is_digit(buf[index + i]))
            return false;
    return true;
}

static inline bool should_start_with_code_set_C(const char *buf, int total_len)
{
    if (2 == total_len && is_optimizable_with_code_set_C(buf, 0, 2, total_len))
        return true;
    if (is_optimizable_with_code_set_C(buf, 0, 4, total_len))
        return true;
    return false;
}

static inline bool should_switch_to_code_set_C(const char *buf, int idx, int total_len)
{
    int remaining = total_len - idx;
    if (is_optimizable_with_code_set_C(buf, idx, 6, total_len))
        return true;
    if (4 == remaining || 5 == remaining)
        if (is_optimizable_with_code_set_C(buf, idx, remaining, total_len))
            return true;
    return false;
}

static inline int match_keyword(const char *data_buffer, int idx)
{
    if (CODE128_CARET != data_buffer[idx])
        return CODE128_KEYWORD_NOT_FOUND;
    for (int k = 0; k < CODE128_KEYWORDS_LEN; ++k)
        if (wasm_strncmp(&data_buffer[idx + 1], KEYWORDS[k].key, KEYWORDS[k].len))
            return k;
    return CODE128_KEYWORD_NOT_FOUND;
}

static inline void switch_code_set(int new_subset, int symbol)
{
    symbol_buffer[next_symbol_idx++] = symbol;
    curr_code_set = new_subset;
}

static inline void fallback_fnc4_in_code_set_C(void)
{
    switch_code_set(CODE128_CODE_SET_B, CODE128_CODE_B);
    symbol_buffer[next_symbol_idx++] = CODE128_FNC4_CODE_SET_B;
}

static inline void handle_keyword_transition(int dest_code_set)
{
    if (dest_code_set == curr_code_set)
        return;
    if (CODE128_CODE_SET_A == dest_code_set)
        switch_code_set(CODE128_CODE_SET_A, CODE128_CODE_A);
    else if (CODE128_CODE_SET_B == dest_code_set)
        switch_code_set(CODE128_CODE_SET_B, CODE128_CODE_B);
}

static inline void handle_keyword_value(int value)
{
    if (CODE128_SENTINEL_FNC_4 != value) {
        symbol_buffer[next_symbol_idx++] = value;
        return;
    }
    if (CODE128_CODE_SET_A == curr_code_set)
        symbol_buffer[next_symbol_idx++] = CODE128_FNC4_CODE_SET_A;
    else if (CODE128_CODE_SET_B == curr_code_set)
        symbol_buffer[next_symbol_idx++] = CODE128_FNC4_CODE_SET_B;
    else
        fallback_fnc4_in_code_set_C();
}

static inline bool parse_keyword(void)
{
    int keyword_idx = match_keyword(data_buffer, next_input_idx);
    if (CODE128_KEYWORD_NOT_FOUND == keyword_idx)
        return false;
    Keyword keyword = KEYWORDS[keyword_idx];
    handle_keyword_transition(keyword.dest_code_set);
    handle_keyword_value(keyword.value);
    next_input_idx += 1 + keyword.len;
    return true;
}

static inline bool try_shift_or_switch(bool matches, bool next_matches, ShiftConfig cfg)
{
    if (!matches)
        return false;
    if (next_matches)
        switch_code_set(cfg.target_set, cfg.target_code);
    else
        symbol_buffer[next_symbol_idx++] = CODE128_SHIFT;
    symbol_buffer[next_symbol_idx++] = cfg.symbol_val;
    ++next_input_idx;
    return true;
}

static inline bool try_simple_emit(bool matches, int symbol_val)
{
    if (!matches)
        return false;
    symbol_buffer[next_symbol_idx++] = symbol_val;
    ++next_input_idx;
    return true;
}

static inline bool handle_common_composition_preamble(int *idx)
{
    if (parse_keyword())
        return true;
    *idx = next_input_idx;
    if (should_switch_to_code_set_C(data_buffer, *idx, data_len)) {
        switch_code_set(CODE128_CODE_SET_C, CODE128_CODE_C);
        return true;
    }
    return false;
}

static inline bool try_compose_A_lower(char c, int idx)
{
    bool matches = is_lowercased_alpha(c);
    bool next_matches = (idx + 1 < data_len) && is_lowercased_alpha(data_buffer[idx + 1]);
    ShiftConfig cfg = {CODE128_CODE_SET_B, CODE128_CODE_B, c - CODE128_ASCII_SPACE};
    return try_shift_or_switch(matches, next_matches, cfg);
}

static inline bool try_compose_A_space_underscore(char c)
{
    return try_simple_emit(c >= CODE128_ASCII_SPACE && c <= CODE128_ASCII_UNDERSCORE, c - CODE128_ASCII_SPACE);
}

static inline bool try_compose_A_control(char c)
{
    return try_simple_emit(is_control_char(c), c + CODE128_CTRL_CHAR_OFFSET);
}

static inline bool try_compose_A_grave_del(char c)
{
    if (c >= CODE128_ASCII_GRAVE_ACCENT && c <= CODE128_ASCII_DEL) {
        switch_code_set(CODE128_CODE_SET_B, CODE128_CODE_B);
        return true;
    }
    return false;
}

static inline void compose_code_set_A(void)
{
    int idx = 0;
    if (handle_common_composition_preamble(&idx))
        return;
    char c = data_buffer[idx];
    if (try_compose_A_lower(c, idx))
        return;
    if (try_compose_A_space_underscore(c))
        return;
    if (try_compose_A_control(c))
        return;
    if (try_compose_A_grave_del(c))
        return;
    symbol_buffer[next_symbol_idx++] = 0;
    ++next_input_idx;
}

static inline bool try_compose_B_control(char c, int idx)
{
    bool matches = is_control_char(c);
    bool next_matches = (idx + 1 < data_len) && is_control_char(data_buffer[idx + 1]);
    ShiftConfig cfg = {CODE128_CODE_SET_A, CODE128_CODE_A, c + CODE128_CTRL_CHAR_OFFSET};
    return try_shift_or_switch(matches, next_matches, cfg);
}

static inline bool try_compose_B_printable(char c)
{
    return try_simple_emit(c >= CODE128_ASCII_SPACE && c <= CODE128_ASCII_DEL, c - CODE128_ASCII_SPACE);
}

static inline void compose_code_set_B(void)
{
    int idx = 0;
    if (handle_common_composition_preamble(&idx))
        return;
    char c = data_buffer[idx];
    if (try_compose_B_control(c, idx))
        return;
    if (try_compose_B_printable(c))
        return;
    symbol_buffer[next_symbol_idx++] = 0;
    ++next_input_idx;
}

static inline void compose_code_set_C(void)
{
    if (parse_keyword())
        return;
    int idx = next_input_idx;
    if (!is_optimizable_with_code_set_C(data_buffer, idx, 2, data_len)) {
        char c = data_buffer[idx];
        if (is_control_char(c))
            switch_code_set(CODE128_CODE_SET_A, CODE128_CODE_A);
        else
            switch_code_set(CODE128_CODE_SET_B, CODE128_CODE_B);
        return;
    }
    int d1 = char_to_digit(data_buffer[idx]);
    int d2 = char_to_digit(data_buffer[idx + 1]);
    symbol_buffer[next_symbol_idx++] = (d1 * 10) + d2;
    next_input_idx += 2;
}

static inline int compose_checksum(void)
{
    int dividend = symbol_buffer[0];
    for (int i = 1; i < next_symbol_idx; ++i)
        dividend += symbol_buffer[i] * i;
    return dividend % CODE128_CHECKSUM_MODULO;
}

static const SymbolComposer code_set_composers[] = {compose_code_set_A, compose_code_set_B, compose_code_set_C};

static inline int determine_initial_code_set(void)
{
    if (should_start_with_code_set_C(data_buffer, data_len))
        return CODE128_CODE_SET_C;
    int keyword_idx = match_keyword(data_buffer, 0);
    if (CODE128_KEYWORD_NOT_FOUND != keyword_idx) {
        if (CODE128_CODE_SET_A == KEYWORDS[keyword_idx].dest_code_set)
            return CODE128_CODE_SET_A;
    } else if (0 < data_len && is_control_char(data_buffer[0])) {
        return CODE128_CODE_SET_A;
    }
    return CODE128_CODE_SET_B;
}

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int horizontal_quiet_zone_px = HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    data_len = wasm_strlen(data_buffer);
    next_symbol_idx = 0;
    next_input_idx = 0;
    curr_code_set = determine_initial_code_set();
    switch_code_set(curr_code_set, CODE128_START_A + curr_code_set);
    while (next_input_idx < data_len)
        code_set_composers[curr_code_set]();
    symbol_buffer[next_symbol_idx++] = compose_checksum();
    symbol_buffer[next_symbol_idx++] = CODE128_STOP;
    int total_modules = (next_symbol_idx * CODE128_MODULES_PER_SYMBOL) + 2;
    int text_bounding_height = SYMBOL_TEXT_BOUNDING_HEIGHT * dpr;
    int padding_top = SYMBOL_TEXT_PADDING_TOP_Y * dpr;
    int quiet_zone = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int content_height = bar_height_px + padding_top + text_bounding_height;
    canvas_width = (total_modules * module_width_px) + (2 * horizontal_quiet_zone_px);
    canvas_height = quiet_zone + content_height + quiet_zone;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = quiet_zone;
    for (int i = 0; i < next_symbol_idx; ++i)
        curr_x += draw_pattern(&c, PATTERN_WIDTHS[symbol_buffer[i]], curr_x, curr_y, module_width_px, bar_height_px);
    canvas_fill_rect(&c, curr_x, curr_y, 2 * module_width_px, bar_height_px, C_BLACK);
    int text_y = curr_y + bar_height_px + padding_top;
    draw_centered_text(&c, data_buffer, 0, canvas_width, text_y);
}
