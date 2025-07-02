type Angle = number;
type Channel = number;
type CoefficientOfRestitution = number;
type Coord = number;
type FillColor = string;
type Limit = number;
type Mass = number;
type ParticleSettings = {
  readonly fillColor: FillColor;
  readonly isTracked: boolean;
  readonly r: Radius;
  readonly vix: Coord;
  readonly viy: Coord;
  readonly x: Coord;
  readonly y: Coord;
};
type Radius = number;
type RgbaChannels = ConstructorParameters<typeof Rgba>;

class Rgba {
  public readonly r: Channel;
  public readonly g: Channel;
  public readonly b: Channel;
  public readonly a: Channel;

  public constructor(r: Channel, g: Channel, b: Channel, a: Channel) {
    if (this.containsInvalidValues([r, g, b, a])) {
      throw new RangeError('RGBA channel value must be between 0 and 1');
    }
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  private containsInvalidValues(rgbaChannels: RgbaChannels): boolean {
    return rgbaChannels.some((value: Channel) => value < 0 || value > 1);
  }

  public toStyle(): string {
    return `rgb(${this.r * 255} ${this.g * 255} ${this.b * 255} / ${this.a})`;
  }
}

class Vector2 {
  public readonly x: Coord;
  public readonly y: Coord;

  public constructor(x: Coord, y: Coord) {
    this.x = x;
    this.y = y;
  }

  public add(that: Vector2): Vector2 {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  public dot(that: Vector2): number {
    return this.x * that.x + this.y * that.y;
  }

  public map(fn: (x: number) => number): Vector2 {
    return new Vector2(fn(this.x), fn(this.y));
  }

  public sqrdDistanceTo(that: Vector2): number {
    const dx = that.x - this.x;
    const dy = that.y - this.y;
    return dx * dx + dy * dy;
  }

  public sub(that: Vector2): Vector2 {
    return new Vector2(this.x - that.x, this.y - that.y);
  }
}

class Particle {
  public readonly fillColor: FillColor;
  public readonly isTracked: boolean;
  public readonly mass: Mass;
  public readonly r: Radius;
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

  public isHorizontalWallCollision(width: Limit): boolean {
    return this.curr.x - this.r < 0 || this.curr.x + this.r > width;
  }

  public isVerticalWallCollision(height: Limit): boolean {
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

export {
  Particle,
  Rgba,
  Vector2,
  type Angle,
  type Channel,
  type CoefficientOfRestitution,
  type Coord,
  type FillColor,
  type Limit,
  type Mass,
  type ParticleSettings,
};
