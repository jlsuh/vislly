class SortingStats {
  accesses: number;
  comparisons: number;
  swaps: number;

  public constructor(
    initialAccesses: number,
    initialComparisons: number,
    initialSwaps: number,
  ) {
    if (initialAccesses < 0) {
      throw new RangeError('Illegal negative initial accesses');
    }
    if (initialComparisons < 0) {
      throw new RangeError('Illegal negative initial comparisons');
    }
    if (initialSwaps < 0) {
      throw new RangeError('Illegal negative initial swaps');
    }
    this.accesses = initialAccesses;
    this.comparisons = initialComparisons;
    this.swaps = initialSwaps;
  }

  public addAccesses(count: number): SortingStats {
    this.accesses += count;
    return this;
  }

  public addComparisons(count: number): SortingStats {
    this.comparisons += count;
    return this;
  }

  public addSwaps(count: number): SortingStats {
    this.swaps += count;
    return this;
  }

  public deepCopy(): SortingStats {
    return new SortingStats(this.accesses, this.comparisons, this.swaps);
  }
}

export { SortingStats };
