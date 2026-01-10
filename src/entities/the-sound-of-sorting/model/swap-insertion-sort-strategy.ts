import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class SwapInsertionSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    let highlights: HighlightGroup[];
    for (let i = 1; i < array.length; i += 1) {
      const key = array[i];
      let totalAccessCount = 1;
      let j = i - 1;
      while (j >= 0) {
        highlights = [
          { indices: [j, j + 1], color: RED, skipHighlightGroupTone: false },
          { indices: [i], color: GREEN, skipHighlightGroupTone: true },
        ];
        yield {
          accessCount: totalAccessCount + 1,
          comparisonCount: 1,
          highlights,
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
        totalAccessCount = 0;
        if (array[j] > key) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 4,
            comparisonCount: 0,
            highlights,
            shiftCount: 0,
            sortOperation: SortOperation.Swap,
            swapCount: 1,
          };
          j -= 1;
        } else {
          break;
        }
      }
    }
  }
}

export { SwapInsertionSortStrategy };
