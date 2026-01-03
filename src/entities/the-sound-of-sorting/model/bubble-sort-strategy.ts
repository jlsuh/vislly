import { RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class BubbleSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    let highlights: HighlightGroup[];
    for (let i = 0; i < array.length; i += 1) {
      for (let j = 0; j < array.length - i - 1; j += 1) {
        highlights = [
          { color: RED, indices: [j, j + 1], skipHighlightGroupTone: false },
        ];
        yield {
          accessCount: 2,
          assignmentCount: 0,
          comparisonCount: 1,
          highlights,
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        if (array[j] > array[j + 1]) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 4,
            assignmentCount: 2,
            comparisonCount: 0,
            highlights,
            swapCount: 1,
            type: SortOperationType.Swap,
          };
        }
      }
    }
  }
}

export { BubbleSortStrategy };
