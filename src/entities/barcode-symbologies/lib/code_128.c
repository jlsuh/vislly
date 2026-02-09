#include <stdbool.h>

#include "barcode.h"
#include "graphics.h"

#define ASCII_NUL 0
#define CARET '^'
#define MAX_CONTROL_CHAR 31
#define ASCII_SPACE 32
#define CTRL_CHAR_OFFSET 64
#define ASCII_UNDERSCORE 95
#define ASCII_GRAVE_ACCENT 96
#define ASCII_LOWER_A 97
#define ASCII_LOWER_Z 122
#define ASCII_DEL 127

#define CHECKSUM_MODULO 103
#define MODULES_PER_SYMBOL 11

#define ANY_CODE_SET -1
#define CODE_SET_A 0
#define CODE_SET_B 1
#define CODE_SET_C 2

#define CODE_A 101
#define CODE_B 100
#define CODE_C 99
#define FNC_1 102
#define FNC_2 97
#define FNC_3 96
#define SENTINEL_FNC_4 107
#define SHIFT 98
#define START_A 103
#define START_B 104
#define START_C 105
#define STOP 106
#define FNC4_CODE_SET_A 101
#define FNC4_CODE_SET_B 100

#define PATTERN_WIDTHS_LEN 107
#define KEYWORDS_LEN 37

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

#define CODE128_BUFFER_LEN 65
int get_max_input_length(void)
{
    return CODE128_BUFFER_LEN - 1;
}

char data_buffer[CODE128_BUFFER_LEN];
int symbol_buffer[CODE128_BUFFER_LEN];

const char *PATTERN_WIDTHS[PATTERN_WIDTHS_LEN] = {
    "212222", "222122", "222221", "121223", "121322", "131222", "122213",
    "122312", "132212", "221213", "221312", "231212", "112232", "122132",
    "122231", "113222", "123122", "123221", "223211", "221132", "221231",
    "213212", "223112", "312131", "311222", "321122", "321221", "312212",
    "322112", "322211", "212123", "212321", "232121", "111323", "131123",
    "131321", "112313", "132113", "132311", "211313", "231113", "231311",
    "112133", "112331", "132131", "113123", "113321", "133121", "313121",
    "211331", "231131", "213113", "213311", "213131", "311123", "311321",
    "331121", "312113", "312311", "332111", "314111", "221411", "431111",
    "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114",
    "413111", "241112", "134111", "111242", "121142", "121241", "114212",
    "124112", "124211", "411212", "421112", "421211", "212141", "214121",
    "412121", "111143", "111341", "131141", "114113", "114311", "411113",
    "411311", "113141", "114131", "311141", "411131", "211412", "211214",
    "211232", "233111"};

Keyword KEYWORDS[KEYWORDS_LEN] = {{"NUL", 3, 64, CODE_SET_A},
                                  {"SOH", 3, 65, CODE_SET_A},
                                  {"STX", 3, 66, CODE_SET_A},
                                  {"ETX", 3, 67, CODE_SET_A},
                                  {"EOT", 3, 68, CODE_SET_A},
                                  {"ENQ", 3, 69, CODE_SET_A},
                                  {"ACK", 3, 70, CODE_SET_A},
                                  {"BEL", 3, 71, CODE_SET_A},
                                  {"BS", 2, 72, CODE_SET_A},
                                  {"HT", 2, 73, CODE_SET_A},
                                  {"LF", 2, 74, CODE_SET_A},
                                  {"VT", 2, 75, CODE_SET_A},
                                  {"FF", 2, 76, CODE_SET_A},
                                  {"CR", 2, 77, CODE_SET_A},
                                  {"SO", 2, 78, CODE_SET_A},
                                  {"SI", 2, 79, CODE_SET_A},
                                  {"DLE", 3, 80, CODE_SET_A},
                                  {"DC1", 3, 81, CODE_SET_A},
                                  {"DC2", 3, 82, CODE_SET_A},
                                  {"DC3", 3, 83, CODE_SET_A},
                                  {"DC4", 3, 84, CODE_SET_A},
                                  {"NAK", 3, 85, CODE_SET_A},
                                  {"SYN", 3, 86, CODE_SET_A},
                                  {"ETB", 3, 87, CODE_SET_A},
                                  {"CAN", 3, 88, CODE_SET_A},
                                  {"EM", 2, 89, CODE_SET_A},
                                  {"SUB", 3, 90, CODE_SET_A},
                                  {"ESC", 3, 91, CODE_SET_A},
                                  {"FS", 2, 92, CODE_SET_A},
                                  {"GS", 2, 93, CODE_SET_A},
                                  {"RS", 2, 94, CODE_SET_A},
                                  {"US", 2, 95, CODE_SET_A},
                                  {"DEL", 3, 95, CODE_SET_B},
                                  {"FNC1", 4, FNC_1, ANY_CODE_SET},
                                  {"FNC2", 4, FNC_2, ANY_CODE_SET},
                                  {"FNC3", 4, FNC_3, ANY_CODE_SET},
                                  {"FNC4", 4, SENTINEL_FNC_4, ANY_CODE_SET}};

