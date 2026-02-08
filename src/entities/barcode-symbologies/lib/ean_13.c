#include <stddef.h>

#include "graphics.h"

#define ASCII_ZERO '0'
#define ASCII_NINE '9'
#define NULL_TERMINATOR '\0'

#define ENC_L 0
#define ENC_G 1
#define ENC_R 2
#define ENCODING_TYPES_COUNT 3

#define MARKER_START "101"
#define MARKER_CENTER "01010"
#define MARKER_END "101"

#define C_BLACK 0xFF000000
#define C_WHITE 0xFFFFFFFF

#define BUFFER_SIZE 13
#define MAX_WIDTH 13000
#define MAX_HEIGHT 1200
#define DIGITS_COUNT 10
#define TOTAL_MODULES_EAN13 95
#define CHECKSUM_MODULO 10
#define CHECKSUM_INDEX 12
#define CHECKSUM_ODD_WEIGHT 3
#define GROUP_LEN 6

#define BASE_BAR_HEIGHT_PX 160
#define BASE_MODULE_WIDTH_PX 4
#define BASE_VERTICAL_QUIET_ZONE_PX 30
#define HORIZONTAL_QUIET_ZONE_MULTIPLIER 10

char data_buffer[BUFFER_SIZE];
int symbol_buffer[BUFFER_SIZE];
uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];

int canvas_width = 0;
int canvas_height = 0;
int dpr = 1;

const char *PARITY_PATTERNS[DIGITS_COUNT] = {
    "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
    "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"};

const char *ENCODING_TABLE[DIGITS_COUNT][ENCODING_TYPES_COUNT] = {
    {"0001101", "0100111", "1110010"}, {"0011001", "0110011", "1100110"},
    {"0010011", "0011011", "1101100"}, {"0111101", "0100001", "1000010"},
    {"0100011", "0011101", "1011100"}, {"0110001", "0111001", "1001110"},
    {"0101111", "0000101", "1010000"}, {"0111011", "0010001", "1000100"},
    {"0110111", "0001001", "1001000"}, {"0001011", "0010111", "1110100"}};

static inline int char_to_digit(char c)
{
    return c - ASCII_ZERO;
}

static inline int get_encoding_type(char p)
{
    if (p == 'L')
        return ENC_L;
    if (p == 'G')
        return ENC_G;
    return ENC_R;
}

int draw_pattern(Canvas *c, const char *pattern, int x, int y, int module_width,
                 int bar_height)
{
    int i = 0;
    while (pattern[i] != NULL_TERMINATOR) {
        if (pattern[i] == '1') {
            canvas_fill_rect(c, x, y, module_width, bar_height, C_BLACK);
        }
        x += module_width;
        i++;
    }
    return i * module_width;
}

int compose_checksum(void)
{
    int sum_odd = 0;
    int sum_even = 0;
    for (int i = 0; i < CHECKSUM_INDEX; i++) {
        int digit = char_to_digit(data_buffer[i]);
        symbol_buffer[i] = digit;
        if (i % 2 == 0)
            sum_even += digit;
        else
            sum_odd += digit;
    }
    int dividend = sum_even + (sum_odd * CHECKSUM_ODD_WEIGHT);
    int remainder = dividend % CHECKSUM_MODULO;
    return (remainder == 0) ? 0 : (CHECKSUM_MODULO - remainder);
}

int draw_group(Canvas *c, int x, int y, int module_width, int bar_height,
               int *symbol_idx, const char *parity_pattern)
{
    int curr_x_offset = 0;
    for (int i = 0; i < GROUP_LEN; ++i) {
        int digit = symbol_buffer[(*symbol_idx)++];
        int encoding_idx = ENC_R;
        if (parity_pattern != NULL) {
            encoding_idx = get_encoding_type(parity_pattern[i]);
        }
        const char *code = ENCODING_TABLE[digit][encoding_idx];
        curr_x_offset += draw_pattern(c, code, x + curr_x_offset, y,
                                      module_width, bar_height);
    }
    return curr_x_offset;
}

int get_max_input_length(void)
{
    return BUFFER_SIZE - 1;
}

char *get_data_buffer(void)
{
    return data_buffer;
}

int get_width(void)
{
    return canvas_width;
}

int get_height(void)
{
    return canvas_height;
}

uint32_t *get_pixel_buffer(void)
{
    return pixels;
}

void set_dpr(int user_dpr)
{
    if (user_dpr < 1)
        user_dpr = 1;
    if (user_dpr > 4)
        user_dpr = 4;
    dpr = user_dpr;
}

void render(void)
{
    int module_width_px = BASE_MODULE_WIDTH_PX * dpr;
    int bar_height_px = BASE_BAR_HEIGHT_PX * dpr;
    int vertical_quiet_zone_px = BASE_VERTICAL_QUIET_ZONE_PX * dpr;
    int horizontal_quiet_zone_px =
        HORIZONTAL_QUIET_ZONE_MULTIPLIER * module_width_px;
    canvas_width = (TOTAL_MODULES_EAN13 * module_width_px) +
                   (2 * horizontal_quiet_zone_px);
    canvas_height = bar_height_px + (2 * vertical_quiet_zone_px);
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    symbol_buffer[CHECKSUM_INDEX] = compose_checksum();
    int curr_x = horizontal_quiet_zone_px;
    int curr_y = vertical_quiet_zone_px;
    int first_digit = symbol_buffer[0];
    int curr_symbol_idx = 1;
    const char *parity_pattern = PARITY_PATTERNS[first_digit];
    curr_x += draw_pattern(&c, MARKER_START, curr_x, curr_y, module_width_px,
                           bar_height_px);
    curr_x += draw_group(&c, curr_x, curr_y, module_width_px, bar_height_px,
                         &curr_symbol_idx, parity_pattern);
    curr_x += draw_pattern(&c, MARKER_CENTER, curr_x, curr_y, module_width_px,
                           bar_height_px);
    curr_x += draw_group(&c, curr_x, curr_y, module_width_px, bar_height_px,
                         &curr_symbol_idx, NULL);
    curr_x += draw_pattern(&c, MARKER_END, curr_x, curr_y, module_width_px,
                           bar_height_px);
}
