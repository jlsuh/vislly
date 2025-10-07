class Vector2 {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(that: Vector2): Vector2 {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  public dot(that: Vector2): number {
    return this.x * that.x + this.y * that.y;
  }

  public map(fn: (number: number) => number): Vector2 {
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

export { Vector2 };
