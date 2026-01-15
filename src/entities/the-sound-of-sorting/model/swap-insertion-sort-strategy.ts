import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class SwapInsertionSortStrategy extends SortingStrategy {
  public *sort(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = lo + 1; i <= hi; i += 1) {
      const key = array[i];
      let pendingAccessCount = 1;
      let j = i - 1;
      const originGroup: HighlightGroup = {
        color: GREEN,
        indices: [i],
        skipHighlightGroupTone: true,
      };
      while (j >= lo) {
        yield {
          accessCount: 1 + pendingAccessCount,
          comparisonCount: 1,
          highlights: [
            { indices: [j, j + 1], color: RED, skipHighlightGroupTone: false },
            originGroup,
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
        pendingAccessCount = 0;
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

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    yield* this.sort(array, 0, array.length - 1);
  }
}

export { SwapInsertionSortStrategy };
