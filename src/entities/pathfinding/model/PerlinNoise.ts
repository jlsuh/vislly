import { getRandomAngle } from '@/shared/lib/random.ts';

type CoordinateKey = `${number},${number}`;

class PerlinNoise {
  private gradients: Record<CoordinateKey, { x: number; y: number }> = {};
  private memory: Record<CoordinateKey, number> = {};

  public dotProductGrid(x: number, y: number, vx: number, vy: number): number {
    let gVector: { x: number; y: number };
    const dVector = { x: x - vx, y: y - vy };
    if (this.gradients[`${vx},${vy}`]) {
      gVector = this.gradients[`${vx},${vy}`];
    } else {
      const theta = getRandomAngle();
      gVector = { x: Math.cos(theta), y: Math.sin(theta) };
      this.gradients[`${vx},${vy}`] = gVector;
    }
    return dVector.x * gVector.x + dVector.y * gVector.y;
  }

  private perlinQuinticSmoothstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  private interp(x: number, a0: number, a1: number) {
    return a0 + this.perlinQuinticSmoothstep(x) * (a1 - a0);
  }

  public get(x: number, y: number): number {
    if (this.memory[`${x},${y}`] !== undefined) {
      return this.memory[`${x},${y}`];
    }
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const tl = this.dotProductGrid(x, y, xf, yf);
    const tr = this.dotProductGrid(x, y, xf + 1, yf);
    const bl = this.dotProductGrid(x, y, xf, yf + 1);
    const br = this.dotProductGrid(x, y, xf + 1, yf + 1);
    const xt = this.interp(x - xf, tl, tr);
    const xb = this.interp(x - xf, bl, br);
    const v = this.interp(y - yf, xt, xb);
    this.memory[`${x},${y}`] = v;
    return v;
  }
}

export { PerlinNoise };
