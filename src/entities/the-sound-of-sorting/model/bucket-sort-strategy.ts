import { CYAN, RED } from '@/shared/lib/rgba.ts';
import {
  SortingStrategy,
  type SortingStrategyYield,
} from './sorting-strategy.ts';
import { SwapInsertionSortStrategy } from './swap-insertion-sort-strategy.ts';

/**
 * @description Controls the density of the buckets for visualization purposes.
 */
const ITEMS_PER_BUCKET = 4;

class BucketSortStrategy extends SortingStrategy {
  private swapInsertionSortStrategy = new SwapInsertionSortStrategy();

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    const n = array.length;
    if (n <= 1) {
      return;
    }
    const min = Math.min(...array);
    const max = Math.max(...array);
    if (min === max) {
      return;
    }
    const bktsCount = Math.max(1, Math.floor(n / ITEMS_PER_BUCKET));
    const bkts: number[][] = Array.from({ length: bktsCount }, () => []);
    for (let i = 0; i < n; i += 1) {
      const val = array[i];
      const normalized = (val - min) / (max - min);
      let bktIdx = Math.floor(normalized * bktsCount);
      if (bktIdx >= bktsCount) {
        bktIdx = bktsCount - 1;
      }
      bkts[bktIdx].push(val);
      yield {
        accessCount: 1,
        comparisonCount: 0,
        highlights: [{ color: RED, indices: [i], skipTone: false }],
        shiftCount: 0,
        swapCount: 0,
      };
    }
    let currentIndex = 0;
    const bucketRanges: { start: number; end: number }[] = [];
    for (let i = 0; i < bktsCount; i += 1) {
      const bkt = bkts[i];
      if (bkt.length === 0) {
        continue;
      }
      const start = currentIndex;
      for (const val of bkt) {
        array[currentIndex] = val;
        yield {
          accessCount: 1,
          comparisonCount: 0,
          highlights: [
            { color: CYAN, indices: [currentIndex], skipTone: false },
          ],
          shiftCount: 0,
          swapCount: 0,
        };
        currentIndex += 1;
      }
      const end = currentIndex - 1;
      bucketRanges.push({ start, end });
    }
    for (const { start, end } of bucketRanges) {
      if (start < end) {
        yield* this.swapInsertionSortStrategy.sort(array, start, end);
      }
    }
  }
}

export { BucketSortStrategy };
