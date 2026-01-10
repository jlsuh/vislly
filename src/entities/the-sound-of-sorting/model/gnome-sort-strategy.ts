import { RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

export class GnomeSortStrategy extends SortingStrategy {
  public override *generator({
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
        sortOperation: SortOperation.Compare,
        swapCount: 0,
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
          { indices: [pos, pos - 1], color: RED, skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
      pos -= 1;
    }
  }
}
