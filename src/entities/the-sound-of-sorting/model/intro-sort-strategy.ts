import { HeapSortStrategy } from './heap-sort-strategy.ts';
import { LomutoPartitionQuickSortStrategy } from './quick-sort-lomuto-strategy.ts';
import type { SortingStrategyYield } from './sorting-strategy.ts';
import { SwapInsertionSortStrategy } from './swap-insertion-sort-strategy.ts';

const INSERTION_SORT_THRESHOLD = 16;

class IntroSortStrategy extends LomutoPartitionQuickSortStrategy {
  private heapSortStrategy = new HeapSortStrategy();
  private insertionSortStrategy = new SwapInsertionSortStrategy();

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    const maxdepth = Math.floor(Math.log2(n)) * 2;
    yield* this.introsort(array, 0, n - 1, maxdepth);
  }

  private *introsort(
    array: number[],
    lo: number,
    hi: number,
    maxdepth: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const n = hi - lo + 1;
    if (n < INSERTION_SORT_THRESHOLD) {
      if (n > 1) {
        yield* this.insertionSortStrategy.sort(array, lo, hi);
      }
      return;
    }
    if (maxdepth === 0) {
      yield* this.heapSortStrategy.sort(array, lo, hi);
      return;
    }
    const partitions = yield* this.partition(array, lo, hi);
    for (const p of partitions) {
      yield* this.introsort(array, p.lo, p.hi, maxdepth - 1);
    }
  }
}

export { IntroSortStrategy };
