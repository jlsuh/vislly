import { GREEN, RED } from '@/shared/lib/rgba.ts';
import { QuickSortStrategy, type SortRange } from './quick-sort-strategy.ts';
import {
  type SortingStrategyYield,
  SortOperationType,
} from './sorting-strategy.ts';

class QuickSortDualPivotYaroslavskiyStrategy extends QuickSortStrategy {
  protected *partition(
    array: number[],
    lo: number,
    hi: number,
  ): Generator<SortingStrategyYield, SortRange[], unknown> {
    if (hi - lo < 2) {
      return [];
    }
    const last = hi - 1;
    yield* this.ensurePivotsOrder(array, lo, last);
    const p = array[lo];
    const q = array[last];
    yield {
      accessCount: 0,
      comparisonCount: 0,
      highlights: [
        { color: GREEN, indices: [lo, last], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      swapCount: 0,
      type: SortOperationType.Inspect,
    };
    const { l, g } = yield* this.partitionLoop(array, lo, last, p, q);
    super.swap(array, lo, l - 1);
    super.swap(array, last, g + 1);
    yield* this.emitDualPivotSwap(lo, l - 1);
    yield* this.emitDualPivotSwap(last, g + 1);
    return [
      { lo, hi: l - 1 },
      { lo: l, hi: g + 1 },
      { lo: g + 2, hi },
    ];
  }

  private *ensurePivotsOrder(
    array: number[],
    idx1: number,
    idx2: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield* this.emitDualPivotComparison(idx1, idx2);
    if (array[idx1] > array[idx2]) {
      super.swap(array, idx1, idx2);
      yield* this.emitDualPivotSwap(idx1, idx2);
    }
  }

  private *partitionLoop(
    array: number[],
    lo: number,
    last: number,
    p: number,
    q: number,
  ): Generator<SortingStrategyYield, { l: number; g: number }, unknown> {
    let l = lo + 1;
    let g = last - 1;
    let k = l;
    while (k <= g) {
      yield* this.emitDualPivotComparison(k, lo);
      if (array[k] < p) {
        super.swap(array, k, l);
        yield* this.emitDualPivotSwap(k, l);
        l++;
      } else {
        const result = yield* this.processGreaterOrEqualPivot(
          array,
          k,
          l,
          g,
          p,
          q,
          lo,
          last,
        );
        l = result.l;
        g = result.g;
      }
      k++;
    }
    return { l, g };
  }

  private *processGreaterOrEqualPivot(
    array: number[],
    k: number,
    l: number,
    g: number,
    p: number,
    q: number,
    lo: number,
    last: number,
  ): Generator<SortingStrategyYield, { l: number; g: number }, unknown> {
    let currentL = l;
    let currentG = g;
    yield* this.emitDualPivotComparison(k, last);
    if (array[k] >= q) {
      while (true) {
        yield* this.emitDualPivotComparison(currentG, last);
        if (array[currentG] > q && k < currentG) {
          currentG--;
        } else {
          break;
        }
      }
      super.swap(array, k, currentG);
      yield* this.emitDualPivotSwap(k, currentG);
      currentG--;
      yield* this.emitDualPivotComparison(k, lo);
      if (array[k] < p) {
        super.swap(array, k, currentL);
        yield* this.emitDualPivotSwap(k, currentL);
        currentL++;
      }
    }
    return { l: currentL, g: currentG };
  }

  private *emitDualPivotComparison(
    idx1: number,
    idx2: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield {
      accessCount: 1,
      comparisonCount: 1,
      highlights: [
        { color: RED, indices: [idx1], skipHighlightGroupTone: false },
        { color: GREEN, indices: [idx2], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      swapCount: 0,
      type: SortOperationType.Compare,
    };
  }

  private *emitDualPivotSwap(
    idx1: number,
    idx2: number,
  ): Generator<SortingStrategyYield, void, unknown> {
    yield {
      accessCount: 2,
      comparisonCount: 0,
      highlights: [
        { color: RED, indices: [idx1, idx2], skipHighlightGroupTone: true },
      ],
      shiftCount: 0,
      swapCount: 1,
      type: SortOperationType.Swap,
    };
  }
}

export { QuickSortDualPivotYaroslavskiyStrategy };
