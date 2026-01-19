import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
} from './sorting-strategy.ts';

class SelectionSortStrategy extends SortingStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < array.length - 1; i += 1) {
      let minIdx = i;
      const delimiterGroup: HighlightGroup = {
        color: GREEN,
        indices: i > 0 ? [i - 1] : [],
        skipTone: true,
      };
      for (let j = i + 1; j < array.length; j += 1) {
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            { color: RED, indices: [minIdx, j], skipTone: false },
            delimiterGroup,
          ],
          shiftCount: 0,
          swapCount: 0,
        };
        if (array[j] < array[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        super.swap(array, i, minIdx);
        yield {
          accessCount: 4,
          comparisonCount: 0,
          highlights: [
            { color: RED, indices: [minIdx, i], skipTone: true },
            delimiterGroup,
          ],
          shiftCount: 0,
          swapCount: 1,
        };
      }
    }
  }
}

export { SelectionSortStrategy };
