import { integerRange } from './arrays.ts';

function composeRandomAngle(): number {
  return Math.random() * 2 * Math.PI;
}

function composeRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function composeRandomFlooredIntegerBetween(min: number, max: number): number {
  return Math.floor(composeRandomBetween(min, max));
}

function composeSeed() {
  return (Math.random() * 2 ** 32) >>> 0;
}

/**
 * @see {@link https://vigna.di.unimi.it/ftp/papers/ScrambledLinear.pdf | Scrambled Linear Pseudorandom Number Generators}
 */
function xoshiro128ss(
  a: number = composeSeed(),
  b: number = composeSeed(),
  c: number = composeSeed(),
  d: number = composeSeed(),
) {
  return (): number => {
    let t = b << 9,
      r = b * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
}

/**
 * @see {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle | Fisher-Yates shuffle}
 */
function fisherYatesShuffle<T>(values: T[]): T[] {
  let currentIndex = values.length;
  while (currentIndex !== 0) {
    const randomIndex = composeRandomFlooredIntegerBetween(0, currentIndex);
    currentIndex--;
    [values[currentIndex], values[randomIndex]] = [
      values[randomIndex],
      values[currentIndex],
    ];
  }
  return values;
}

function composeFisherYatesIntegerRangeShuffle(
  start: number,
  end: number,
): number[] {
  return fisherYatesShuffle(integerRange(start, end));
}

export {
  composeFisherYatesIntegerRangeShuffle,
  composeRandomAngle,
  composeRandomBetween,
  composeRandomFlooredIntegerBetween,
  fisherYatesShuffle,
  xoshiro128ss,
};
