import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class HoarePartitionQuickSortStrategy extends QuickSortStrategy {
  protected override *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    const pivot = array[pivotIdx];
    let currentPivotIdx = yield* this.initializePivot(array, pivotIdx, lo);
    let i = lo - 1;
    let j = hi + 1;
    const pending = { accessCount: 0, comparisonCount: 0 };
    for (;;) {
      do {
        i += 1;
        yield* this.accumulateOrYield(
          i,
          [i, ...(j <= hi ? [j] : [])],
          currentPivotIdx,
          pending,
        );
      } while (array[i] < pivot);
      do {
        j -= 1;
        yield* this.accumulateOrYield(j, [i, j], currentPivotIdx, pending);
      } while (array[j] > pivot);
      if (i >= j) {
        return [
          { lo, hi: j },
          { lo: j + 1, hi },
        ];
      }
      super.swap(array, i, j);
      if (i === currentPivotIdx) {
        currentPivotIdx = j;
      } else if (j === currentPivotIdx) {
        currentPivotIdx = i;
      }
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [i, j], skipHighlightGroupTone: true },
          {
            color: GREEN,
            indices: [currentPivotIdx],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
  }

  private *accumulateOrYield(
    activeIdx: number,
    highlightIndices: number[],
    currentPivotIdx: number,
    pending: { accessCount: number; comparisonCount: number },
  ): Generator<SortingStrategyYield, void, unknown> {
    if (activeIdx === currentPivotIdx) {
      pending.accessCount += 1;
      pending.comparisonCount += 1;
    } else {
      yield {
        accessCount: 1 + pending.accessCount,
        comparisonCount: 1 + pending.comparisonCount,
        highlights: [
          {
            color: RED,
            indices: highlightIndices,
            skipHighlightGroupTone: false,
          },
          {
            color: GREEN,
            indices: [currentPivotIdx],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      pending.accessCount = 0;
      pending.comparisonCount = 0;
    }
  }

  private *initializePivot(
    array: number[],
    pivotIdx: number,
    lo: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    yield {
      accessCount: 1,
      comparisonCount: 0,
      highlights: [
        { color: GREEN, indices: [pivotIdx], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      sortOperation: SortOperation.Inspect,
      swapCount: 0,
    };
    if (pivotIdx !== lo) {
      super.swap(array, pivotIdx, lo);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          { color: GREEN, indices: [lo], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
    return lo;
  }
}

export { HoarePartitionQuickSortStrategy };
