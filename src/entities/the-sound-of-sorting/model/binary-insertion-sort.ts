import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class BinaryInsertionSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 1; i < array.length; i += 1) {
      const key = array[i];
      let pendingAccessCount = 1;
      let lo = 0;
      let hi = i;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        yield {
          accessCount: 1 + pendingAccessCount,
          compareCount: 1,
          highlights: [
            { color: GREEN, indices: [i], skipHighlightGroupTone: true },
            { color: RED, indices: [mid], skipHighlightGroupTone: false },
          ],
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        pendingAccessCount = 0;
        if (key <= array[mid]) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      let j = i - 1;
      while (j >= lo) {
        super.swap(array, j, j + 1);
        yield {
          accessCount: 4,
          compareCount: 0,
          highlights: [
            { color: GREEN, indices: [i], skipHighlightGroupTone: true },
            { color: RED, indices: [j, j + 1], skipHighlightGroupTone: false },
          ],
          swapCount: 1,
          type: SortOperationType.Swap,
        };
        j -= 1;
      }
    }
  }
}

export { BinaryInsertionSortStrategy };
