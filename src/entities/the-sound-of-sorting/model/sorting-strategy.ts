type SortOperationType = 'compare' | 'swap';

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
  type HighlightGroup,
  type SortingStrategyYield,
  type SortOperationType,
};
