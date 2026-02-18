#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define EAN13_ENCODING_TYPES_COUNT 3
#define EAN13_ENC_L 0
#define EAN13_ENC_G 1
#define EAN13_ENC_R 2
#define EAN13_ENC_G_CHAR 'G'
#define EAN13_ENC_L_CHAR 'L'

#define EAN13_MARKER_START "101"
#define EAN13_MARKER_CENTER "01010"
#define EAN13_MARKER_END "101"

#define EAN13_EVEN_POS_WEIGHT 1
#define EAN13_ODD_POS_WEIGHT 3

#define EAN13_CHECKSUM_INDEX 12
#define EAN13_CHECKSUM_MODULO 10
#define EAN13_GROUP_LEN 6
#define EAN13_TOTAL_MODULES 95

#define EAN13_MARKER_EXTRA_HEIGHT_SCALAR 0.15f

static const char *const PARITY_PATTERNS[DIGITS_COUNT] = {
    "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
    "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"};

static const char *const
    ENCODING_TABLE[DIGITS_COUNT][EAN13_ENCODING_TYPES_COUNT] = {
        {"0001101", "0100111", "1110010"}, {"0011001", "0110011", "1100110"},
        {"0010011", "0011011", "1101100"}, {"0111101", "0100001", "1000010"},
        {"0100011", "0011101", "1011100"}, {"0110001", "0111001", "1001110"},
        {"0101111", "0000101", "1010000"}, {"0111011", "0010001", "1000100"},
        {"0110111", "0001001", "1001000"}, {"0001011", "0010111", "1110100"}};

static inline int get_integer_encoding_type(char c)
{
    if (EAN13_ENC_L_CHAR == c)
        return EAN13_ENC_L;
    if (EAN13_ENC_G_CHAR == c)
        return EAN13_ENC_G;
    return EAN13_ENC_R;
}

static inline int draw_group(Canvas *c, int x, int y, int module_width,
                             int bar_height, size_t group_start_index,
                             size_t group_end_index, const char *parity_pattern)
{
    int curr_x_offset = 0;
    const char *code = NULL;
    for (size_t i = group_start_index; i <= group_end_index; ++i) {
        int digit = char_to_digit(data_buffer[i]);
        int encoding_idx = EAN13_ENC_R;
        if (NULL != parity_pattern)
            encoding_idx = get_integer_encoding_type(
                parity_pattern[i - group_start_index]);
        code = ENCODING_TABLE[digit][encoding_idx];
        curr_x_offset += draw_pattern(c, code, x + curr_x_offset, y,
                                      module_width, bar_height);
    }
    return curr_x_offset;
}

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int regular_bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int marker_extra_height = (int)(((float)regular_bar_height_px *
                                     EAN13_MARKER_EXTRA_HEIGHT_SCALAR) +
                                    0.5f);
    int marker_bar_height_px = regular_bar_height_px + marker_extra_height;
    int vertical_quiet_zone_px = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int horizontal_quiet_zone_px =
        HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    canvas_width = (EAN13_TOTAL_MODULES * module_width_px) +
                   (2 * horizontal_quiet_zone_px);
    canvas_height = marker_bar_height_px + (2 * vertical_quiet_zone_px);
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int checksum = mod10_complement(data_buffer, EAN13_CHECKSUM_INDEX,
                                    EAN13_ODD_POS_WEIGHT, EAN13_EVEN_POS_WEIGHT,
                                    EAN13_CHECKSUM_MODULO);
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    int first_digit = char_to_digit(data_buffer[0]);
    const char *const parity_pattern = PARITY_PATTERNS[first_digit];
    curr_x += draw_pattern(&c, EAN13_MARKER_START, curr_x, curr_y,
                           module_width_px, marker_bar_height_px);
    curr_x +=
        draw_group(&c, curr_x, curr_y, module_width_px, regular_bar_height_px,
                   1, EAN13_GROUP_LEN, parity_pattern);
    curr_x += draw_pattern(&c, EAN13_MARKER_CENTER, curr_x, curr_y,
                           module_width_px, marker_bar_height_px);
    curr_x +=
        draw_group(&c, curr_x, curr_y, module_width_px, regular_bar_height_px,
                   EAN13_GROUP_LEN + 1, (EAN13_GROUP_LEN * 2) - 1, NULL);
    curr_x += draw_pattern(&c, ENCODING_TABLE[checksum][EAN13_ENC_R], curr_x,
                           curr_y, module_width_px, regular_bar_height_px);
    curr_x += draw_pattern(&c, EAN13_MARKER_END, curr_x, curr_y,
                           module_width_px, marker_bar_height_px);
}
