import { type Branded, make } from './branding.ts';

type Channel = Branded<number, 'Channel'>;

const makeChannel: (value: unknown) => Channel = make<Channel>(
  (value: unknown): asserts value is Channel => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('Channel must be a finite number');
    }
    if (value < 0 || value > 1) {
      throw new RangeError('RGBA channel value must be between 0 and 1');
    }
  },
);

class Rgba {
  public readonly r: Channel;
  public readonly g: Channel;
  public readonly b: Channel;
  public readonly a: Channel;

  public constructor(r: number, g: number, b: number, a: number) {
    this.r = makeChannel(r);
    this.g = makeChannel(g);
    this.b = makeChannel(b);
    this.a = makeChannel(a);
  }

  public toStyle(): string {
    return `rgb(${this.r * 255} ${this.g * 255} ${this.b * 255} / ${this.a})`;
  }
}

const GREEN: string = new Rgba(0, 1, 0, 1).toStyle();
const RED: string = new Rgba(1, 0, 0, 1).toStyle();
const WHITE: string = new Rgba(1, 1, 1, 1).toStyle();

export { GREEN, RED, Rgba, WHITE };
