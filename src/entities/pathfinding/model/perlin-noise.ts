import { composeRandomAngle } from '@/shared/lib/random.ts';
import { Vector2 } from '@/shared/lib/vector2.ts';

class PerlinNoise {
  private gradients: Record<`${number},${number}`, Vector2> = {};
  private smoothingFunction = this.perlinQuinticSmoothstep;

  private dotGrid(x: number, y: number, ix: number, iy: number): number {
    const d = new Vector2(x - ix, y - iy);
    if (this.gradients[`${ix},${iy}`] === undefined) {
      const theta = composeRandomAngle();
      this.gradients[`${ix},${iy}`] = new Vector2(
        Math.cos(theta),
        Math.sin(theta),
      );
    }
    return d.dot(this.gradients[`${ix},${iy}`]);
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
    const topLeft = this.dotGrid(x, y, x0, y0);
    const topRight = this.dotGrid(x, y, x0 + 1, y0);
    const bottomLeft = this.dotGrid(x, y, x0, y0 + 1);
    const bottomRight = this.dotGrid(x, y, x0 + 1, y0 + 1);
    const xTop = this.interpolate(this.smoothingFunction)(
      x - x0,
      topLeft,
      topRight,
    );
    const xBottom = this.interpolate(this.smoothingFunction)(
      x - x0,
      bottomLeft,
      bottomRight,
    );
    const intensity = this.interpolate(this.smoothingFunction)(
      y - y0,
      xTop,
      xBottom,
    );
    return intensity;
  }
}

export { PerlinNoise };
