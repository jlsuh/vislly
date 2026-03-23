const FONT_SIZE = 64;
const RENDER_SIZE = 48;
const CHAR_COUNT = 95;

const DEFAULT_FONT = 'Arial';

interface RasterizedFont {
  glyphs: Uint8Array;
  name: string;
  widths: Uint8Array;
}

function rasterizeFromContext(
  ctx: CanvasRenderingContext2D,
  name: string,
): RasterizedFont {
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  const widths = new Uint8Array(CHAR_COUNT);
  const glyphs = new Uint8Array(CHAR_COUNT * FONT_SIZE * FONT_SIZE);
  for (let i = 0; i < CHAR_COUNT; i++) {
    const char = String.fromCharCode(i + 32);
    widths[i] = Math.ceil(ctx.measureText(char).width) + 2;
    ctx.clearRect(0, 0, FONT_SIZE, FONT_SIZE);
    ctx.fillText(char, 2, Math.floor(FONT_SIZE / 2));
    const imgData = ctx.getImageData(0, 0, FONT_SIZE, FONT_SIZE);
    const glyphOffset = i * FONT_SIZE * FONT_SIZE;
    for (let p = 0; p < FONT_SIZE * FONT_SIZE; p++) {
      glyphs[glyphOffset + p] = imgData.data[p * 4 + 3];
    }
  }
  return { glyphs, name, widths };
}

function rasterizeSystemFont(fontFamily: string): RasterizedFont {
  const canvas = document.createElement('canvas');
  canvas.width = FONT_SIZE;
  canvas.height = FONT_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D context');
  ctx.font = `${RENDER_SIZE}px ${fontFamily}`;
  return rasterizeFromContext(ctx, fontFamily);
}

export { DEFAULT_FONT, type RasterizedFont, rasterizeSystemFont };
