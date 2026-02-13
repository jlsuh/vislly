#ifndef BARCODE_H_
#define BARCODE_H_

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#include "graphics.h"

#define ASCII_ZERO '0'
#define ASCII_NINE '9'
#define NULL_TERMINATOR '\0'

#define C_BLACK 0xFF000000
#define C_WHITE 0xFFFFFFFF

#define MAX_WIDTH 8192
#define MAX_HEIGHT 1024

#define BASE_BAR_HEIGHT_PX 160
#define BASE_MODULE_WIDTH_PX 4
#define BASE_VERTICAL_QUIET_ZONE_PX 30
#define HORIZONTAL_QUIET_ZONE_MULTIPLIER 10

#define BARCODE_BUFFER_SIZE 256

extern uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];
extern int canvas_width;
extern int canvas_height;
extern int dpr;

extern char data_buffer[BARCODE_BUFFER_SIZE];
extern int symbol_buffer[BARCODE_BUFFER_SIZE];

int char_to_digit(char c);
bool is_digit(char c);
int kernighan_ritchie_strlen(const char *s);
bool kernighan_ritchie_strncmp(const char *s1, const char *s2, int n);
int draw_pattern(Canvas *c, const char *pattern, int x, int y, int module_width,
                 int bar_height);

char *get_data_buffer(void);
int get_height(void);
int get_max_input_length(void);
int get_module_width(void);
uint32_t *get_pixel_buffer(void);
int get_width(void);
void set_dpr(int user_dpr);

#endif // BARCODE_H_
