import type { ReadonlyDeep } from 'type-fest';
import { BinaryInsertionSortStrategy } from './binary-insertion-sort-strategy.ts';
import { BottomUpMergeSortStrategy } from './bottom-up-merge-sort-strategy.ts';
import { BubbleSortStrategy } from './bubble-sort-strategy.ts';
import { IncerpiSedgewickShellSortStrategy } from './incerpi-sedgewick-shell-sort-strategy.ts';
import { KnuthShellSortStrategy } from './knuth-shell-sort-strategy.ts';
import { SelectionSortStrategy } from './selection-sort-strategy.ts';
import { ShiftInsertionSortStrategy } from './shift-insertion-sort-strategy.ts';
import type { SortingStrategy } from './sorting-strategy.ts';
import { SwapInsertionSortStrategy } from './swap-insertion-sort-strategy.ts';
import { TopDownMergeSortStrategy } from './top-down-merge-sort-strategy.ts';

type SortingAlgorithm =
  | 'bubble-sort'
  | 'selection-sort'
  | 'binary-insertion-sort'
  | 'shift-insertion-sort'
  | 'swap-insertion-sort'
  | 'incerpi-sedgewick-shell-sort'
  | 'knuth-shell-sort'
  | 'bottom-up-merge-sort'
  | 'top-down-merge-sort';

function assertIsSortingAlgorithm(
  value: unknown,
): asserts value is SortingAlgorithm {
  if (
    typeof value !== 'string' ||
    !Object.keys(SORTING_ALGORITHMS).includes(value)
  ) {
    throw new Error(`Invalid sorting algorithm: ${value}`);
  }
}

const SORTING_ALGORITHMS: ReadonlyDeep<
  Record<
    SortingAlgorithm,
    {
      key: SortingAlgorithm;
      strategy: SortingStrategy;
      label: string;
    }
  >
> = {
  'bubble-sort': {
    key: 'bubble-sort',
    label: 'Bubble',
    strategy: new BubbleSortStrategy(),
  },
  'selection-sort': {
    key: 'selection-sort',
    label: 'Selection',
    strategy: new SelectionSortStrategy(),
  },
  'binary-insertion-sort': {
    key: 'binary-insertion-sort',
    label: 'Binary Insertion',
    strategy: new BinaryInsertionSortStrategy(),
  },
  'shift-insertion-sort': {
    key: 'shift-insertion-sort',
    label: 'Shift Insertion',
    strategy: new ShiftInsertionSortStrategy(),
  },
  'swap-insertion-sort': {
    key: 'swap-insertion-sort',
    label: 'Swap Insertion',
    strategy: new SwapInsertionSortStrategy(),
  },
  'incerpi-sedgewick-shell-sort': {
    key: 'incerpi-sedgewick-shell-sort',
    label: 'Incerpi-Sedgewick Shell',
    strategy: new IncerpiSedgewickShellSortStrategy(),
  },
  'knuth-shell-sort': {
    key: 'knuth-shell-sort',
    label: 'Knuth Shell',
    strategy: new KnuthShellSortStrategy(),
  },
  'bottom-up-merge-sort': {
    key: 'bottom-up-merge-sort',
    label: 'Bottom-Up Merge',
    strategy: new BottomUpMergeSortStrategy(),
  },
  'top-down-merge-sort': {
    key: 'top-down-merge-sort',
    label: 'Top-Down Merge',
    strategy: new TopDownMergeSortStrategy(),
  },
};

const INITIAL_SORTING_ALGORITHM: SortingAlgorithm =
  SORTING_ALGORITHMS['bubble-sort'].key;

export {
  assertIsSortingAlgorithm,
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
};
