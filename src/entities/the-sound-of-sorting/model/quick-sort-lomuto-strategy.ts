import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

// LL
class QuickSortLomutoStrategy extends QuickSortStrategy {
  protected override *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    if (pivotIdx !== hi - 1) {
      yield {
        accessCount: 0,
        comparisonCount: 0,
        highlights: [
          { color: GREEN, indices: [pivotIdx], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      super.swap(array, pivotIdx, hi - 1);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          { color: GREEN, indices: [hi - 1], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
    const pivot = array[hi - 1];
    let i = lo;
    let pendingAccesses = 0;
    let pedingSwaps = 0;
    for (let j = lo; j < hi - 1; j += 1) {
      yield {
        accessCount: 1 + pendingAccesses,
        comparisonCount: 1 + pedingSwaps,
        highlights: [
          { color: RED, indices: [i, j], skipHighlightGroupTone: false },
          { color: GREEN, indices: [hi - 1], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      pendingAccesses = 0;
      pedingSwaps = 0;
      if (array[j] <= pivot) {
        super.swap(array, i, j);
        if (i === j) {
          pendingAccesses += 4;
          pedingSwaps += 1;
        } else {
          yield {
            accessCount: 4 + pendingAccesses,
            comparisonCount: 0 + pedingSwaps,
            highlights: [
              { color: RED, indices: [i, j], skipHighlightGroupTone: true },
              { color: GREEN, indices: [hi - 1], skipHighlightGroupTone: true },
            ],
            shiftCount: 0,
            sortOperation: SortOperation.Swap,
            swapCount: 1,
          };
          pendingAccesses = 0;
          pedingSwaps = 0;
        }
        i += 1;
      }
    }
    super.swap(array, i, hi - 1);
    yield {
      accessCount: 4 + pendingAccesses,
      comparisonCount: 0 + pedingSwaps,
      highlights: [
        { color: RED, indices: [hi - 1], skipHighlightGroupTone: true },
        { color: GREEN, indices: [i], skipHighlightGroupTone: false },
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

export { QuickSortLomutoStrategy };
