import {
  SortingStrategy,
  type SortingStrategyYield,
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
          highlights: [{ indices: [j, j + 1], color: '#ff0000' }],
          swapCount: 0,
          type: 'compare',
        };
        if (array[j] > array[j + 1]) {
          super.swap(array, j, j + 1);
          yield {
            accessCount: 2,
            compareCount: 0,
            highlights: [{ indices: [j, j + 1], color: '#ff0000' }],
            swapCount: 1,
            type: 'swap',
          };
        }
      }
    }
  }
}

export { BubbleSortStrategy };
