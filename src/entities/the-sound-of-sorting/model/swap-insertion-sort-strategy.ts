import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class SwapInsertionSortStrategy extends SortingStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 1; i < array.length; i += 1) {
      const key = array[i];
      let totalAccessCount = 1;
      let j = i - 1;
      const originGroup: HighlightGroup = {
        color: GREEN,
        indices: [i],
        skipHighlightGroupTone: true,
      };
      while (j >= 0) {
        yield {
          accessCount: totalAccessCount + 1,
          comparisonCount: 1,
          highlights: [
            { indices: [j, j + 1], color: RED, skipHighlightGroupTone: false },
            originGroup,
          ],
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
            highlights: [
              { indices: [j, j + 1], color: RED, skipHighlightGroupTone: true },
              originGroup,
            ],
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
