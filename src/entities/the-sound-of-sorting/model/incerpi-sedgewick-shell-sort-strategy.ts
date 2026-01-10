import { ShellSortStrategy } from './shell-sort-strategy.ts';

/**
 * @see {@link https://oeis.org/A036569 | OEIS A036569}
 * @see {@link https://sedgewick.io/wp-content/themes/sedgewick/papers/1996Shellsort.pdf | Analysis of Shellsort and Related Algorithms}
 */
const INCERPI_SEDGEWICK_GAPS = [
  1391376, 463792, 198768, 86961, 33936, 13776, 4592, 1968, 861, 336, 112, 48,
  21, 7, 3, 1,
];

class IncerpiSedgewickShellSortStrategy extends ShellSortStrategy {
  protected override getGaps(length: number): number[] {
    return INCERPI_SEDGEWICK_GAPS.filter((h) => h < length);
  }
}

export { IncerpiSedgewickShellSortStrategy };
