#ifndef GRAPHICS_H_
#define GRAPHICS_H_

#include <stdint.h>

#define CANVAS_NULL ((Canvas){0})

#define RGBA(r, g, b, a)                                                                                               \
    ((((uint32_t)(a) & 0xFF) << 24) | (((uint32_t)(b) & 0xFF) << 16) | (((uint32_t)(g) & 0xFF) << 8) |                 \
     (((uint32_t)(r) & 0xFF)))

#define C_BLUE RGBA(0, 0, 255, 255)
#define C_BLACK RGBA(0, 0, 0, 255)
#define C_WHITE RGBA(255, 255, 255, 255)

typedef struct {
    uint32_t *pixels;
    int width;
    int height;
} Canvas;

typedef struct {
    int size;
    const uint8_t *widths;
    const uint8_t *glyphs;
} CanvasFont;

Canvas canvas_create(uint32_t *pixels, int width, int height);
void canvas_fill_rect(Canvas *self, int x0, int y0, int width, int height, uint32_t color);
void canvas_stroke_rect(Canvas *self, int x0, int y0, int width, int height, int border, uint32_t color);

int canvas_measure_text(const char *text, CanvasFont font, float scale, float letter_spacing);
void canvas_draw_text(Canvas *self, const char *text, int text_x, int text_y, CanvasFont font, float scale,
                      uint32_t color, float letter_spacing);

#endif // GRAPHICS_H_
