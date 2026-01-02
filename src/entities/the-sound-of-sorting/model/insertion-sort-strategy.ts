import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class InsertionSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 1; i < array.length; i += 1) {
      const key = array[i];
      let totalAccessCount = 1;
      let j = i - 1;
      while (j >= 0) {
        yield {
          accessCount: totalAccessCount + 1,
          compareCount: 1,
          highlights: [
            { indices: [j, j + 1], color: RED, skipHighlightGroupTone: false },
            { indices: [i], color: GREEN, skipHighlightGroupTone: true },
          ],
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        totalAccessCount = 0;
        if (array[j] > key) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 4,
            compareCount: 0,
            highlights: [
              {
                indices: [j, j + 1],
                color: RED,
                skipHighlightGroupTone: false,
              },
              { indices: [i], color: GREEN, skipHighlightGroupTone: true },
            ],
            swapCount: 1,
            type: SortOperationType.Swap,
          };
          j -= 1;
        } else {
          break;
        }
      }
    }
  }
}

export { InsertionSortStrategy };
