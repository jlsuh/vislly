import { RED } from '@/shared/lib/rgba.ts';
import {
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
    for (let i = 0; i < array.length; i += 1) {
      for (let j = 0; j < array.length - i - 1; j += 1) {
        yield {
          accessCount: 2,
          compareCount: 1,
          highlights: [{ indices: [j, j + 1], color: RED }],
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        if (array[j] > array[j + 1]) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 2,
            compareCount: 0,
            highlights: [{ indices: [j, j + 1], color: RED }],
            swapCount: 1,
            type: SortOperationType.Swap,
          };
        }
      }
    }
  }
}

export { BubbleSortStrategy };
