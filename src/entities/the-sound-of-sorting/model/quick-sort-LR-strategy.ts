import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class QuickSortLRStrategy extends QuickSortStrategy {
  protected *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    const pivot = array[pivotIdx];
    if (pivotIdx !== lo) {
      super.swap(array, pivotIdx, lo);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          {
            color: GREEN,
            indices: [pivotIdx, lo],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
    let i = lo - 1;
    let j = hi;
    for (;;) {
      do {
        i += 1;
        yield {
          accessCount: 1,
          comparisonCount: 1,
          highlights: [
            { color: RED, indices: [i], skipHighlightGroupTone: false },
            { color: GREEN, indices: [lo], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
      } while (array[i] < pivot);
      do {
        j -= 1;
        yield {
          accessCount: 1,
          comparisonCount: 1,
          highlights: [
            { color: RED, indices: [j], skipHighlightGroupTone: false },
            { color: GREEN, indices: [lo], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
      } while (array[j] > pivot);
      if (i >= j) {
        return [
          { lo, hi: j + 1 },
          { lo: j + 1, hi },
        ];
      }
      super.swap(array, i, j);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [i, j], skipHighlightGroupTone: true },
          { color: GREEN, indices: [lo], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
  }
}

export { QuickSortLRStrategy };
