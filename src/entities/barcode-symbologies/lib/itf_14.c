#include <stdbool.h>
#include <stddef.h>

#include "barcode.h"
#include "graphics.h"

#define ITF14_BINARY_BAR "1"
#define ITF14_WIDE_CHAR 'W'

#define ITF14_NARROW_BAR_BASE 4
#define ITF14_NARROW_SPACE_BASE 5
#define ITF14_WIDE_BAR_BASE 11
#define ITF14_WIDE_SPACE_BASE 12

#define ITF14_CHECKSUM_INDEX 13
#define ITF14_CHECKSUM_MODULO 10
#define ITF14_EVEN_POS_WEIGHT 1
#define ITF14_ODD_POS_WEIGHT 3
#define ITF14_START_INDEX 0
#define ITF14_WIDTHS_PER_DIGIT 5

#define ITF14_RESOLVE_WIDTH(pattern_char, wide_width, narrow_width)            \
    (((pattern_char) == ITF14_WIDE_CHAR) ? (wide_width) : (narrow_width))

static const char *const WIDTHS[DIGITS_COUNT] = {
    "nnWWn", "WnnnW", "nWnnW", "WWnnn", "nnWnW",
    "WnWnn", "nWWnn", "nnnWW", "WnnWn", "nWnWn"};

static inline int draw_start_pattern(Canvas *c, int x, int y, int n_bar,
                                     int n_space, int height)
{
    int offset = 0;
    offset += draw_pattern(c, ITF14_BINARY_BAR, x + offset, y, n_bar, height);
    offset += n_space;
    offset += draw_pattern(c, ITF14_BINARY_BAR, x + offset, y, n_bar, height);
    offset += n_space;
    return offset;
}

static inline int draw_stop_pattern(Canvas *c, int x, int y, int n_bar,
                                    int w_bar, int n_space, int height)
{
    int offset = 0;
    offset += draw_pattern(c, ITF14_BINARY_BAR, x + offset, y, w_bar, height);
    offset += n_space;
    offset += draw_pattern(c, ITF14_BINARY_BAR, x + offset, y, n_bar, height);
    return offset;
}

static inline int draw_interleaved_2_of_5(Canvas *c, int x, int y, int n_bar,
                                          int w_bar, int n_space, int w_space,
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
            offset += draw_pattern(
                c, ITF14_BINARY_BAR, x + offset, y,
                ITF14_RESOLVE_WIDTH(bars_pattern[j], w_bar, n_bar), height);
            offset += ITF14_RESOLVE_WIDTH(spaces_pattern[j], w_space, n_space);
        }
    }
    return offset;
}

void render(void)
{
    int n_bar = ITF14_NARROW_BAR_BASE * dpr;
    int n_space = ITF14_NARROW_SPACE_BASE * dpr;
    int w_bar = ITF14_WIDE_BAR_BASE * dpr;
    int w_space = ITF14_WIDE_SPACE_BASE * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int horizontal_quiet_zone = HORIZONTAL_QUIET_ZONE_MULTIPLIER * n_space;
    int vertical_quiet_zone = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int pair_width = (2 * w_bar + 3 * n_bar) + (2 * w_space + 3 * n_space);
    int content_body_width = 7 * pair_width;
    int start_code_total_width = 2 * n_bar + 2 * n_space;
    int stop_code_total_width = w_bar + n_space + n_bar;
    int content_width_px =
        start_code_total_width + content_body_width + stop_code_total_width;
    canvas_width = 2 * horizontal_quiet_zone + content_width_px;
    canvas_height = bar_height_px + 2 * vertical_quiet_zone;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int checksum = mod10_complement(data_buffer, ITF14_CHECKSUM_INDEX,
                                    ITF14_ODD_POS_WEIGHT, ITF14_EVEN_POS_WEIGHT,
                                    ITF14_CHECKSUM_MODULO);
    data_buffer[ITF14_CHECKSUM_INDEX] = digit_to_char(checksum);
    int curr_x = horizontal_quiet_zone;
    int curr_y = vertical_quiet_zone;
    curr_x +=
        draw_start_pattern(&c, curr_x, curr_y, n_bar, n_space, bar_height_px);
    curr_x += draw_interleaved_2_of_5(&c, curr_x, curr_y, n_bar, w_bar, n_space,
                                      w_space, bar_height_px, ITF14_START_INDEX,
                                      ITF14_CHECKSUM_INDEX);
    curr_x += draw_stop_pattern(&c, curr_x, curr_y, n_bar, w_bar, n_space,
                                bar_height_px);
}
