import { RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class BubbleSortStrategy extends SortingStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < array.length; i += 1) {
      for (let j = 0; j < array.length - i - 1; j += 1) {
        const shouldSwap = array[j] > array[j + 1];
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [{ color: RED, indices: [j, j + 1], skipTone: false }],
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
        if (shouldSwap) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 4,
            comparisonCount: 0,
            highlights: [{ color: RED, indices: [j, j + 1], skipTone: true }],
            shiftCount: 0,
            sortOperation: SortOperation.Swap,
            swapCount: 1,
          };
        }
      }
    }
  }
}

export { BubbleSortStrategy };
