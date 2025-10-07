import { Vector2 } from '@/shared/lib/vector2.ts';

type CoefficientOfRestitution = number;
type ParticleSettings = {
  readonly fillColor: string;
  readonly isTracked: boolean;
  readonly r: number;
  readonly vix: number;
  readonly viy: number;
  readonly x: number;
  readonly y: number;
};

class Particle {
  public readonly fillColor: string;
  public readonly isTracked: boolean;
  public readonly mass: number;
  public readonly r: number;
  public curr: Vector2;
  public prev: Vector2;
  public v: Vector2;

  public constructor(settings: ParticleSettings) {
    const { fillColor, isTracked, r, vix, viy, x, y } = settings;
    this.fillColor = fillColor;
    this.isTracked = isTracked;
    this.mass = r;
    this.r = r;
    this.curr = new Vector2(x, y);
    this.prev = this.curr;
    this.v = new Vector2(vix, viy);
  }

  private isCollidingWith(that: Particle): boolean {
    return this.curr.sqrdDistanceTo(that.curr) < this.rSqrd(that);
  }

  private isGoingTowards(that: Particle): boolean {
    const d = this.curr.sub(that.curr);
    const v = this.v.sub(that.v);
    const minusV = v.map((x) => -x);
    return d.dot(minusV) > 0;
  }

  private rSqrd(that: Particle): number {
    const rt = this.r + that.r;
    return rt * rt;
  }

  /**
   * @see {@link https://physics.stackexchange.com/questions/708495/angle-free-two-dimensional-inelastic-collision-formula | Angle-free two-dimensional inelastic collision formula}
   * @see {@link https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects | Elastic collision}
   */
  public collide(that: Particle, cor: CoefficientOfRestitution): void {
    const mt = this.mass + that.mass;
    const dSqrd = this.curr.sqrdDistanceTo(that.curr);
    const d = this.curr.sub(that.curr);
    const v = this.v.sub(that.v);
    const dot = d.dot(v);
    const v1x = this.v.x - ((1 + cor) * that.mass * dot * d.x) / (dSqrd * mt);
    const v1y = this.v.y - ((1 + cor) * that.mass * dot * d.y) / (dSqrd * mt);
    const v2x = that.v.x + ((1 + cor) * this.mass * dot * d.x) / (dSqrd * mt);
    const v2y = that.v.y + ((1 + cor) * this.mass * dot * d.y) / (dSqrd * mt);
    this.v = new Vector2(v1x, v1y);
    that.v = new Vector2(v2x, v2y);
  }

  public isHorizontalWallCollision(width: number): boolean {
    return this.curr.x - this.r < 0 || this.curr.x + this.r > width;
  }

  public isVerticalWallCollision(height: number): boolean {
    return this.curr.y - this.r < 0 || this.curr.y + this.r > height;
  }

  public move(): void {
    this.prev = this.curr;
    this.curr = this.curr.add(this.v);
  }

  public shouldCollideWith(that: Particle): boolean {
    return (
      this !== that && this.isCollidingWith(that) && this.isGoingTowards(that)
    );
  }
}

export { Particle, type CoefficientOfRestitution, type ParticleSettings };
