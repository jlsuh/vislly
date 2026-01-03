import { RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

const SEDGEWICK_GAPS = [
  1391376, 463792, 198768, 86961, 33936, 13776, 4592, 1968, 861, 336, 112, 48,
  21, 7, 3, 1,
];

/**
 * @see {@link https://sedgewick.io/wp-content/themes/sedgewick/papers/1996Shellsort.pdf | Analysis of Shellsort and Related Algorithms}
 */
class SedgewickShellSortStrategy extends SortingStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    for (const h of SEDGEWICK_GAPS) {
      for (let i = h; i < array.length; i += 1) {
        const v = array[i];
        let pendingAccessCount = 1;
        let j = i;
        while (j >= h) {
          yield {
            accessCount: 1 + pendingAccessCount,
            compareCount: 1,
            highlights: [
              {
                color: RED,
                indices: [j, j - h],
                skipHighlightGroupTone: false,
              },
            ],
            swapCount: 0,
            type: SortOperationType.Compare,
          };
          pendingAccessCount = 0;
          if (array[j - h] > v) {
            array[j] = array[j - h];
            yield {
              accessCount: 2,
              compareCount: 0,
              highlights: [
                {
                  color: RED,
                  indices: [j, j - h],
                  skipHighlightGroupTone: false,
                },
              ],
              swapCount: 0,
              type: SortOperationType.Set,
            };
            j -= h;
          } else {
            break;
          }
        }
        array[j] = v;
        if (j !== i) {
          yield {
            accessCount: 1,
            compareCount: 0,
            highlights: [
              { color: RED, indices: [j], skipHighlightGroupTone: false },
            ],
            swapCount: 0,
            type: SortOperationType.Set,
          };
        }
      }
    }
  }
}

export { SedgewickShellSortStrategy };
