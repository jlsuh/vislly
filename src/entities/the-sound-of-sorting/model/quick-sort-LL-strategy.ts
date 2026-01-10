import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class QuickSortLLStrategy extends QuickSortStrategy {
  protected override *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const last = hi - 1;
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    if (pivotIdx !== last) {
      super.swap(array, pivotIdx, last);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          { color: GREEN, indices: [last], skipHighlightGroupTone: true },
          {
            color: RED,
            indices: [pivotIdx, last],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
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
        sortOperation: SortOperation.Compare,
        swapCount: 0,
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
          sortOperation: SortOperation.Swap,
          swapCount: 1,
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
      sortOperation: SortOperation.Swap,
      swapCount: 1,
    };
    return [
      { lo, hi: i },
      { lo: i + 1, hi },
    ];
  }
}

export { QuickSortLLStrategy };
