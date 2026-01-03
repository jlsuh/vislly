const SortOperationType = {
  Compare: 0,
  Inspect: 1,
  Shift: 2,
  Swap: 3,
} as const;

type SortOperationType =
  (typeof SortOperationType)[keyof typeof SortOperationType];

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
  type: SortOperationType;
}

abstract class SortingStrategy {
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
  SortOperationType,
  type HighlightGroup,
  type SortingStrategyYield,
};
