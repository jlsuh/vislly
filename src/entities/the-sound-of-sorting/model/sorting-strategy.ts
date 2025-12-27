type SortOperationType = 'compare' | 'swap';

interface HighlightGroup {
  color: string;
  indices: number[];
}

interface SortingStrategyYield {
  accessCount: number;
  compareCount: number;
  highlights: HighlightGroup[];
  type: SortOperationType;
}

abstract class SortingStrategy {
  public abstract generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown>;
}

export { SortingStrategy, type HighlightGroup, type SortingStrategyYield };
