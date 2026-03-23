#include "graphics.h"

#include <stdbool.h>
#include <stddef.h>

#define NO_BORDER 0

#define CLAMP(val, min, max) (((val) < (min)) ? (min) : (((val) > (max)) ? (max) : (val)))

#define SWAP(a, b)                                                                                                     \
    do {                                                                                                               \
        int t = (a);                                                                                                   \
        (a) = (b);                                                                                                     \
        (b) = t;                                                                                                       \
    } while (0)

Canvas canvas_create(uint32_t *pixels, int width, int height)
{
    if (width <= 0 || height <= 0)
        return CANVAS_NULL;
    if (NULL == pixels)
        return CANVAS_NULL;
    return (Canvas){.pixels = pixels, .width = width, .height = height};
}

void canvas_fill_rect(Canvas *self, int x0, int y0, int width, int height, uint32_t color)
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

void canvas_stroke_rect(Canvas *self, int x0, int y0, int width, int height, int border, uint32_t color)
{
    if (NO_BORDER == border || NULL == self->pixels)
        return;
    if (border * 2 < width && border * 2 < height) {
        canvas_fill_rect(self, x0, y0, width, border, color);
        canvas_fill_rect(self, x0, y0 + height - border, width, border, color);
        canvas_fill_rect(self, x0, y0 + border, border, height - (2 * border), color);
        canvas_fill_rect(self, x0 + width - border, y0 + border, border, height - (2 * border), color);
        return;
    }
    canvas_fill_rect(self, x0, y0, width, height, color);
}

int canvas_measure_text(const char *text, CanvasFont font, float scale, float letter_spacing)
{
    float width = 0.0f;
    int len = 0;
    for (size_t i = 0; text[i] != '\0'; ++i) {
        unsigned char c = (unsigned char)text[i];
        if (c < 32 || c > 126)
            c = 32;
        width += (float)font.widths[c - 32] * scale;
        len++;
    }
    if (len > 1) {
        width += (float)(len - 1) * letter_spacing;
    }
    return (int)width;
}

static inline uint32_t canvas_blend_color(uint32_t fg, uint32_t bg, float alpha)
{
    if (alpha <= 0.0f)
        return bg;
    if (alpha >= 1.0f)
        return fg;
    uint32_t r_fg = fg & 0xFF, g_fg = (fg >> 8) & 0xFF, b_fg = (fg >> 16) & 0xFF;
    uint32_t r_bg = bg & 0xFF, g_bg = (bg >> 8) & 0xFF, b_bg = (bg >> 16) & 0xFF;
    uint32_t r = (uint32_t)((float)r_bg + (((float)r_fg - (float)r_bg) * alpha));
    uint32_t g = (uint32_t)((float)g_bg + (((float)g_fg - (float)g_bg) * alpha));
    uint32_t b = (uint32_t)((float)b_bg + (((float)b_fg - (float)b_bg) * alpha));
    return RGBA(r, g, b, 255);
}

static inline float apply_adaptive_sharpening(float bilinear_alpha, float scale)
{
    float edge_width = 0.5f / scale;
    bool is_edge_too_wide = (edge_width > 0.45f);
    if (is_edge_too_wide) {
        edge_width = 0.45f;
    }
    float lower_bound = 0.5f - edge_width;
    float upper_bound = 0.5f + edge_width;
    bool is_transparent_noise = (bilinear_alpha <= lower_bound);
    if (is_transparent_noise) {
        return 0.0f;
    }
    bool is_solid_core = (bilinear_alpha >= upper_bound);
    if (is_solid_core) {
        return 1.0f;
    }
    float normalized_alpha = (bilinear_alpha - lower_bound) / (upper_bound - lower_bound);
    return normalized_alpha * normalized_alpha * (3.0f - 2.0f * normalized_alpha);
}

static inline bool is_pixel_outside_canvas(const Canvas *canvas, int x, int y)
{
    bool is_out_left_or_top = (x < 0 || y < 0);
    bool is_out_right_or_bottom = (x >= canvas->width || y >= canvas->height);
    return (is_out_left_or_top || is_out_right_or_bottom);
}

