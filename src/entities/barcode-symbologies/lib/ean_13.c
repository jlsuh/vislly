#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define ENCODING_TYPES_COUNT 3
#define ENC_L 0
#define ENC_G 1
#define ENC_R 2

#define MARKER_START "101"
#define MARKER_CENTER "01010"
#define MARKER_END "101"

#define CHECKSUM_INDEX 12
#define CHECKSUM_MODULO 10
#define CHECKSUM_ODD_WEIGHT 3
#define DIGITS_COUNT 10
#define GROUP_LEN 6
#define TOTAL_MODULES_EAN13 95

#define MARKER_EXTRA_HEIGHT_SCALAR 0.15f

static const char *PARITY_PATTERNS[DIGITS_COUNT] = {
    "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
    "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"};

static const char *ENCODING_TABLE[DIGITS_COUNT][ENCODING_TYPES_COUNT] = {
    {"0001101", "0100111", "1110010"}, {"0011001", "0110011", "1100110"},
    {"0010011", "0011011", "1101100"}, {"0111101", "0100001", "1000010"},
    {"0100011", "0011101", "1011100"}, {"0110001", "0111001", "1001110"},
    {"0101111", "0000101", "1010000"}, {"0111011", "0010001", "1000100"},
    {"0110111", "0001001", "1001000"}, {"0001011", "0010111", "1110100"}};

static inline int get_encoding_type(char p)
{
    if (p == 'L')
        return ENC_L;
    if (p == 'G')
        return ENC_G;
    return ENC_R;
}

static inline int compose_checksum(void)
{
    int dividend = 0;
    int weights[] = {1, CHECKSUM_ODD_WEIGHT};
    for (int i = 0; i < CHECKSUM_INDEX; i++) {
        int digit = char_to_digit(data_buffer[i]);
        symbol_buffer[i] = digit;
        dividend += digit * weights[i & 1];
    }
    int remainder = dividend % CHECKSUM_MODULO;
    return (remainder == 0) ? 0 : (CHECKSUM_MODULO - remainder);
}

static inline int draw_group(Canvas *c, int x, int y, int module_width,
                             int bar_height, int *symbol_idx,
                             const char *parity_pattern)
{
    int curr_x_offset = 0;
    for (int i = 0; i < GROUP_LEN; ++i) {
        int digit = symbol_buffer[(*symbol_idx)++];
        int encoding_idx = ENC_R;
        if (parity_pattern != NULL)
            encoding_idx = get_encoding_type(parity_pattern[i]);
        const char *code = ENCODING_TABLE[digit][encoding_idx];
        curr_x_offset += draw_pattern(c, code, x + curr_x_offset, y,
                                      module_width, bar_height);
    }
    return curr_x_offset;
}

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int regular_bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int marker_extra_height =
        (int)((float)regular_bar_height_px * MARKER_EXTRA_HEIGHT_SCALAR + 0.5f);
    int marker_bar_height_px = regular_bar_height_px + marker_extra_height;
    int vertical_quiet_zone_px = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int horizontal_quiet_zone_px =
        HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    canvas_width = (TOTAL_MODULES_EAN13 * module_width_px) +
                   (2 * horizontal_quiet_zone_px);
    canvas_height = marker_bar_height_px + (2 * vertical_quiet_zone_px);
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    symbol_buffer[CHECKSUM_INDEX] = compose_checksum();
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    int first_digit = symbol_buffer[0];
    int curr_symbol_idx = 1;
    const char *parity_pattern = PARITY_PATTERNS[first_digit];
    curr_x += draw_pattern(&c, MARKER_START, curr_x, curr_y, module_width_px,
                           marker_bar_height_px);
    curr_x +=
        draw_group(&c, curr_x, curr_y, module_width_px, regular_bar_height_px,
                   &curr_symbol_idx, parity_pattern);
    curr_x += draw_pattern(&c, MARKER_CENTER, curr_x, curr_y, module_width_px,
                           marker_bar_height_px);
    curr_x += draw_group(&c, curr_x, curr_y, module_width_px,
                         regular_bar_height_px, &curr_symbol_idx, NULL);
    curr_x += draw_pattern(&c, MARKER_END, curr_x, curr_y, module_width_px,
                           marker_bar_height_px);
}
