import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class QuickSortTernaryLLStrategy extends QuickSortStrategy {
  protected override *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown> {
    const last = hi - 1;
    const pivotIdx = yield* this.selectPivot(array, lo, hi);
    super.swap(array, pivotIdx, last);
    yield {
      accessCount: 2,
      comparisonCount: 0,
      highlights: [
        { color: GREEN, indices: [last], skipHighlightGroupTone: true },
        { color: RED, indices: [pivotIdx, last], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      sortOperation: SortOperation.Swap,
      swapCount: 1,
    };
    const pivotValue = array[last];
    const { i, k } = yield* this.partitionLoop(
      array,
      lo,
      last,
      pivotValue,
      last,
    );
    yield* this.moveEqualsToCenter(array, hi, i, k);
    const equalsCount = hi - k;
    return [
      { lo, hi: i },
      { lo: i + equalsCount, hi },
    ];
  }

  private *partitionLoop(
    array: number[],
    lo: number,
    startOfEquals: number,
    pivotValue: number,
    pivotIndex: number,
  ): Generator<SortingStrategyYield, { i: number; k: number }, unknown> {
    let i = lo;
    let k = startOfEquals;
    let j = lo;
    while (j < k) {
      yield {
        accessCount: 1,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [j], skipHighlightGroupTone: false },
          { color: GREEN, indices: [pivotIndex], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      const cmp = array[j] - pivotValue;
      if (cmp === 0) {
        k -= 1;
        super.swap(array, j, k);
        yield {
          accessCount: 2,
          comparisonCount: 0,
          highlights: [
            { color: RED, indices: [j, k], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
      } else if (cmp < 0) {
        super.swap(array, i, j);
        yield {
          accessCount: 2,
          comparisonCount: 0,
          highlights: [
            { color: RED, indices: [i, j], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        i += 1;
        j += 1;
      } else {
        j += 1;
      }
    }
    return { i, k };
  }

  private *moveEqualsToCenter(
    array: number[],
    hi: number,
    i: number,
    k: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const count = hi - k;
    for (let s = 0; s < count; s++) {
      super.swap(array, i + s, hi - 1 - s);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          {
            color: RED,
            indices: [i + s, hi - 1 - s],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
  }
}

export { QuickSortTernaryLLStrategy };
