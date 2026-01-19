import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

/**
 * @see {@link https://en.wikipedia.org/wiki/Pigeonhole_sort | Pigeonhole Sort}
 */
class PigeonholeSortStrategy extends SortingStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    if (n === 0) {
      return;
    }
    const min = Math.min(...array);
    const max = Math.max(...array);
    const range = max - min + 1;
    const holes = new Array(range).fill(0);
    for (let i = 0; i < n; i += 1) {
      holes[array[i] - min] += 1;
      yield {
        accessCount: 1,
        comparisonCount: 0,
        highlights: [{ color: RED, indices: [i], skipTone: false }],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
    }
    let idx = 0;
    for (let i = 0; i < range; i += 1) {
      while (holes[i] > 0) {
        holes[i] -= 1;
        array[idx] = i + min;
        yield {
          accessCount: 1,
          comparisonCount: 0,
          highlights: [{ color: GREEN, indices: [idx], skipTone: false }],
          shiftCount: 0,
          sortOperation: SortOperation.Inspect,
          swapCount: 0,
        };
        idx += 1;
      }
    }
  }
}

export { PigeonholeSortStrategy };
