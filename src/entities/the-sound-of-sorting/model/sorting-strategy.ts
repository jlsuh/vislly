import type { QuickSortPivot } from './quick-sort-pivot.ts';

const SortOperation = {
  Compare: 0,
  Inspect: 1,
  Shift: 2,
  Swap: 3,
} as const;

type SortOperation = (typeof SortOperation)[keyof typeof SortOperation];

interface HighlightGroup {
  color: string;
  indices: number[];
  skipHighlightGroupTone: boolean;
}

interface SortingStrategyYield {
  accessCount: number;
  comparisonCount: number;
  highlights: HighlightGroup[];
  shiftCount: number;
  swapCount: number;
  sortOperation: SortOperation;
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

export {
  SortingStrategy,
  SortOperation,
  type HighlightGroup,
  type SortingStrategyYield,
};
