import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { QuickSortStrategy, type SortRange } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class QuickSortLRStrategy extends QuickSortStrategy {
  protected *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, SortRange[], unknown> {
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
        swapCount: 1,
        type: SortOperationType.Swap,
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
          swapCount: 0,
          type: SortOperationType.Compare,
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
          swapCount: 0,
          type: SortOperationType.Compare,
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
        swapCount: 1,
        type: SortOperationType.Swap,
      };
    }
  }
}

export { QuickSortLRStrategy };
