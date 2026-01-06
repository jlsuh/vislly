import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class HeapSortStrategy extends SortingStrategy {
  private *siftDown(
    array: number[],
    i: number,
    n: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    let childIndex = 2 * i + 1;
    while (childIndex < n) {
      if (childIndex + 1 < n) {
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            {
              color: RED,
              indices: [childIndex, childIndex + 1],
              skipHighlightGroupTone: false,
            },
            { color: GREEN, indices: [n], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        if (array[childIndex + 1] > array[childIndex]) {
          childIndex += 1;
        }
      }
      yield {
        accessCount: 2,
        comparisonCount: 1,
        highlights: [
          {
            color: RED,
            indices: [i, childIndex],
            skipHighlightGroupTone: false,
          },
          { color: GREEN, indices: [n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
        type: SortOperationType.Compare,
      };
      if (array[i] >= array[childIndex]) {
        return;
      }
      super.swap(array, i, childIndex);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          {
            color: RED,
            indices: [i, childIndex],
            skipHighlightGroupTone: false,
          },
          { color: GREEN, indices: [n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 1,
        type: SortOperationType.Swap,
      };
      i = childIndex;
      childIndex = 2 * i + 1;
    }
  }

  private *composeHeap(
    array: number[],
    n: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
      yield* this.siftDown(array, i, n);
    }
  }

  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    let n = array.length;
    yield* this.composeHeap(array, n);
    for (; n > 1; ) {
      n -= 1;
      super.swap(array, 0, n);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [0], skipHighlightGroupTone: false },
          { color: GREEN, indices: [n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        swapCount: 1,
        type: SortOperationType.Swap,
      };
      yield* this.siftDown(array, 0, n);
    }
  }
}

export { HeapSortStrategy };
