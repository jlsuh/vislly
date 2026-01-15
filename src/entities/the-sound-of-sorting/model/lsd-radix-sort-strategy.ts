import { CYAN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

const RADIX = 4;

class LsdRadixSortStrategy extends SortingStrategy {
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
    const numberOfPasses = Math.ceil(
      Math.log(Math.max(...array) + 1) / Math.log(RADIX),
    );
    for (let pass = 0; pass < numberOfPasses; pass += 1) {
      const base = RADIX ** pass;
      const count = new Array(RADIX).fill(0);
      const copy: number[] = new Array(n);
      yield* this.countAndCopy(array, copy, count, base, RADIX, pending);
      const { bkt, boundaryIndices } = this.calculateBucketsAndBoundaries(
        count,
        n,
        RADIX,
      );
      yield* this.redistribute(
        array,
        copy,
        bkt,
        boundaryIndices,
        base,
        RADIX,
        pending,
      );
    }
  }

  private *countAndCopy(
    array: number[],
    copy: number[],
    count: number[],
    base: number,
    radix: number,
    pending: { accessCount: number },
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < array.length; i += 1) {
      const val = array[i];
      pending.accessCount += 1;
      copy[i] = val;
      const r = Math.floor(val / base) % radix;
      count[r] += 1;
      yield {
        accessCount: pending.accessCount,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [i], skipHighlightGroupTone: false },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pending.accessCount = 0;
    }
  }

  private calculateBucketsAndBoundaries(
    count: number[],
    n: number,
    radix: number,
  ): { bkt: number[]; boundaryIndices: number[] } {
    const bkt = new Array(radix + 1).fill(0);
    for (let i = 0; i < radix; i += 1) {
      bkt[i + 1] = bkt[i] + count[i];
    }
    const boundaryIndices: number[] = [];
    for (let i = 0; i < bkt.length - 1; i += 1) {
      if (bkt[i] >= n) {
        continue;
      }
      boundaryIndices.push(bkt[i]);
    }
    return { bkt, boundaryIndices };
  }

  private *redistribute(
    array: number[],
    copy: number[],
    bkt: number[],
    boundaryIndices: number[],
    base: number,
    radix: number,
    pending: { accessCount: number },
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = 0; i < array.length; i += 1) {
      const val = copy[i];
      const r = Math.floor(val / base) % radix;
      const targetIdx = bkt[r];
      array[targetIdx] = val;
      pending.accessCount += 1;
      bkt[r] += 1;
      yield {
        accessCount: pending.accessCount,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [targetIdx], skipHighlightGroupTone: false },
          {
            color: CYAN,
            indices: boundaryIndices,
            skipHighlightGroupTone: true,
          },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pending.accessCount = 0;
    }
  }
}

export { LsdRadixSortStrategy };
