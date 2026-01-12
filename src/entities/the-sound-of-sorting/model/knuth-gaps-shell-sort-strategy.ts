import { ShellSortStrategy } from './shell-sort-strategy.ts';

/**
 * @see {@link https://oeis.org/A003462 | OEIS A003462}
 */
const KNUTH_GAPS = [
  21523360, 7174453, 2391484, 797161, 265720, 88573, 29524, 9841, 3280, 1093,
  364, 121, 40, 13, 4, 1,
];

class KnuthGapsShellSortStrategy extends ShellSortStrategy {
  protected override getGaps(length: number): number[] {
    return KNUTH_GAPS.filter((h) => 3 * h + 1 <= length);
  }
}

export { KnuthGapsShellSortStrategy };
