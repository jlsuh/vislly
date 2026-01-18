import { SortingStrategy } from './sorting-strategy.ts';

const RADIX = 4;

abstract class RadixSortStrategy extends SortingStrategy {
  protected getDigit(val: number, base: number): number {
    return Math.floor(val / base) % RADIX;
  }

  protected calculateNumberOfPasses(array: number[]): number {
    if (array.length === 0) return 0;
    const maxVal = Math.max(...array);
    if (maxVal === 0) return 1;
    return Math.floor(Math.log(maxVal) / Math.log(RADIX)) + 1;
  }
}

export { RADIX, RadixSortStrategy };
