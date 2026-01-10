import { MergeSortStrategy } from './merge-sort-strategy.ts';
import type { SortingStrategyYield } from './sorting-strategy.ts';

/**
 * @see {@link https://algs4.cs.princeton.edu/22mergesort/Merge.java.html | Top-Down Merge Sort}
 */
class TopDownMergeSortStrategy extends MergeSortStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    const aux = Object.seal(new Array(n).fill(0));
    yield* this.sort(array, aux, 0, n - 1);
  }

  private *sort(
    array: number[],
    aux: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    if (hi <= lo) {
      return;
    }
    const mid = lo + Math.floor((hi - lo) / 2);
    yield* this.sort(array, aux, lo, mid);
    yield* this.sort(array, aux, mid + 1, hi);
    yield* super.merge(array, aux, lo, mid, hi);
  }
}

export { TopDownMergeSortStrategy };
