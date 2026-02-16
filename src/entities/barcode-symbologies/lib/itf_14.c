#include <stdbool.h>
#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define ITF14_BAR_PATTERN_NARROW "1"
#define ITF14_BAR_PATTERN_WIDE "11"
#define ITF14_CHECKSUM_INDEX 13
#define ITF14_CHECKSUM_MODULO 10
#define ITF14_EVEN_POS_WEIGHT 1
#define ITF14_NARROW_BAR_WIDTH 4
#define ITF14_NARROW_SPACE_WIDTH 6
#define ITF14_ODD_POS_WEIGHT 3
#define ITF14_START_INDEX 0
#define ITF14_WIDE_WIDTH 'W'
#define ITF14_WIDTHS_PER_DIGIT 5

#define ITF14_GET_BAR_PATTERN(pattern_char)                                    \
    (((pattern_char) == ITF14_WIDE_WIDTH) ? ITF14_BAR_PATTERN_WIDE             \
                                          : ITF14_BAR_PATTERN_NARROW)

#define ITF14_GET_SPACE_MODULES(pattern_char)                                  \
    (((pattern_char) == ITF14_WIDE_WIDTH) ? 2 : 1)

static const char *const WIDTHS[DIGITS_COUNT] = {
    "nnWWn", "WnnnW", "nWnnW", "WWnnn", "nnWnW",
    "WnWnn", "nWWnn", "nnnWW", "WnnWn", "nWnWn"};

static inline int draw_start_pattern(Canvas *c, int x, int y, int bar_width,
                                     int space_width, int height)
{
    int offset = 0;
    offset += draw_pattern(c, ITF14_BAR_PATTERN_NARROW, x + offset, y,
                           bar_width, height);
    offset += space_width;
    offset += draw_pattern(c, ITF14_BAR_PATTERN_NARROW, x + offset, y,
                           bar_width, height);
    offset += space_width;
    return offset;
}

static inline int draw_stop_pattern(Canvas *c, int x, int y, int bar_width,
                                    int space_width, int height)
{
    int offset = 0;
    offset += draw_pattern(c, ITF14_BAR_PATTERN_WIDE, x + offset, y, bar_width,
                           height);
    offset += space_width;
    offset += draw_pattern(c, ITF14_BAR_PATTERN_NARROW, x + offset, y,
                           bar_width, height);
    return offset;
}

static inline int draw_interleaved_2_of_5(Canvas *c, int x, int y,
                                          int bar_width, int space_width,
                                          int height, size_t group_start_index,
                                          size_t group_end_index)
{
    int offset = 0;
    const char *bars_pattern = NULL;
    const char *spaces_pattern = NULL;
    int d1 = -1;
    int d2 = -1;
    for (size_t i = group_start_index; i < group_end_index; i += 2) {
        d1 = char_to_digit(data_buffer[i]);
        d2 = char_to_digit(data_buffer[i + 1]);
        bars_pattern = WIDTHS[d1];
        spaces_pattern = WIDTHS[d2];
        for (size_t j = 0; j < ITF14_WIDTHS_PER_DIGIT; ++j) {
            offset += draw_pattern(c, ITF14_GET_BAR_PATTERN(bars_pattern[j]),
                                   x + offset, y, bar_width, height);
            offset += ITF14_GET_SPACE_MODULES(spaces_pattern[j]) * space_width;
        }
    }
    return offset;
}

void render(void)
{
    int n_bar = ITF14_NARROW_BAR_WIDTH * dpr;
    int n_space = ITF14_NARROW_SPACE_WIDTH * dpr;
    int w_bar = n_bar * 2;
    int w_space = n_space * 2;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int horizontal_quiet_zone = HORIZONTAL_QUIET_ZONE_MULTIPLIER * n_space;
    int vertical_quiet_zone = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int bars_total_width = 7 * (2 * w_bar + 3 * n_bar);
    int spaces_total_width = 7 * (2 * w_space + 3 * n_space);
    int start_code_total_width = 2 * n_bar + 2 * n_space;
    int stop_code_total_width = w_bar + n_space + n_bar;
    int content_width_px = start_code_total_width + bars_total_width +
                           spaces_total_width + stop_code_total_width;
    canvas_width = 2 * horizontal_quiet_zone + content_width_px;
    canvas_height = bar_height_px + 2 * vertical_quiet_zone;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int checksum = compose_checksum_mod10_complement(
        data_buffer, ITF14_CHECKSUM_INDEX, ITF14_ODD_POS_WEIGHT,
        ITF14_EVEN_POS_WEIGHT, ITF14_CHECKSUM_MODULO);
    data_buffer[ITF14_CHECKSUM_INDEX] = digit_to_char(checksum);
    int curr_x = horizontal_quiet_zone;
    int curr_y = vertical_quiet_zone;
    curr_x +=
        draw_start_pattern(&c, curr_x, curr_y, n_bar, n_space, bar_height_px);
    curr_x += draw_interleaved_2_of_5(&c, curr_x, curr_y, n_bar, n_space,
                                      bar_height_px, ITF14_START_INDEX,
                                      ITF14_CHECKSUM_INDEX);
    curr_x +=
        draw_stop_pattern(&c, curr_x, curr_y, n_bar, n_space, bar_height_px);
}
