import type { QuickSortPivot } from './quick-sort-pivot.ts';

interface HighlightGroup {
  color: string;
  indices: number[];
  skipTone: boolean;
}

interface SortingStrategyYield {
  accessCount: number;
  comparisonCount: number;
  highlights: HighlightGroup[];
  shiftCount: number;
  swapCount: number;
}

abstract class SortingStrategy {
  public get requiresPivot(): boolean {
    return false;
  }

  public setPivot(_: QuickSortPivot): void {}

  public swap(array: number[], i: number, j: number): void {
    [array[i], array[j]] = [array[j], array[i]];
  }

  public abstract generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown>;
}

export { SortingStrategy, type HighlightGroup, type SortingStrategyYield };
