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
    const compareGroup: HighlightGroup = {
      color: RED,
      indices: [],
      skipHighlightGroupTone: false,
    };
    const delimiterGroup: HighlightGroup = {
      color: GREEN,
      indices: [],
      skipHighlightGroupTone: true,
    };
    const highlights: HighlightGroup[] = [compareGroup, delimiterGroup];
    for (let i = 0; i < array.length - 1; i += 1) {
      let minIdx = i;
      if (i > 0) {
        delimiterGroup.indices = [i - 1];
      }
      for (let j = i + 1; j < array.length; j += 1) {
        compareGroup.indices = [minIdx, j];
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
        compareGroup.indices = [minIdx, i];
        yield {
          accessCount: 4,
          compareCount: 0,
          highlights,
          swapCount: 1,
          type: SortOperationType.Swap,
        };
      }
    }
  }
}

export { SelectionSortStrategy };
