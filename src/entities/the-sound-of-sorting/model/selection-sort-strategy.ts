import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class SelectionSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < array.length - 1; i += 1) {
      let minIdx = i;
      for (let j = i + 1; j < array.length; j += 1) {
        const highlights: HighlightGroup[] = [
          { indices: [minIdx, j], color: RED },
        ];
        if (i > 0) {
          highlights.push({ indices: [i - 1], color: GREEN });
        }
        yield {
          accessCount: 2,
          compareCount: 1,
          highlights,
          swapCount: 0,
          type: SortOperationType.Compare,
        };
        if (array[j] < array[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        super.swap(array, i, minIdx);
        yield {
          accessCount: 0,
          compareCount: 0,
          highlights: [
            { indices: [i - 1], color: GREEN },
            { indices: [minIdx, i], color: RED },
          ],
          swapCount: 1,
          type: SortOperationType.Swap,
        };
      }
    }
  }
}

export { SelectionSortStrategy };
