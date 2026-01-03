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
          comparisonCount: 1,
          highlights: [
            { color: GREEN, indices: [i], skipHighlightGroupTone: true },
            { color: RED, indices: [mid], skipHighlightGroupTone: false },
          ],
          shiftCount: 0,
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
      if (j >= lo) {
        yield {
          accessCount: 0,
          comparisonCount: 0,
          highlights: [
            { color: GREEN, indices: [i], skipHighlightGroupTone: true },
            { color: RED, indices: [j, j + 1], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          swapCount: 0,
          type: SortOperationType.Inspect,
        };
      }
      while (j >= lo) {
        super.swap(array, j, j + 1);
        yield {
          accessCount: 4,
          comparisonCount: 0,
          highlights: [
            { color: GREEN, indices: [i], skipHighlightGroupTone: true },
            { color: RED, indices: [j, j + 1], skipHighlightGroupTone: false },
          ],
          shiftCount: 0,
          swapCount: 1,
          type: SortOperationType.Swap,
        };
        j -= 1;
      }
    }
  }
}

export { BinaryInsertionSortStrategy };
