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

#define ITF14_RESOLVE_WIDTH(pattern_char, wide_width, narrow_width)                                                    \
    ((ITF14_WIDE_CHAR == (pattern_char)) ? (wide_width) : (narrow_width))

static const char *const WIDTHS[DIGITS_COUNT] = {"nnWWn", "WnnnW", "nWnnW", "WWnnn", "nnWnW",
                                                 "WnWnn", "nWWnn", "nnnWW", "WnnWn", "nWnWn"};

typedef struct {
    Canvas *c;
    int y;
    int height;
    int narrow_bar;
    int narrow_space;
    int wide_bar;
    int wide_space;
} Itf14Context;

static inline int draw_start_pattern(const Itf14Context *ctx, int x)
{
    int offset = 0;
    offset += draw_pattern(ctx->c, ITF14_BINARY_BAR, x + offset, ctx->y, ctx->narrow_bar, ctx->height);
    offset += ctx->narrow_space;
    offset += draw_pattern(ctx->c, ITF14_BINARY_BAR, x + offset, ctx->y, ctx->narrow_bar, ctx->height);
    offset += ctx->narrow_space;
    return offset;
}

static inline int draw_stop_pattern(const Itf14Context *ctx, int x)
{
    int offset = 0;
    offset += draw_pattern(ctx->c, ITF14_BINARY_BAR, x + offset, ctx->y, ctx->wide_bar, ctx->height);
    offset += ctx->narrow_space;
    offset += draw_pattern(ctx->c, ITF14_BINARY_BAR, x + offset, ctx->y, ctx->narrow_bar, ctx->height);
    return offset;
}

static inline int draw_interleaved_2_of_5(const Itf14Context *ctx, int x, size_t group_start_index,
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
            offset += draw_pattern(ctx->c, ITF14_BINARY_BAR, x + offset, ctx->y,
                                   ITF14_RESOLVE_WIDTH(bars_pattern[j], ctx->wide_bar, ctx->narrow_bar), ctx->height);
            offset += ITF14_RESOLVE_WIDTH(spaces_pattern[j], ctx->wide_space, ctx->narrow_space);
        }
    }
    return offset;
}

void render(void)
{
    int narrow_bar = ITF14_NARROW_BAR_BASE * dpr;
    int narrow_space = ITF14_NARROW_SPACE_BASE * dpr;
    int wide_bar = ITF14_WIDE_BAR_BASE * dpr;
    int wide_space = ITF14_WIDE_SPACE_BASE * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int horizontal_quiet_zone = HORIZONTAL_QUIET_ZONE_MULTIPLIER * narrow_space;
    int text_bounding_height = SYMBOL_TEXT_BOUNDING_HEIGHT * dpr;
    int padding_top = SYMBOL_TEXT_PADDING_TOP_Y * dpr;
    int vertical_quiet_zone = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int pair_width = (2 * wide_bar + 3 * narrow_bar) + (2 * wide_space + 3 * narrow_space);
    int content_body_width = 7 * pair_width;
    int start_code_total_width = (2 * narrow_bar) + (2 * narrow_space);
    int stop_code_total_width = wide_bar + narrow_space + narrow_bar;
    int content_width_px = start_code_total_width + content_body_width + stop_code_total_width;
    int content_height = bar_height_px + padding_top + text_bounding_height;
    canvas_width = (2 * horizontal_quiet_zone) + content_width_px;
    canvas_height = vertical_quiet_zone + content_height + vertical_quiet_zone;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    int checksum = mod10_complement(data_buffer, ITF14_CHECKSUM_INDEX, ITF14_ODD_POS_WEIGHT, ITF14_EVEN_POS_WEIGHT,
                                    ITF14_CHECKSUM_MODULO);
    data_buffer[ITF14_CHECKSUM_INDEX] = digit_to_char(checksum);
    int curr_x = horizontal_quiet_zone;
    int curr_y = vertical_quiet_zone;
    Itf14Context ctx = {.c = &c,
                        .y = curr_y,
                        .height = bar_height_px,
                        .narrow_bar = narrow_bar,
                        .narrow_space = narrow_space,
                        .wide_bar = wide_bar,
                        .wide_space = wide_space};
    curr_x += draw_start_pattern(&ctx, curr_x);
    curr_x += draw_interleaved_2_of_5(&ctx, curr_x, ITF14_START_INDEX, ITF14_CHECKSUM_INDEX);
    curr_x += draw_stop_pattern(&ctx, curr_x);
    int text_y = curr_y + bar_height_px + padding_top;
    draw_centered_text(&c, data_buffer, 0, canvas_width, text_y);
}
