import { RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

export class GnomeSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    let pos = 1;
    while (pos < array.length) {
      if (pos === 0) {
        pos += 1;
        continue;
      }
      yield {
        accessCount: 2,
        comparisonCount: 1,
        highlights: [
          {
            indices: [pos, pos - 1],
            color: RED,
            skipHighlightGroupTone: false,
          },
        ],
        shiftCount: 0,
        swapCount: 0,
        type: SortOperationType.Compare,
      };
      if (array[pos] >= array[pos - 1]) {
        pos += 1;
        continue;
      }
      super.swap(array, pos, pos - 1);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          {
            indices: [pos, pos - 1],
            color: RED,
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        swapCount: 1,
        type: SortOperationType.Swap,
      };
      pos -= 1;
    }
  }
}
