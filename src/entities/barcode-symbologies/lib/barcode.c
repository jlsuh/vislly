#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#include "barcode.h"
#include "graphics.h"

char data_buffer[BARCODE_BUFFER_SIZE];
int canvas_height = 0;
int canvas_width = 0;
int dpr = 1;
int symbol_buffer[BARCODE_BUFFER_SIZE];
uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];

uint8_t custom_font_glyphs[CUSTOM_FONT_GLYPH_COUNT * CUSTOM_FONT_GLYPH_SIZE * CUSTOM_FONT_GLYPH_SIZE];
uint8_t custom_font_widths[CUSTOM_FONT_GLYPH_COUNT];

bool is_control_char(char c)
{
    return c >= NULL_TERMINATOR && c <= ASCII_MAX_CONTROL_CHAR;
}

bool is_digit(char c)
{
    return c >= ASCII_ZERO && c <= ASCII_NINE;
}

bool is_lowercased_alpha(char c)
{
    return c >= ASCII_LOWERCASED_A && c <= ASCII_LOWERCASED_Z;
}

bool is_uppercased_alpha(char c)
{
    return c >= ASCII_UPPERCASED_A && c <= ASCII_UPPERCASED_Z;
}

bool wasm_strncmp(const char *s1, const char *s2, int n)
{
    for (int i = 0; i < n; ++i)
        if (s1[i] != s2[i] || NULL_TERMINATOR == s1[i])
            return false;
    return true;
}

char digit_to_char(int d)
{
    return (char)(d + ASCII_ZERO);
}

int char_to_digit(char c)
{
    return c - ASCII_ZERO;
}

int draw_pattern(Canvas *c, const char *const pattern, int x, int y, int module_width, int bar_height)
{
    int curr_x = x;
    int i = 0;
    while (NULL_TERMINATOR != pattern[i]) {
        if (BAR == pattern[i])
            canvas_fill_rect(c, curr_x, y, module_width, bar_height, C_BLACK);
        curr_x += module_width;
        ++i;
    }
    return curr_x - x;
}

int mod10_complement(const char *const data_buffer, size_t len, int odd_pos_weight, int even_pos_weight,
                     int checksum_modulo)
{
    int dividend = 0;
    int weights[] = {odd_pos_weight, even_pos_weight};
    for (size_t i = len, weight_idx = 0; i > 0; --i, weight_idx ^= 1)
        dividend += char_to_digit(data_buffer[i - 1]) * weights[weight_idx];
    int remainder = dividend % checksum_modulo;
    return (checksum_modulo - remainder) % checksum_modulo;
}

int wasm_strlen(const char *s)
{
    int i = 0;
    while (NULL_TERMINATOR != s[i])
        ++i;
    return i;
}

void *wasm_memset(void *dest, int c, size_t n)
{
    unsigned char *p = dest;
    while (--n) {
        *p++ = (unsigned char)c;
    }
    return dest;
}

char *get_data_buffer(void)
{
    return data_buffer;
}

int get_height(void)
{
    return canvas_height;
}

int get_width(void)
{
    return canvas_width;
}

uint32_t *get_pixel_buffer(void)
{
    return pixels;
}

void set_dpr(int user_dpr)
{
    if (user_dpr < MIN_DPR)
        user_dpr = MIN_DPR;
    else if (user_dpr > MAX_DPR)
        user_dpr = MAX_DPR;
    dpr = user_dpr;
}

uint8_t *get_custom_font_widths_buffer(void)
{
    return custom_font_widths;
}

uint8_t *get_custom_font_glyphs_buffer(void)
{
    return custom_font_glyphs;
}

static inline CanvasFont get_standard_font(void)
{
    return (CanvasFont){.size = CUSTOM_FONT_GLYPH_SIZE, .widths = custom_font_widths, .glyphs = custom_font_glyphs};
}

static inline float get_text_scale(CanvasFont font)
{
    float target_font_height_px = (float)(SYMBOL_FONT_SIZE * dpr);
    return target_font_height_px / (float)font.size;
}

int measure_text(const char *text)
{
    CanvasFont font = get_standard_font();
    return canvas_measure_text(text, font, get_text_scale(font), 0.0f);
}

void draw_text(Canvas *c, const char *text, int x, int y)
{
    CanvasFont font = get_standard_font();
    canvas_draw_text(c, text, x, y, font, get_text_scale(font), C_BLACK, 0.0f);
}

void draw_centered_text(Canvas *c, const char *text, int bounding_x, int bounding_width, int y)
{
    int text_width = measure_text(text);
    int text_x = bounding_x + (bounding_width - text_width) / 2;
    draw_text(c, text, text_x, y);
}
