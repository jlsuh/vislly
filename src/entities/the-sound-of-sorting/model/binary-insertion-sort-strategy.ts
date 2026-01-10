import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class BinaryInsertionSortStrategy extends SortingStrategy {
  public override *generator({
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
          sortOperation: SortOperation.Compare,
          swapCount: 0,
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
          sortOperation: SortOperation.Inspect,
          swapCount: 0,
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
          sortOperation: SortOperation.Swap,
          swapCount: 1,
        };
        j -= 1;
      }
    }
  }
}

export { BinaryInsertionSortStrategy };
