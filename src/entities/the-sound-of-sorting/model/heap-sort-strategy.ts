import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
  SortOperation,
} from './sorting-strategy.ts';

const GOLDEN_ANGLE_DEG = 180 * (3 - Math.sqrt(5));

class HeapSortStrategy extends SortingStrategy {
  private depthHighlightGroupsCache: HighlightGroup[] = [];

  private getIndexDepth(index: number): number {
    return Math.floor(Math.log2(index + 1));
  }

  private getIndexColor(index: number): string {
    return `hsl(${(this.getIndexDepth(index) * GOLDEN_ANGLE_DEG) % 360}, 85%, 70%)`;
  }

  private initializeDepthHighlightGroups(n: number): void {
    this.depthHighlightGroupsCache = [];
    const groupsRefMap = new Map<string, HighlightGroup>();
    const firstLeafIndex = Math.floor(n / 2);
    for (let k = 0; k < n; k += 1) {
      const color = this.getIndexColor(k);
      let group = groupsRefMap.get(color);
      if (group === undefined) {
        group = {
          color,
          indices: [],
          skipHighlightGroupTone: true,
        };
        this.depthHighlightGroupsCache.push(group);
        groupsRefMap.set(color, group);
      }
      if (k >= firstLeafIndex) {
        group.indices.push(k);
      }
    }
  }

  private getIndexGroup(index: number): HighlightGroup | undefined {
    return this.depthHighlightGroupsCache.find(
      (depthHighlightGroup) =>
        depthHighlightGroup.color === this.getIndexColor(index),
    );
  }

  private revealDepthColorForIndex(index: number): void {
    const group = this.getIndexGroup(index);
    if (group) {
      group.indices.push(index);
    }
  }

  private hideDepthColorForIndex(index: number): void {
    const group = this.getIndexGroup(index);
    if (group) {
      group.indices = group.indices.filter((i) => i !== index);
    }
  }

  private *siftDown(
    array: number[],
    i: number,
    n: number,
    lo: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    let childIndex = 2 * i + 1;
    while (childIndex < n) {
      if (childIndex + 1 < n) {
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            ...this.depthHighlightGroupsCache,
            {
              color: RED,
              indices: [lo + childIndex, lo + childIndex + 1],
              skipHighlightGroupTone: false,
            },
            { color: GREEN, indices: [lo + n], skipHighlightGroupTone: true },
          ],
          shiftCount: 0,
          sortOperation: SortOperation.Compare,
          swapCount: 0,
        };
        if (array[lo + childIndex + 1] > array[lo + childIndex]) {
          childIndex += 1;
        }
      }
      yield {
        accessCount: 2,
        comparisonCount: 1,
        highlights: [
          ...this.depthHighlightGroupsCache,
          {
            color: RED,
            indices: [lo + i, lo + childIndex],
            skipHighlightGroupTone: false,
          },
          { color: GREEN, indices: [lo + n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Compare,
        swapCount: 0,
      };
      if (array[lo + i] >= array[lo + childIndex]) {
        return;
      }
      super.swap(array, lo + i, lo + childIndex);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          ...this.depthHighlightGroupsCache,
          {
            color: RED,
            indices: [lo + i, lo + childIndex],
            skipHighlightGroupTone: true,
          },
          { color: GREEN, indices: [lo + n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
      i = childIndex;
      childIndex = 2 * i + 1;
    }
  }

  private *heapify(
    array: number[],
    n: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
      yield* this.siftDown(array, i, n, 0);
      this.revealDepthColorForIndex(i);
    }
  }

  public *sort(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const n = hi - lo + 1;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
      yield* this.siftDown(array, i, n, lo);
    }
    let size = n;
    while (size > 1) {
      size -= 1;
      super.swap(array, lo, lo + size);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          {
            color: RED,
            indices: [lo, lo + size],
            skipHighlightGroupTone: true,
          },
          { color: GREEN, indices: [lo + size], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
      yield* this.siftDown(array, 0, size, lo);
    }
  }

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    let n = array.length;
    this.initializeDepthHighlightGroups(n);
    yield* this.heapify(array, n);
    while (n > 1) {
      n -= 1;
      this.hideDepthColorForIndex(n);
      super.swap(array, 0, n);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          ...this.depthHighlightGroupsCache,
          { color: RED, indices: [0], skipHighlightGroupTone: true },
          { color: GREEN, indices: [n], skipHighlightGroupTone: true },
        ],
        shiftCount: 0,
        sortOperation: SortOperation.Swap,
        swapCount: 1,
      };
      yield* this.siftDown(array, 0, n, 0);
    }
    yield {
      accessCount: 0,
      comparisonCount: 0,
      highlights: [
        { color: GREEN, indices: [0], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      sortOperation: SortOperation.Inspect,
      swapCount: 0,
    };
  }
}

export { HeapSortStrategy };
