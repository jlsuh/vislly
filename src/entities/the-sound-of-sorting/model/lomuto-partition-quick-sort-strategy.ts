import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

/**
 * @description Lomuto partition scheme as presented in CLRS Chapter 7 (Introduction to Algorithms).
 */
class LomutoPartitionQuickSortStrategy extends QuickSortStrategy {
  protected override *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    if (pivotIdx !== hi) {
      yield {
        accessCount: 0,
        comparisonCount: 0,
        highlights: [{ color: GREEN, indices: [pivotIdx], skipTone: true }],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      super.swap(array, pivotIdx, hi);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [{ color: GREEN, indices: [hi], skipTone: true }],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
    const pivot = array[hi];
    let i = lo;
    let pendingAccessCount = 1;
    let pendingSwapCount = 0;
    for (let j = lo; j < hi; j += 1) {
      const val = array[j];
      pendingAccessCount += 1;
      const isLessOrEqual = val <= pivot;
      yield {
        accessCount: pendingAccessCount,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [i, j], skipTone: false },
          { color: GREEN, indices: [hi], skipTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      pendingAccessCount = 0;
      if (isLessOrEqual) {
        super.swap(array, i, j);
        if (i === j) {
          pendingAccessCount += 4;
          pendingSwapCount += 1;
        } else {
          yield {
            accessCount: 4 + pendingAccessCount,
            comparisonCount: 0,
            highlights: [
              { color: RED, indices: [i, j], skipTone: true },
              { color: GREEN, indices: [hi], skipTone: true },
            ],
            shiftCount: 0,
            sortOperation: SortOperation.Swap,
            swapCount: 1 + pendingSwapCount,
          };
          pendingAccessCount = 0;
          pendingSwapCount = 0;
        }
        i += 1;
      }
    }
    super.swap(array, i, hi);
    yield {
      accessCount: 4 + pendingAccessCount,
      comparisonCount: 0,
      highlights: [
        { color: RED, indices: [hi], skipTone: true },
        { color: GREEN, indices: [i], skipTone: true },
      ],
      shiftCount: 0,
      sortOperation: SortOperation.Swap,
      swapCount: 1 + pendingSwapCount,
    };
    return [
      { lo, hi: i - 1 },
      { lo: i + 1, hi },
    ];
  }
}

export { LomutoPartitionQuickSortStrategy };
