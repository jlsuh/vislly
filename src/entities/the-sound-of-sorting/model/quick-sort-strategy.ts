import { RED } from '@/shared/lib/rgba.ts';
import {
  INITIAL_QUICK_SORT_PIVOT,
  QuickSortPivot,
} from './quick-sort-pivot.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
} from './sorting-strategy.ts';

/**
 * @description Represents the boundaries of a subarray partition to be processed.
 *              It defines a closed interval [lo, hi] within the main array.
 */
interface Partition {
  lo: number;
  hi: number;
}

abstract class QuickSortStrategy extends SortingStrategy {
  private pivot: QuickSortPivot = INITIAL_QUICK_SORT_PIVOT;

  public override get requiresPivot(): boolean {
    return true;
  }

  public override setPivot(newPivot: QuickSortPivot): void {
    this.pivot = newPivot;
  }

  protected abstract partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, Partition[], unknown>;

  protected *selectPivot(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    if (this.pivot === QuickSortPivot.First) {
      return lo;
    }
    if (this.pivot === QuickSortPivot.Last) {
      return hi;
    }
    if (this.pivot === QuickSortPivot.Middle) {
      return Math.floor((lo + hi) / 2);
    }
    if (this.pivot === QuickSortPivot.Random) {
      return lo + Math.floor(Math.random() * (hi - lo + 1));
    }
    if (this.pivot === QuickSortPivot.MedianOfThree) {
      return yield* this.computeMedianIndex(array, lo, hi);
    }
    return lo;
  }

  /**
   * @description Median selection does not sort the three elements (unlike Sedgewick's optimization),
   *              as it aims to remain consistent with other pivot selection rules.
   * @description Client partitioning is responsible for moving the chosen pivot to the appropriate position.
   */
  private *computeMedianIndex(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    const mid = Math.floor((lo + hi) / 2);
    yield* this.emitComparison(lo, mid);
    if (array[lo] === array[mid]) {
      return lo;
    }
    yield* this.emitComparison(lo, hi);
    if (array[lo] === array[hi]) {
      return hi;
    }
    yield* this.emitComparison(mid, hi);
    if (array[mid] === array[hi]) {
      return hi;
    }
    return yield* this.resolveMedianIndex(array, lo, mid, hi);
  }

  private *resolveMedianIndex(
    array: number[],
    lo: number,
    mid: number,
    hi: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    yield* this.emitComparison(lo, mid);
    const loLessThanMid = array[lo] < array[mid];
    yield* this.emitComparison(mid, hi);
    const midLessThanLast = array[mid] < array[hi];
    if (loLessThanMid === midLessThanLast) {
      return mid;
    }
    yield* this.emitComparison(lo, hi);
    const loLessThanLast = array[lo] < array[hi];
    return loLessThanMid === loLessThanLast ? hi : lo;
  }

  private *emitComparison(
    idxA: number,
    idxB: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield {
      accessCount: 2,
      comparisonCount: 1,
      highlights: [{ color: RED, indices: [idxA, idxB], skipTone: false }],
      shiftCount: 0,
      swapCount: 0,
    };
  }

  private *quickSort(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    if (lo < hi) {
      for (const partition of yield* this.partition(array, lo, hi)) {
        yield* this.quickSort(array, partition.lo, partition.hi);
      }
    }
  }

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const lo = 0;
    const hi = array.length - 1;
    yield* this.quickSort(array, lo, hi);
  }
}

export { QuickSortStrategy, type Partition };
