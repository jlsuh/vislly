import { MergeSortStrategy } from './merge-sort-strategy.ts';
import type { SortingStrategyYield } from './sorting-strategy.ts';

/**
 * @see {@link https://algs4.cs.princeton.edu/22mergesort/MergeBU.java.html | Bottom-Up Merge Sort}
 */
class BottomUpMergeSortStrategy extends MergeSortStrategy {
  public *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    const aux = new Array(n).fill(0);
    for (let len = 1; len < n; len *= 2) {
      for (let lo = 0; lo < n - len; lo += len + len) {
        const mid = lo + len - 1;
        const hi = Math.min(lo + len + len - 1, n - 1);
        yield* this.merge(array, aux, lo, mid, hi);
      }
    }
  }
}

export { BottomUpMergeSortStrategy };
