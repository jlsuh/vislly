import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class CountingSortStrategy extends SortingStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    if (array.length === 0) return;
    let min = array[0];
    let max = array[0];
    let pendingAccesses = 2;
    let pendingComparisons = 0;
    for (let i = 0; i < array.length; i += 1) {
      yield {
        accessCount: pendingAccesses,
        comparisonCount: pendingComparisons,
        highlights: [
          { color: RED, indices: [i], skipHighlightGroupTone: false },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pendingAccesses = 0;
      pendingComparisons = 0;
      const value = array[i];
      pendingAccesses += 1;
      pendingComparisons += 1;
      if (value < min) min = value;
      pendingComparisons += 1;
      if (value > max) max = value;
    }
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    for (let i = 0; i < array.length; i += 1) {
      yield {
        accessCount: pendingAccesses,
        comparisonCount: pendingComparisons,
        highlights: [
          { color: GREEN, indices: [i], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pendingAccesses = 0;
      pendingComparisons = 0;
      count[array[i] - min] += 1;
      pendingAccesses += 4;
    }
    for (let i = 1; i < count.length; i += 1) {
      count[i] += count[i - 1];
      pendingAccesses += 3;
    }
    const inputCopy = [...array];
    for (let i = array.length - 1; i >= 0; i -= 1) {
      const value = inputCopy[i];
      const position = count[value - min] - 1;
      array[position] = value;
      count[value - min] -= 1;
      pendingAccesses += 5;
      yield {
        accessCount: pendingAccesses,
        comparisonCount: 0,
        highlights: [
          {
            color: GREEN,
            indices: [i, position],
            skipHighlightGroupTone: false,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };

      pendingAccesses = 0;
    }
  }
}

export { CountingSortStrategy };
