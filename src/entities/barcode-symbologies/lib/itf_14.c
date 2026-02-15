#include <stdbool.h>
#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define ITF14_START_CODE "1010"
#define ITF14_STOP_CODE "11101"

#define ITF14_NARROW_BINARY_BAR "1"
#define ITF14_NARROW_BINARY_SPACE "0"
#define ITF14_WIDE_BINARY_BAR "111"
#define ITF14_WIDE_BINARY_SPACE "000"

#define ITF14_EVEN_POS_WEIGHT 1
#define ITF14_ODD_POS_WEIGHT 3

#define ITF14_CHECKSUM_INDEX 13
#define ITF14_CHECKSUM_MODULO 10
#define ITF14_TOTAL_MODULES 150
#define ITF14_WIDTHS_PER_DIGIT 5

static const char *const WIDTHS[DIGITS_COUNT] = {
    "nnWWn", "WnnnW", "nWnnW", "WWnnn", "nnWnW",
    "WnWnn", "nWWnn", "nnnWW", "WnnWn", "nWnWn"};

static inline const char *get_binary_width(char width, bool is_bar)
{
    if (is_bar)
        return (width == 'W') ? ITF14_WIDE_BINARY_BAR : ITF14_NARROW_BINARY_BAR;
    else
        return (width == 'W') ? ITF14_WIDE_BINARY_SPACE
                              : ITF14_NARROW_BINARY_SPACE;
    return NULL;
}

static inline int draw_interleaved_2_of_5(Canvas *c, int x, int y,
                                          int module_width, int bar_height,
                                          size_t group_start_index,
                                          size_t group_end_index)
{
    int curr_x_offset = 0;
    const char *widths1 = NULL;
    const char *widths2 = NULL;
    int d1 = -1;
    int d2 = -1;
    for (size_t i = group_start_index; i < group_end_index; i += 2) {
        d1 = char_to_digit(data_buffer[i]);
        d2 = char_to_digit(data_buffer[i + 1]);
        widths1 = WIDTHS[d1];
        widths2 = WIDTHS[d2];
        for (size_t j = 0; j < ITF14_WIDTHS_PER_DIGIT; ++j) {
            curr_x_offset +=
                draw_pattern(c, get_binary_width(widths1[j], true),
                             x + curr_x_offset, y, module_width, bar_height);
            curr_x_offset +=
                draw_pattern(c, get_binary_width(widths2[j], false),
                             x + curr_x_offset, y, module_width, bar_height);
        }
    }
    return curr_x_offset;
}

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int vertical_quiet_zone_px = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int horizontal_quiet_zone_px =
        HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    canvas_width = (ITF14_TOTAL_MODULES * module_width_px) +
                   (2 * horizontal_quiet_zone_px);
    canvas_height = bar_height_px + (2 * vertical_quiet_zone_px);
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int checksum = compose_checksum_mod10_complement(
        data_buffer, ITF14_CHECKSUM_INDEX, ITF14_ODD_POS_WEIGHT,
        ITF14_EVEN_POS_WEIGHT, ITF14_CHECKSUM_MODULO);
    data_buffer[ITF14_CHECKSUM_INDEX] = digit_to_char(checksum);
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    curr_x += draw_pattern(&c, ITF14_START_CODE, curr_x, curr_y,
                           module_width_px, bar_height_px);
    curr_x += draw_interleaved_2_of_5(&c, curr_x, curr_y, module_width_px,
                                      bar_height_px, 0, 13);
    curr_x += draw_pattern(&c, ITF14_STOP_CODE, curr_x, curr_y, module_width_px,
                           bar_height_px);
}
