import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { QuickSortStrategy, type SortRange } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class QuickSortLLStrategy extends QuickSortStrategy {
  protected *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, SortRange[], unknown> {
    const last = hi - 1;
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    if (pivotIdx !== last) {
      super.swap(array, pivotIdx, last);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          {
            color: GREEN,
            indices: [last],
            skipHighlightGroupTone: true,
          },
          {
            color: RED,
            indices: [pivotIdx, last],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        swapCount: 1,
        type: SortOperationType.Swap,
      };
    }
    const pivot = array[last];
    let i = lo;
    for (let j = lo; j < last; j += 1) {
      yield {
        accessCount: 1,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [j], skipHighlightGroupTone: false },
          { color: GREEN, indices: [last], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
        type: SortOperationType.Compare,
      };
      if (array[j] <= pivot) {
        super.swap(array, i, j);
        yield {
          accessCount: 2,
          comparisonCount: 0,
          highlights: [
            { color: RED, indices: [i, j], skipHighlightGroupTone: true },
            { color: GREEN, indices: [last], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          swapCount: 1,
          type: SortOperationType.Swap,
        };
        i += 1;
      }
    }
    super.swap(array, i, last);
    yield {
      accessCount: 2,
      comparisonCount: 0,
      highlights: [
        { color: RED, indices: [i, last], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      swapCount: 1,
      type: SortOperationType.Swap,
    };
    return [
      { lo, hi: i },
      { lo: i + 1, hi },
    ];
  }
}

export { QuickSortLLStrategy };
