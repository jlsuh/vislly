import { RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

abstract class ShellSortTemplateMethodStrategy extends SortingStrategy {
  protected abstract getGaps(length: number): number[];

  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const gaps = this.getGaps(array.length);
    for (const h of gaps) {
      for (let i = h; i < array.length; i += 1) {
        const v = array[i];
        let pendingAccessCount = 1;
        let j = i;
        while (j >= h) {
          yield {
            accessCount: 1 + pendingAccessCount,
            assignmentCount: 0,
            comparisonCount: 1,
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
              assignmentCount: 1,
              comparisonCount: 0,
              highlights: [
                {
                  color: RED,
                  indices: [j, j - h],
                  skipHighlightGroupTone: false,
                },
              ],
              swapCount: 0,
              type: SortOperationType.Assignment,
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
            assignmentCount: 1,
            comparisonCount: 0,
            highlights: [
              { color: RED, indices: [j], skipHighlightGroupTone: false },
            ],
            swapCount: 0,
            type: SortOperationType.Assignment,
          };
        }
      }
    }
  }
}

export { ShellSortTemplateMethodStrategy };
