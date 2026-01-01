const SortOperationType = {
  Compare: 0,
  Swap: 1,
} as const;

type SortOperationType =
  (typeof SortOperationType)[keyof typeof SortOperationType];

interface HighlightGroup {
  color: string;
  indices: number[];
}

interface SortingStrategyYield {
  accessCount: number;
  compareCount: number;
  highlights: HighlightGroup[];
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
