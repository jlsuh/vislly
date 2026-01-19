import { SortingStrategy } from './sorting-strategy.ts';

abstract class RadixSortStrategy extends SortingStrategy {
  protected static readonly RADIX = 4;

  protected getDigit(val: number, base: number): number {
    return Math.floor(val / base) % RadixSortStrategy.RADIX;
  }

  protected calculateNumberOfPasses(array: number[]): number {
    if (array.length === 0) return 0;
    const maxVal = Math.max(...array);
    if (maxVal === 0) return 1;
    return Math.floor(Math.log(maxVal) / Math.log(RadixSortStrategy.RADIX)) + 1;
  }
}

export { RadixSortStrategy };
