import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { QuickSortStrategy, type SortRange } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class QuickSortTernaryLLStrategy extends QuickSortStrategy {
  protected *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, SortRange[], unknown> {
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
      swapCount: 1,
      type: SortOperationType.Swap,
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
        swapCount: 0,
        type: SortOperationType.Compare,
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
          swapCount: 1,
          type: SortOperationType.Swap,
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
          swapCount: 1,
          type: SortOperationType.Swap,
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
        swapCount: 1,
        type: SortOperationType.Swap,
      };
    }
  }
}

export { QuickSortTernaryLLStrategy };
