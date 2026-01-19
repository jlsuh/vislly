import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
} from './sorting-strategy.ts';

abstract class MergeSortStrategy extends SortingStrategy {
  protected *merge(
    array: number[],
    aux: number[],
    lo: number,
    mid: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const frontier = hi;
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      const left = array[i];
      const right = array[j];
      yield {
        accessCount: 2,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [i, j], skipTone: false },
          { color: GREEN, indices: [frontier], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
      };
      if (left <= right) {
        aux[k] = left;
        i += 1;
      } else {
        aux[k] = right;
        j += 1;
      }
      k += 1;
    }
    let pendingAccessCount = 0;
    while (i <= mid) {
      aux[k] = array[i];
      i += 1;
      k += 1;
      pendingAccessCount += 1;
    }
    while (j <= hi) {
      aux[k] = array[j];
      j += 1;
      k += 1;
      pendingAccessCount += 1;
    }
    for (let p = lo; p <= hi; p += 1) {
      array[p] = aux[p];
      yield {
        accessCount: 1 + pendingAccessCount,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [p], skipTone: true },
          { color: GREEN, indices: [frontier], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
      };
      pendingAccessCount = 0;
    }
  }
}

export { MergeSortStrategy };
