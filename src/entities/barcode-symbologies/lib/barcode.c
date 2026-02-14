#include <stdbool.h>
#include <stdint.h>

#include "barcode.h"
#include "graphics.h"

char data_buffer[BARCODE_BUFFER_SIZE];
int canvas_height = 0;
int canvas_width = 0;
int dpr = 1;
int symbol_buffer[BARCODE_BUFFER_SIZE];
uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];

bool is_digit(char c)
{
    return c >= ASCII_ZERO && c <= ASCII_NINE;
}

bool kernighan_ritchie_strncmp(const char *s1, const char *s2, int n)
{
    for (int i = 0; i < n; i++)
        if (s1[i] != s2[i] || NULL_TERMINATOR == s1[i])
            return false;
    return true;
}

int char_to_digit(char c)
{
    return c - ASCII_ZERO;
}

int draw_pattern(Canvas *c, const char *pattern, int x, int y, int module_width,
                 int bar_height)
{
    int curr_x = x;
    int i = 0;
    while (pattern[i] != NULL_TERMINATOR) {
        if (pattern[i] == '1')
            canvas_fill_rect(c, curr_x, y, module_width, bar_height, C_BLACK);
        curr_x += module_width;
        i++;
    }
    return curr_x - x;
}

int kernighan_ritchie_strlen(const char *s)
{
    int i = 0;
    while (NULL_TERMINATOR != s[i])
        ++i;
    return i;
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
    if (user_dpr > MAX_DPR)
        user_dpr = MAX_DPR;
    dpr = user_dpr;
}
