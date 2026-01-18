import { CountingSortStrategy } from './counting-sort-strategy.ts';
import { RADIX, RadixSortStrategy } from './radix-sort-strategy.ts';
import type { SortingStrategyYield } from './sorting-strategy.ts';

class LsdRadixSortStrategy extends RadixSortStrategy {
  private countingSorter = new CountingSortStrategy();

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    if (n === 0) {
      return;
    }
    const numberOfPasses = super.calculateNumberOfPasses(array);
    for (let pass = 0; pass < numberOfPasses; pass += 1) {
      const base = RADIX ** pass;
      yield* this.countingSorter.sort(array, base);
    }
  }
}

export { LsdRadixSortStrategy };
