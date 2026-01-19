import { RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
} from './sorting-strategy.ts';

abstract class ShellSortStrategy extends SortingStrategy {
  protected abstract getGaps(length: number): number[];

  protected getAdditionalHighlights(_: number): HighlightGroup[] {
    return [];
  }

  public override *generator({
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
        const additionalHighlights = this.getAdditionalHighlights(i);
        while (j >= h) {
          yield {
            accessCount: 1 + pendingAccessCount,
            comparisonCount: 1,
            highlights: [
              { color: RED, indices: [j, j - h], skipTone: false },
              ...additionalHighlights,
            ],
            shiftCount: 0,
            swapCount: 0,
          };
          pendingAccessCount = 0;
          if (array[j - h] > v) {
            array[j] = array[j - h];
            yield {
              accessCount: 2,
              comparisonCount: 0,
              highlights: [
                { color: RED, indices: [j, j - h], skipTone: true },
                ...additionalHighlights,
              ],
              shiftCount: 1,
              swapCount: 0,
            };
            j -= h;
          } else {
            break;
          }
        }
        if (j !== i) {
          array[j] = v;
          yield {
            accessCount: 1,
            comparisonCount: 0,
            highlights: [
              { color: RED, indices: [j], skipTone: true },
              ...additionalHighlights,
            ],
            shiftCount: 1,
            swapCount: 0,
          };
        }
      }
    }
  }
}

export { ShellSortStrategy };
