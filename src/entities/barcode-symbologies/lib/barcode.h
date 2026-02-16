#ifndef BARCODE_H_
#define BARCODE_H_

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#include "graphics.h"

#define ASCII_NINE '9'
#define ASCII_ZERO '0'
#define DIGITS_COUNT 10
#define NULL_TERMINATOR '\0'

#define C_BLACK 0xFF000000
#define C_WHITE 0xFFFFFFFF

#define MAX_WIDTH 13000
#define MAX_HEIGHT 1200

#define BASE_BAR_HEIGHT_PX 160
#define BASE_MODULE_WIDTH_PX 4
#define BASE_VERTICAL_QUIET_ZONE_PX 30
#define HORIZONTAL_QUIET_ZONE_MULTIPLIER 10

#define BARCODE_BUFFER_SIZE 256

#define MAX_DPR 4
#define MIN_DPR 1

extern char data_buffer[BARCODE_BUFFER_SIZE];
extern int canvas_height;
extern int canvas_width;
extern int dpr;
extern int symbol_buffer[BARCODE_BUFFER_SIZE];
extern uint32_t pixels[MAX_WIDTH * MAX_HEIGHT];

bool is_digit(char c);
bool kernighan_ritchie_strncmp(const char *s1, const char *s2, int n);
char digit_to_char(int d);
int char_to_digit(char c);
int compose_checksum_mod10_complement(const char *const data_buffer, size_t len,
                                      int odd_pos_weight, int even_pos_weight,
                                      int checksum_modulo);
int draw_pattern(Canvas *c, const char *const pattern, int x, int y,
                 int module_width, int bar_height);
int kernighan_ritchie_strlen(const char *s);

char *get_data_buffer(void);
int get_height(void);
int get_width(void);
uint32_t *get_pixel_buffer(void);
void set_dpr(int user_dpr);

extern void render(void);

#endif // BARCODE_H_
