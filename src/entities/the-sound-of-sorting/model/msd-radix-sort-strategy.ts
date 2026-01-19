import { CYAN, GREEN, RED } from '@/shared/lib/rgba.ts';
import { RADIX, RadixSortStrategy } from './radix-sort-strategy.ts';
import type { SortingStrategyYield } from './sorting-strategy.ts';

class MsdRadixSortStrategy extends RadixSortStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    if (n === 0) {
      return;
    }
    const pending = { accessCount: 0 };
    const numberOfPasses = super.calculateNumberOfPasses(array);
    yield* this.sort(array, 0, n, 0, numberOfPasses, pending);
  }

  private *sort(
    array: number[],
    lo: number,
    hi: number,
    depth: number,
    numberOfPasses: number,
    pending: { accessCount: number },
  ): Generator<SortingStrategyYield, void, unknown> {
    if (depth > numberOfPasses || hi - lo <= 1) {
      return;
    }
    const base = RADIX ** (numberOfPasses - 1 - depth);
    const count = yield* this.count(array, lo, hi, base, pending);
    const { bkt, boundaryIndices } = this.calculateBoundaries(count, lo, hi);
    yield* this.redistribute(
      array,
      lo,
      hi,
      base,
      count,
      bkt,
      boundaryIndices,
      pending,
    );
    let nextLo = lo;
    for (let i = 0; i < RADIX; i += 1) {
      const bucketSize = count[i];
      if (bucketSize > 1) {
        yield* this.sort(
          array,
          nextLo,
          nextLo + bucketSize,
          depth + 1,
          numberOfPasses,
          pending,
        );
      }
      nextLo += bucketSize;
    }
  }

  private *count(
    array: number[],
    lo: number,
    hi: number,
    base: number,
    pending: { accessCount: number },
  ): Generator<SortingStrategyYield, number[], unknown> {
    const count = new Array(RADIX).fill(0);
    for (let i = lo; i < hi; i += 1) {
      const val = array[i];
      pending.accessCount += 1;
      const r = super.getDigit(val, base);
      count[r] += 1;
      yield {
        accessCount: pending.accessCount,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [i], skipTone: false },
          { color: GREEN, indices: [lo, hi - 1], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
      };
      pending.accessCount = 0;
    }
    return count;
  }

  private calculateBoundaries(
    count: number[],
    lo: number,
    hi: number,
  ): { bkt: number[]; boundaryIndices: number[] } {
    const bkt = new Array(RADIX).fill(0);
    let sum = 0;
    for (let i = 0; i < RADIX; i += 1) {
      sum += count[i];
      bkt[i] = sum;
    }
    const boundaryIndices: number[] = [];
    for (let i = 0; i < bkt.length; i += 1) {
      if (bkt[i] === 0) continue;
      const boundaryIndex = lo + bkt[i] - 1;
      if (boundaryIndex >= lo && boundaryIndex < hi) {
        boundaryIndices.push(boundaryIndex);
      }
    }
    return { bkt, boundaryIndices };
  }

  private *redistribute(
    array: number[],
    lo: number,
    hi: number,
    base: number,
    count: number[],
    bkt: number[],
    boundaryIndices: number[],
    pending: { accessCount: number },
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < hi - lo; ) {
      let val = array[lo + i];
      pending.accessCount += 1;
      let r = super.getDigit(val, base);
      bkt[r] -= 1;
      let j = bkt[r];
      while (j > i) {
        super.swap(array, lo + i, lo + j);
        yield {
          accessCount: 4 + pending.accessCount,
          comparisonCount: 0,
          highlights: [
            { color: RED, indices: [lo + i, lo + j], skipTone: false },
            { color: CYAN, indices: boundaryIndices, skipTone: true },
          ],
          shiftCount: 0,
          swapCount: 1,
        };
        pending.accessCount = 1;
        val = array[lo + i];
        r = super.getDigit(val, base);
        bkt[r] -= 1;
        j = bkt[r];
      }
      i += count[r];
    }
    yield {
      accessCount: 0,
      comparisonCount: 0,
      highlights: [{ color: CYAN, indices: [hi], skipTone: true }],
      shiftCount: 0,
      swapCount: 0,
    };
  }
}

export { MsdRadixSortStrategy };
