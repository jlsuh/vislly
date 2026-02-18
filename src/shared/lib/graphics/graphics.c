#include "graphics.h"

#include <stddef.h>

#define CLAMP(val, min, max)                                                   \
    (((val) < (min)) ? (min) : (((val) > (max)) ? (max) : (val)))

#define SWAP(a, b)                                                             \
    do {                                                                       \
        int t = (a);                                                           \
        (a) = (b);                                                             \
        (b) = t;                                                               \
    } while (0)

Canvas canvas_create(uint32_t *pixels, int width, int height)
{
    if (width <= 0 || height <= 0)
        return CANVAS_NULL;
    if (NULL == pixels)
        return CANVAS_NULL;
    return (Canvas){.pixels = pixels, .width = width, .height = height};
}

void canvas_fill_rect(Canvas *self, int x0, int y0, int width, int height,
                      uint32_t color)
{
    if (NULL == self->pixels)
        return;
    int x1 = x0 + width;
    int y1 = y0 + height;
    if (x1 < x0)
        SWAP(x0, x1);
    if (y1 < y0)
        SWAP(y0, y1);
    x0 = CLAMP(x0, 0, self->width);
    y0 = CLAMP(y0, 0, self->height);
    x1 = CLAMP(x1, 0, self->width);
    y1 = CLAMP(y1, 0, self->height);
    if (x1 == x0 || y1 == y0)
        return;
    for (int y = y0; y < y1; ++y) {
        uint32_t *row = self->pixels + (y * self->width);
        for (int x = x0; x < x1; ++x)
            row[x] = color;
    }
}