bool is_optimizable_with_code_set_C(const char *buf, int index, int count,
                                    int total_len)
{
    if (index + count > total_len)
        return false;
    for (int i = 0; i < count; i++)
        if (!is_digit(buf[index + i]))
            return false;
    return true;
}

int match_keyword(const char *data_buffer, int idx)
{
    if (CARET != data_buffer[idx])
        return -1;
    for (int k = 0; k < KEYWORDS_LEN; k++)
        if (kernighan_ritchie_strncmp(&data_buffer[idx + 1], KEYWORDS[k].key,
                                      KEYWORDS[k].len))
            return k;
    return -1;
}

static inline int draw_pattern(Canvas *c, int x, int y,
                               const char *pattern_width, int module_width,
                               int h)
{
    int curr_x = x;
    bool is_bar = true;
    for (int i = 0; NULL_TERMINATOR != pattern_width[i]; i++) {
        int width_px = char_to_digit(pattern_width[i]) * module_width;
        if (is_bar)
            canvas_fill_rect(c, curr_x, y, width_px, h, C_BLACK);
        curr_x += width_px;
        is_bar = !is_bar;
    }
    return curr_x - x;
}

static inline void switch_code_set(RenderContext *ctx, int new_subset,
                                   int symbol)
{
    symbol_buffer[(*ctx->next_symbol_idx)++] = symbol;
    *ctx->curr_code_set = new_subset;
}

static inline void fallback_fnc4_in_code_set_c(RenderContext *ctx)
{
    switch_code_set(ctx, CODE_SET_B, CODE_B);
    symbol_buffer[(*ctx->next_symbol_idx)++] = FNC4_CODE_SET_B;
}

static inline bool parse_keyword(RenderContext *ctx)
{
    int keyword_idx = match_keyword(data_buffer, *ctx->next_input_idx);
    if (-1 == keyword_idx)
        return false;
    Keyword keyword = KEYWORDS[keyword_idx];
    if (keyword.dest_code_set != *ctx->curr_code_set) {
        if (CODE_SET_A == keyword.dest_code_set) {
            switch_code_set(ctx, CODE_SET_A, CODE_A);
        } else if (CODE_SET_B == keyword.dest_code_set) {
            switch_code_set(ctx, CODE_SET_B, CODE_B);
        }
    }
    if (SENTINEL_FNC_4 == keyword.value) {
        if (CODE_SET_A == *ctx->curr_code_set) {
            symbol_buffer[(*ctx->next_symbol_idx)++] = FNC4_CODE_SET_A;
        } else if (CODE_SET_B == *ctx->curr_code_set) {
            symbol_buffer[(*ctx->next_symbol_idx)++] = FNC4_CODE_SET_B;
        } else {
            fallback_fnc4_in_code_set_c(ctx);
        }
    } else {
        symbol_buffer[(*ctx->next_symbol_idx)++] = keyword.value;
    }
    *ctx->next_input_idx += 1 + keyword.len;
    return true;
}

void compose_code_set_A(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    bool is_escape_seq_ahead =
        (-1 != match_keyword(data_buffer, *ctx->next_input_idx));
    if (!is_escape_seq_ahead &&
        is_optimizable_with_code_set_C(data_buffer, *ctx->next_input_idx, 4,
                                       ctx->data_len)) {
        switch_code_set(ctx, CODE_SET_C, CODE_C);
        return;
    }
    char c = data_buffer[*ctx->next_input_idx];
    if (c >= ASCII_LOWER_A && c <= ASCII_LOWER_Z) {
        bool is_next_char_lower_case = false;
        if (*ctx->next_input_idx + 1 < ctx->data_len) {
            char next_c = data_buffer[*ctx->next_input_idx + 1];
            if (next_c >= ASCII_LOWER_A && next_c <= ASCII_LOWER_Z)
                is_next_char_lower_case = true;
        }
        if (is_next_char_lower_case) {
            switch_code_set(ctx, CODE_SET_B, CODE_B);
            symbol_buffer[(*ctx->next_symbol_idx)++] = c - ASCII_SPACE;
        } else {
            symbol_buffer[(*ctx->next_symbol_idx)++] = SHIFT;
            symbol_buffer[(*ctx->next_symbol_idx)++] = c - ASCII_SPACE;
        }
        (*ctx->next_input_idx)++;
    } else if (c >= ASCII_SPACE && c <= ASCII_UNDERSCORE) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c - ASCII_SPACE;
        (*ctx->next_input_idx)++;
    } else if (c >= ASCII_NUL && c <= MAX_CONTROL_CHAR) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c + CTRL_CHAR_OFFSET;
        (*ctx->next_input_idx)++;
    } else if (c >= ASCII_GRAVE_ACCENT && c <= ASCII_DEL) {
        switch_code_set(ctx, CODE_SET_B, CODE_B);
    } else {
        (*ctx->next_input_idx)++;
    }
}

