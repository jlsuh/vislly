import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { type Partition, QuickSortStrategy } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class QuickSortTernaryLRStrategy extends QuickSortStrategy {
  protected *partition(
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
    let i = lo;
    let j = last - 1;
    let p = lo;
    let q = last - 1;
    for (;;) {
      const leftResult = yield* this.scanLeft(array, pivotValue, i, j, p, last);
      i = leftResult.i;
      p = leftResult.p;
      const rightResult = yield* this.scanRight(
        array,
        pivotValue,
        i,
        j,
        q,
        last,
      );
      j = rightResult.j;
      q = rightResult.q;
      if (i > j) break;
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
      if (array[i] === pivotValue) {
        super.swap(array, p, i);
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            { color: RED, indices: [p, i], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        p++;
      }
      if (array[j] === pivotValue) {
        super.swap(array, j, q);
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            { color: RED, indices: [j, q], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        q--;
      }
      i++;
      j--;
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
    j = i - 1;
    const iStart = i + 1;
    yield* this.moveEqualsToCenter(array, lo, last, j, iStart, p, q);
    const numLess = i - p;
    const numGreater = q - j;
    return [
      { lo, hi: lo + numLess },
      { lo: hi - numGreater, hi },
    ];
  }

  private *scanLeft(
    array: number[],
    pivotValue: number,
    i: number,
    j: number,
    p: number,
    pivotIndex: number,
  ): Generator<SortingStrategyYield, { i: number; p: number }, unknown> {
    let currI = i;
    let currP = p;
    while (currI <= j) {
      yield {
        accessCount: 1,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [currI], skipHighlightGroupTone: false },
          { color: GREEN, indices: [pivotIndex], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      const val = array[currI];
      if (val > pivotValue) break;
      if (val === pivotValue) {
        super.swap(array, currI, currP);
        yield {
          accessCount: 2,
          comparisonCount: 0,
          highlights: [
            {
              color: RED,
              indices: [currI, currP],
              skipHighlightGroupTone: true,
            },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        currP++;
      }
      currI++;
    }
    return { i: currI, p: currP };
  }

  private *scanRight(
    array: number[],
    pivotValue: number,
    i: number,
    j: number,
    q: number,
    pivotIndex: number,
  ): Generator<SortingStrategyYield, { j: number; q: number }, unknown> {
    let currJ = j;
    let currQ = q;
    while (currJ >= i) {
      yield {
        accessCount: 1,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [currJ], skipHighlightGroupTone: false },
          { color: GREEN, indices: [pivotIndex], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      const val = array[currJ];
      if (val < pivotValue) break;
      if (val === pivotValue) {
        super.swap(array, currJ, currQ);
        yield {
          accessCount: 2,
          comparisonCount: 0,
          highlights: [
            {
              color: RED,
              indices: [currJ, currQ],
              skipHighlightGroupTone: true,
            },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        currQ--;
      }
      currJ--;
    }
    return { j: currJ, q: currQ };
  }

  private *moveEqualsToCenter(
    array: number[],
    lo: number,
    last: number,
    j: number,
    i: number,
    p: number,
    q: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const itemsToMoveLeft = Math.min(p - lo, j - p + 1);
    for (let k = 0; k < itemsToMoveLeft; k++) {
      super.swap(array, lo + k, j - k);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          {
            color: RED,
            indices: [lo + k, j - k],
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
    }
    const itemsRightTotal = last - 1 - q;
    const itemsToMoveRight = Math.min(itemsRightTotal, q - i + 1);
    for (let k = 0; k < itemsToMoveRight; k++) {
      super.swap(array, last - 1 - k, i + k);
      yield {
        accessCount: 2,
        comparisonCount: 0,
        highlights: [
          {
            color: RED,
            indices: [last - 1 - k, i + k],
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

export { QuickSortTernaryLRStrategy };
