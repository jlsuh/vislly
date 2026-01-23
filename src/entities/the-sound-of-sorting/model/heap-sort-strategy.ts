import { GREEN, RED } from '@/shared/lib/rgba.ts';
import {
  type HighlightGroup,
  SortingStrategy,
  type SortingStrategyYield,
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

  private initializeDepthHighlightGroups(n: number, offset: number): void {
    this.depthHighlightGroupsCache = [];
    const groupsRefMap = new Map<string, HighlightGroup>();
    const firstLeafIndex = n >>> 1;
    for (let k = 0; k < n; k += 1) {
      const color = this.getIndexColor(k);
      let group = groupsRefMap.get(color);
      if (group === undefined) {
        group = { color, indices: [], skipTone: true };
        this.depthHighlightGroupsCache.push(group);
        groupsRefMap.set(color, group);
      }
      if (k >= firstLeafIndex) {
        group.indices.push(offset + k);
      }
    }
  }

  private getIndexGroup(index: number, offset: number): HighlightGroup {
    const relativeIndex = index - offset;
    const expectedColor = this.getIndexColor(relativeIndex);
    const group = this.depthHighlightGroupsCache.find(
      (depthHighlightGroup) => depthHighlightGroup.color === expectedColor,
    );
    if (group === undefined) {
      throw new Error(
        `Depth highlight group not found for expected color: ${expectedColor}`,
      );
    }
    return group;
  }

  private revealDepthColorForIndex(index: number, offset: number): void {
    const group = this.getIndexGroup(index, offset);
    if (!group.indices.includes(index)) {
      group.indices.push(index);
    }
  }

  private hideDepthColorForIndex(index: number, offset: number): void {
    const group = this.getIndexGroup(index, offset);
    group.indices = group.indices.filter((i) => i !== index);
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
        const isRightChildGreaterThanLeftChild =
          array[lo + childIndex + 1] > array[lo + childIndex];
        yield {
          accessCount: 2,
          comparisonCount: 1,
          highlights: [
            ...this.depthHighlightGroupsCache,
            {
              color: RED,
              indices: [lo + childIndex, lo + childIndex + 1],
              skipTone: false,
            },
            { color: GREEN, indices: [lo + n], skipTone: true },
          ],
          shiftCount: 0,
          swapCount: 0,
        };
        if (isRightChildGreaterThanLeftChild) {
          childIndex += 1;
        }
      }
      const isParentLargerOrEqualThanCurrentChild =
        array[lo + i] >= array[lo + childIndex];
      yield {
        accessCount: 2,
        comparisonCount: 1,
        highlights: [
          ...this.depthHighlightGroupsCache,
          { color: RED, indices: [lo + i, lo + childIndex], skipTone: false },
          { color: GREEN, indices: [lo + n], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 0,
      };
      if (isParentLargerOrEqualThanCurrentChild) {
        return;
      }
      super.swap(array, lo + i, lo + childIndex);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          ...this.depthHighlightGroupsCache,
          { color: RED, indices: [lo + i, lo + childIndex], skipTone: true },
          { color: GREEN, indices: [lo + n], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 1,
      };
      i = childIndex;
      childIndex = 2 * i + 1;
    }
  }

  public *sort(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    const n = hi - lo + 1;
    this.initializeDepthHighlightGroups(n, lo);
    for (let i = (n >>> 1) - 1; i >= 0; i -= 1) {
      yield* this.siftDown(array, i, n, lo);
      this.revealDepthColorForIndex(lo + i, lo);
    }
    let size = n;
    while (size > 1) {
      size -= 1;
      this.hideDepthColorForIndex(lo + size, lo);
      super.swap(array, lo, lo + size);
      yield {
        accessCount: 4,
        comparisonCount: 0,
        highlights: [
          ...this.depthHighlightGroupsCache,
          { color: RED, indices: [lo, lo + size], skipTone: true },
          { color: GREEN, indices: [lo + size], skipTone: true },
        ],
        shiftCount: 0,
        swapCount: 1,
      };
      yield* this.siftDown(array, 0, size, lo);
    }
    this.depthHighlightGroupsCache = [];
  }

  public override *generator({
    array,
  }: {
    array: number[];
  }): Generator<SortingStrategyYield, void, unknown> {
    yield* this.sort(array, 0, array.length - 1);
    yield {
      accessCount: 0,
      comparisonCount: 0,
      highlights: [{ color: GREEN, indices: [0], skipTone: true }],
      shiftCount: 0,
      swapCount: 0,
    };
  }
}

export { HeapSortStrategy };
