class SortingStats {
  accesses: number;
  comparisons: number;
  shifts: number;
  swaps: number;

  public constructor(
    initialAccesses: number,
    initialComparisons: number,
    initialShifts: number,
    initialSwaps: number,
  ) {
    if (initialAccesses < 0) {
      throw new RangeError('Illegal negative initial accesses');
    }
    if (initialComparisons < 0) {
      throw new RangeError('Illegal negative initial comparisons');
    }
    if (initialShifts < 0) {
      throw new RangeError('Illegal negative initial shifts');
    }
    if (initialSwaps < 0) {
      throw new RangeError('Illegal negative initial swaps');
    }
    this.accesses = initialAccesses;
    this.shifts = initialShifts;
    this.comparisons = initialComparisons;
    this.swaps = initialSwaps;
  }

  public addAccesses(count: number): SortingStats {
    this.accesses += count;
    return this;
  }

  public addShifts(count: number): SortingStats {
    this.shifts += count;
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
    return new SortingStats(
      this.accesses,
      this.comparisons,
      this.shifts,
      this.swaps,
    );
  }
}

export { SortingStats };
