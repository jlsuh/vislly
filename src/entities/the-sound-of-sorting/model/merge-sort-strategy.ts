import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
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
      yield {
        accessCount: 4,
        comparisonCount: 1,
        highlights: [
          { color: RED, indices: [i, j], skipHighlightGroupTone: false },
          { color: GREEN, indices: [frontier], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
        type: SortOperationType.Compare,
      };
      if (array[i] <= array[j]) {
        aux[k] = array[i];
        i += 1;
      } else {
        aux[k] = array[j];
        j += 1;
      }
      k += 1;
    }
    let pendingAccesses = 0;
    while (i <= mid) {
      aux[k] = array[i];
      i += 1;
      k += 1;
      pendingAccesses += 2;
    }
    while (j <= hi) {
      aux[k] = array[j];
      j += 1;
      k += 1;
      pendingAccesses += 2;
    }
    for (let p = lo; p <= hi; p += 1) {
      array[p] = aux[p];
      yield {
        accessCount: 2 + pendingAccesses,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [p], skipHighlightGroupTone: true },
          { color: GREEN, indices: [frontier], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
        type: SortOperationType.Inspect,
      };
      pendingAccesses = 0;
    }
  }
}

export { MergeSortStrategy };