void compose_code_set_B(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    bool is_escape_seq_ahead =
        (-1 != match_keyword(data_buffer, *ctx->next_input_idx));
    if (!is_escape_seq_ahead &&
        is_optimizable_with_code_set_C(data_buffer, *ctx->next_input_idx, 4,
                                       ctx->data_len)) {
        switch_code_set(ctx, CODE_SET_C, CODE_C);
        return;
    }
    char c = data_buffer[*ctx->next_input_idx];
    if (c >= ASCII_NUL && c <= MAX_CONTROL_CHAR) {
        bool is_next_control_char = false;
        if (*ctx->next_input_idx + 1 < ctx->data_len) {
            char next_c = data_buffer[*ctx->next_input_idx + 1];
            if (next_c >= ASCII_NUL && next_c <= MAX_CONTROL_CHAR)
                is_next_control_char = true;
        }
        if (is_next_control_char) {
            switch_code_set(ctx, CODE_SET_A, CODE_A);
            symbol_buffer[(*ctx->next_symbol_idx)++] = c + CTRL_CHAR_OFFSET;
        } else {
            symbol_buffer[(*ctx->next_symbol_idx)++] = SHIFT;
            symbol_buffer[(*ctx->next_symbol_idx)++] = c + CTRL_CHAR_OFFSET;
        }
        (*ctx->next_input_idx)++;
    } else if (c >= ASCII_SPACE && c <= ASCII_DEL) {
        symbol_buffer[(*ctx->next_symbol_idx)++] = c - ASCII_SPACE;
        (*ctx->next_input_idx)++;
    } else {
        symbol_buffer[(*ctx->next_symbol_idx)++] = 0;
        (*ctx->next_input_idx)++;
    }
}

void compose_code_set_C(RenderContext *ctx)
{
    if (parse_keyword(ctx))
        return;
    if (is_optimizable_with_code_set_C(data_buffer, *ctx->next_input_idx, 2,
                                       ctx->data_len)) {
        int d1 = char_to_digit(data_buffer[*ctx->next_input_idx]);
        int d2 = char_to_digit(data_buffer[*ctx->next_input_idx + 1]);
        symbol_buffer[(*ctx->next_symbol_idx)++] = (d1 * 10) + d2;
        *ctx->next_input_idx += 2;
    } else {
        switch_code_set(ctx, CODE_SET_B, CODE_B);
    }
}

int compose_checksum(int *next_symbol_idx)
{
    int dividend = symbol_buffer[0];
    for (int i = 1; i < *next_symbol_idx; i++)
        dividend += symbol_buffer[i] * i;
    return dividend % CHECKSUM_MODULO;
}

SymbolComposer code_set_composers[] = {compose_code_set_A, compose_code_set_B,
                                       compose_code_set_C};

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
    int curr_code_set = CODE_SET_B;
    RenderContext ctx = {.next_input_idx = &next_input_idx,
                         .next_symbol_idx = &next_symbol_idx,
                         .curr_code_set = &curr_code_set,
                         .data_len = data_len};
    if (is_optimizable_with_code_set_C(data_buffer, 0, 4, data_len)) {
        switch_code_set(&ctx, CODE_SET_C, START_C);
    } else {
        int keyword_idx = match_keyword(data_buffer, 0);
        if (-1 != keyword_idx &&
            CODE_SET_A == KEYWORDS[keyword_idx].dest_code_set) {
            switch_code_set(&ctx, CODE_SET_A, START_A);
        } else {
            switch_code_set(&ctx, CODE_SET_B, START_B);
        }
    }
    while (next_input_idx < data_len)
        code_set_composers[curr_code_set](&ctx);
    symbol_buffer[next_symbol_idx++] = compose_checksum(&next_symbol_idx);
    symbol_buffer[next_symbol_idx++] = STOP;
    int total_modules = next_symbol_idx * MODULES_PER_SYMBOL + 2;
    canvas_width =
        total_modules * module_width_px + 2 * horizontal_quiet_zone_px;
    canvas_height = bar_height_px + 2 * vertical_quiet_zone_px;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    for (int i = 0; i < next_symbol_idx; i++) {
        int value = symbol_buffer[i];
        curr_x += draw_pattern(&c, curr_x, curr_y, PATTERN_WIDTHS[value],
                               module_width_px, bar_height_px);
    }
    canvas_fill_rect(&c, curr_x, curr_y, 2 * module_width_px, bar_height_px,
                     C_BLACK);
}
