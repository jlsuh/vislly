#ifndef GRAPHICS_H_
#define GRAPHICS_H_

#include <stdint.h>

#define SUCCESS 0
#define FAILURE -1
#define CANVAS_NULL ((Canvas){0})

#define RGBA(r, g, b, a)                                                                                               \
    ((((uint32_t)(a) & 0xFF) << 24) | (((uint32_t)(b) & 0xFF) << 16) | (((uint32_t)(g) & 0xFF) << 8) |                 \
     (((uint32_t)(r) & 0xFF)))

#define C_BLUE RGBA(0, 0, 255, 255)

typedef struct {
    uint32_t *pixels;
    int width;
    int height;
} Canvas;

Canvas canvas_create(uint32_t *pixels, int width, int height);
void canvas_fill_rect(Canvas *self, int x0, int y0, int width, int height, uint32_t color);
void canvas_stroke_rect(Canvas *self, int x0, int y0, int width, int height, int border, uint32_t color);

#endif // GRAPHICS_H_
