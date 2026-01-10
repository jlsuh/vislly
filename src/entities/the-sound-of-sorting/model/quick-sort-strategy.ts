import { RED } from '@/shared/lib/rgba.ts';
import {
  INITIAL_QUICK_SORT_PIVOT,
  QuickSortPivot,
} from './quick-sort-pivot.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

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
      return hi - 1;
    }
    if (this.pivot === QuickSortPivot.Middle) {
      return Math.floor((lo + hi) / 2);
    }
    if (this.pivot === QuickSortPivot.Random) {
      return lo + Math.floor(Math.random() * (hi - lo));
    }
    if (this.pivot === QuickSortPivot.MedianOfThree) {
      return yield* this.selectMedianOfThree(array, lo, hi);
    }
    return lo;
  }

  private *selectMedianOfThree(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    const mid = Math.floor((lo + hi) / 2);
    const last = hi - 1;
    yield* this.emitComparison(lo, mid);
    if (array[lo] === array[mid]) {
      return lo;
    }
    yield* this.emitComparison(lo, last);
    if (array[lo] === array[last]) {
      return last;
    }
    yield* this.emitComparison(mid, last);
    if (array[mid] === array[last]) {
      return last;
    }
    return yield* this.resolveMedian(array, lo, mid, last);
  }

  private *resolveMedian(
    array: number[],
    lo: number,
    mid: number,
    last: number,
  ): Generator<SortingStrategyYield, number, unknown> {
    yield* this.emitComparison(lo, mid);
    const loLessThanMid = array[lo] < array[mid];
    yield* this.emitComparison(mid, last);
    const midLessThanLast = array[mid] < array[last];
    if (loLessThanMid === midLessThanLast) {
      return mid;
    }
    yield* this.emitComparison(lo, last);
    const loLessThanLast = array[lo] < array[last];
    return loLessThanMid === loLessThanLast ? last : lo;
  }

  private *emitComparison(
    idxA: number,
    idxB: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield {
      accessCount: 2,
      comparisonCount: 1,
      highlights: [
        { color: RED, indices: [idxA, idxB], skipHighlightGroupTone: false },
      ],
      shiftCount: 0,
      sortOperation: SortOperation.Compare,
      swapCount: 0,
    };
  }

  private *quickSort(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    if (lo >= hi - 1 || lo < 0) {
      return;
    }
    for (const partition of yield* this.partition(array, lo, hi)) {
      yield* this.quickSort(array, partition.lo, partition.hi);
    }
  }

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const lo = 0;
    const hi = array.length;
    yield* this.quickSort(array, lo, hi);
  }
}

export { QuickSortStrategy, type Partition };
