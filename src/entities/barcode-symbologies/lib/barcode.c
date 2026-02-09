#include <stdbool.h>
#include <stdint.h>

#include "barcode.h"

uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];

int canvas_width = 0;
int canvas_height = 0;
int dpr = 1;

int char_to_digit(char c)
{
    return c - ASCII_ZERO;
}

bool is_digit(char c)
{
    return c >= ASCII_ZERO && c <= ASCII_NINE;
}

int kernighan_ritchie_strlen(const char *s)
{
    int i = 0;
    while (NULL_TERMINATOR != s[i])
        ++i;
    return i;
}

bool kernighan_ritchie_strncmp(const char *s1, const char *s2, int n)
{
    for (int i = 0; i < n; i++)
        if (s1[i] != s2[i] || NULL_TERMINATOR == s1[i])
            return false;
    return true;
}

void set_dpr(int user_dpr)
{
    if (user_dpr < 1)
        user_dpr = 1;
    if (user_dpr > 4)
        user_dpr = 4;
    dpr = user_dpr;
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

char *get_data_buffer(void)
{
    return data_buffer;
}
