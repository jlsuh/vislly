import { generateRandomAngle } from '@/shared/lib/random.ts';
import { Vector2 } from '@/shared/lib/vector2.ts';

type IntersectionCoordinate = `${number},${number}`;

class PerlinNoise {
  private gradients: Record<IntersectionCoordinate, Vector2> = {};
  private smoothingFunction = this.perlinQuinticSmoothstep;

  private dotGrid(x: number, y: number, ix: number, iy: number): number {
    const d = new Vector2(x - ix, y - iy);
    let g: Vector2;
    if (this.gradients[`${ix},${iy}`] !== undefined) {
      g = this.gradients[`${ix},${iy}`];
    } else {
      const theta = generateRandomAngle();
      g = new Vector2(Math.cos(theta), Math.sin(theta));
      this.gradients[`${ix},${iy}`] = g;
    }
    return d.dot(g);
  }

  private interpolate(smoothingFunction: (x: number) => number) {
    return (x: number, a0: number, a1: number) => {
      return a0 + smoothingFunction(x) * (a1 - a0);
    };
  }

  private perlinQuinticSmoothstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  public get(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tl = this.dotGrid(x, y, x0, y0);
    const tr = this.dotGrid(x, y, x0 + 1, y0);
    const bl = this.dotGrid(x, y, x0, y0 + 1);
    const br = this.dotGrid(x, y, x0 + 1, y0 + 1);
    const xt = this.interpolate(this.smoothingFunction)(x - x0, tl, tr);
    const xb = this.interpolate(this.smoothingFunction)(x - x0, bl, br);
    const intensity = this.interpolate(this.smoothingFunction)(y - y0, xt, xb);
    return intensity;
  }
}

export { PerlinNoise, type IntersectionCoordinate };
