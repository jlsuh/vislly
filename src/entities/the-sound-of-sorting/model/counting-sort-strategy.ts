import { CYAN, RED } from '@/shared/lib/rgba.ts';
import { RADIX, RadixSortStrategy } from './radix-sort-strategy.ts';
import {
  type HighlightGroup,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

const identity = <T>(x: T): T => x;

class CountingSortStrategy extends RadixSortStrategy {
  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    if (n === 0) {
      return;
    }
    const maxVal = Math.max(...array);
    yield* this.internalCountingSort(array, maxVal + 1, identity, false);
  }

  public *sort(
    array: number[],
    base: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield* this.internalCountingSort(
      array,
      RADIX,
      (val) => super.getDigit(val, base),
      true,
    );
  }

  private *internalCountingSort(
    array: number[],
    rangeSize: number,
    keyExtractor: (val: number) => number,
    isRadixMode: boolean,
  ): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    const count = new Array(rangeSize).fill(0);
    const copy = new Array(n);
    let pendingAccessCount = 0;
    for (let i = 0; i < n; i += 1) {
      const val = array[i];
      pendingAccessCount += 1;
      copy[i] = val;
      const key = keyExtractor(val);
      count[key] += 1;
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
    const bkt = new Array(rangeSize + 1).fill(0);
    for (let i = 0; i < rangeSize; i += 1) {
      bkt[i + 1] = bkt[i] + count[i];
    }
    const boundaryIndices: number[] = [];
    if (isRadixMode) {
      for (let i = 0; i < bkt.length - 1; i += 1) {
        if (bkt[i] < n) boundaryIndices.push(bkt[i]);
      }
    }
    for (let i = 0; i < n; i += 1) {
      const val = copy[i];
      const key = keyExtractor(val);
      const targetIdx = bkt[key];
      array[targetIdx] = val;
      pendingAccessCount += 1;
      bkt[key] += 1;
      const highlights: HighlightGroup[] = [];
      if (isRadixMode) {
        highlights.push(
          { color: RED, indices: [targetIdx], skipTone: false },
          { color: CYAN, indices: boundaryIndices, skipTone: true },
        );
      } else {
        highlights.push({
          color: RED,
          indices: [i, targetIdx],
          skipTone: false,
        });
      }
      yield {
        accessCount: pendingAccessCount,
        comparisonCount: 0,
        highlights,
        shiftCount: 0,
        sortOperation: SortOperation.Inspect,
        swapCount: 0,
      };
      pendingAccessCount = 0;
    }
  }
}

export { CountingSortStrategy };