static inline float fetch_glyph_alpha(const uint8_t *glyph, int font_size, int x, int y)
{
    bool is_out_of_bounds_x = (x < 0 || x >= font_size);
    bool is_out_of_bounds_y = (y < 0 || y >= font_size);

    if (is_out_of_bounds_x || is_out_of_bounds_y) {
        return 0.0f;
    }

    return (float)glyph[(y * font_size) + x] / 255.0f;
}

static inline float compose_bilinear_alpha(const uint8_t *glyph, int font_size, float src_x, float src_y)
{
    int base_x = (int)(src_x + 1000.0f) - 1000;
    int base_y = (int)(src_y + 1000.0f) - 1000;
    bool is_completely_outside_glyph = (base_x >= font_size || base_y >= font_size || base_x < -1 || base_y < -1);
    if (is_completely_outside_glyph)
        return 0.0f;
    float fract_x = src_x - (float)base_x;
    float fract_y = src_y - (float)base_y;
    float top_left = fetch_glyph_alpha(glyph, font_size, base_x, base_y);
    float top_right = fetch_glyph_alpha(glyph, font_size, base_x + 1, base_y);
    float bottom_left = fetch_glyph_alpha(glyph, font_size, base_x, base_y + 1);
    float bottom_right = fetch_glyph_alpha(glyph, font_size, base_x + 1, base_y + 1);
    float top_interp = top_left + (fract_x * (top_right - top_left));
    float bottom_interp = bottom_left + (fract_x * (bottom_right - bottom_left));
    return top_interp + (fract_y * (bottom_interp - top_interp));
}

static inline void draw_glyph_pixel(Canvas *canvas, const uint8_t *glyph, int font_size, float scale, uint32_t color,
                                    int canvas_x, int canvas_y, float dest_x, float dest_y)
{
    if (is_pixel_outside_canvas(canvas, canvas_x, canvas_y))
        return;
    float src_x = (dest_x / scale) - 0.5f;
    float src_y = (dest_y / scale) - 0.5f;
    float bilinear_alpha = compose_bilinear_alpha(glyph, font_size, src_x, src_y);
    float alpha = apply_adaptive_sharpening(bilinear_alpha, scale);
    if (alpha > 0.0f) {
        uint32_t *pixel = &canvas->pixels[(canvas_y * canvas->width) + canvas_x];
        *pixel = canvas_blend_color(color, *pixel, alpha);
    }
}

static void draw_single_glyph(Canvas *canvas, const uint8_t *glyph, int font_size, float scale, uint32_t color,
                              float start_x, int start_y)
{
    int base_x = (int)start_x;
    float fract_x = start_x - (float)base_x;
    int scaled_width = (int)((float)font_size * scale) + 1;
    int scaled_height = (int)((float)font_size * scale) + 1;
    for (int dy = 0; dy < scaled_height; ++dy) {
        for (int dx = 0; dx < scaled_width; ++dx) {
            int canvas_x = base_x + dx;
            int canvas_y = start_y + dy;
            float dest_x = (float)dx + 0.5f - fract_x;
            float dest_y = (float)dy + 0.5f;
            draw_glyph_pixel(canvas, glyph, font_size, scale, color, canvas_x, canvas_y, dest_x, dest_y);
        }
    }
}

void canvas_draw_text(Canvas *self, const char *text, int text_x, int text_y, CanvasFont font, float scale,
                      uint32_t color, float letter_spacing)
{
    bool is_invalid_input = (!self->pixels || !text || scale <= 0.0f);
    if (is_invalid_input)
        return;
    float current_x = (float)text_x;
    for (size_t i = 0; text[i] != '\0'; ++i) {
        unsigned char c = (unsigned char)text[i];
        bool is_printable = (c >= 32 && c <= 126);
        if (!is_printable)
            c = 32;
        int char_idx = c - 32;
        int glyph_pixel_count = font.size * font.size;
        const uint8_t *glyph = font.glyphs + (char_idx * glyph_pixel_count);
        draw_single_glyph(self, glyph, font.size, scale, color, current_x, text_y);
        float scaled_advance = ((float)font.widths[char_idx] * scale) + letter_spacing;
        current_x += scaled_advance;
    }
}
