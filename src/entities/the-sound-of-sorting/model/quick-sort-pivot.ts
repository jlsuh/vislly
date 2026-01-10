import type { ReadonlyDeep } from 'type-fest';

const QuickSortPivot = {
  First: 'first',
  Last: 'last',
  Middle: 'middle',
  Random: 'random',
  MedianOfThree: 'median-of-three',
} as const;

type QuickSortPivot = (typeof QuickSortPivot)[keyof typeof QuickSortPivot];

function assertIsQuickSortPivot(
  value: unknown,
): asserts value is QuickSortPivot {
  if (!Object.values(QuickSortPivot).includes(value as QuickSortPivot)) {
    throw new Error(`Invalid QuickSortPivot value: ${value}`);
  }
}

const INITIAL_QUICK_SORT_PIVOT: QuickSortPivot = QuickSortPivot.First;

const QUICK_SORT_PIVOTS: ReadonlyDeep<
  Record<QuickSortPivot, { label: string; value: QuickSortPivot }>
> = {
  [QuickSortPivot.First]: { label: 'First Item', value: QuickSortPivot.First },
  [QuickSortPivot.Middle]: {
    label: 'Middle Item',
    value: QuickSortPivot.Middle,
  },
  [QuickSortPivot.Last]: { label: 'Last Item', value: QuickSortPivot.Last },
  [QuickSortPivot.Random]: {
    label: 'Random Item',
    value: QuickSortPivot.Random,
  },
  [QuickSortPivot.MedianOfThree]: {
    label: 'Median of Three',
    value: QuickSortPivot.MedianOfThree,
  },
};

export {
  assertIsQuickSortPivot,
  INITIAL_QUICK_SORT_PIVOT,
  QUICK_SORT_PIVOTS,
  QuickSortPivot,
};
