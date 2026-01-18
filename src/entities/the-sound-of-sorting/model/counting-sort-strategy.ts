import { CYAN, RED } from '@/shared/lib/rgba.ts';
import { RADIX, RadixSortStrategy } from './radix-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

class CountingSortStrategy extends RadixSortStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    yield* this.sort(array, 1);
  }

  public *sort(
    array: number[],
    base: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    const count = new Array(RADIX).fill(0);
    const copy = new Array(n);
    let pendingAccessCount = 0;
    for (let i = 0; i < n; i += 1) {
      const val = array[i];
      pendingAccessCount += 1;
      copy[i] = val;
      const digit = super.getDigit(val, base);
      count[digit] += 1;
      yield {
        accessCount: pendingAccessCount,
        comparisonCount: 0,
        highlights: [{ color: RED, indices: [i], skipTone: false }],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pendingAccessCount = 0;
    }
    const bkt = new Array(RADIX + 1).fill(0);
    for (let i = 0; i < RADIX; i += 1) {
      bkt[i + 1] = bkt[i] + count[i];
    }
    const boundaryIndices: number[] = [];
    for (let i = 0; i < bkt.length - 1; i += 1) {
      if (bkt[i] < n) boundaryIndices.push(bkt[i]);
    }
    for (let i = 0; i < n; i += 1) {
      const val = copy[i];
      const digit = super.getDigit(val, base);
      const targetIdx = bkt[digit];
      array[targetIdx] = val;
      pendingAccessCount += 1;
      bkt[digit] += 1;
      yield {
        accessCount: pendingAccessCount,
        comparisonCount: 0,
        highlights: [
          { color: RED, indices: [targetIdx], skipTone: false },
          { color: CYAN, indices: boundaryIndices, skipTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pendingAccessCount = 0;
    }
  }
}

export { CountingSortStrategy };
