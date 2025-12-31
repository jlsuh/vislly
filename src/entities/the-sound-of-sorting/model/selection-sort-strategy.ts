import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
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
          { indices: [minIdx, j], color: '#ff0000' },
        ];
        if (i > 0) {
          highlights.push({ indices: [i - 1], color: '#00ff00' });
        }
        yield {
          accessCount: 2,
          compareCount: 1,
          highlights,
          swapCount: 0,
          type: 'compare',
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
            { indices: [i - 1], color: '#00ff00' },
            { indices: [minIdx, i], color: '#ff0000' },
          ],
          swapCount: 1,
          type: 'swap',
        };
      }
    }
  }
}

export { SelectionSortStrategy };
