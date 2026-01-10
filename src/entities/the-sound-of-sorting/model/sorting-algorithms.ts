import type { ReadonlyDeep } from 'type-fest';
import { BinaryInsertionSortStrategy } from './binary-insertion-sort-strategy.ts';
import { BottomUpMergeSortStrategy } from './bottom-up-merge-sort-strategy.ts';
import { BubbleSortStrategy } from './bubble-sort-strategy.ts';
import { GnomeSortStrategy } from './gnome-sort-strategy.ts';
import { HeapSortStrategy } from './heap-sort-strategy.ts';
import { IncerpiSedgewickShellSortStrategy } from './incerpi-sedgewick-shell-sort-strategy.ts';
import { KnuthShellSortStrategy } from './knuth-shell-sort-strategy.ts';
import { SelectionSortStrategy } from './selection-sort-strategy.ts';
import { ShiftInsertionSortStrategy } from './shift-insertion-sort-strategy.ts';
import type { SortingStrategy } from './sorting-strategy.ts';
import { SwapInsertionSortStrategy } from './swap-insertion-sort-strategy.ts';
import { TopDownMergeSortStrategy } from './top-down-merge-sort-strategy.ts';

const SortingAlgorithm = {
  BubbleSort: 'bubble-sort',
  SelectionSort: 'selection-sort',
  BinaryInsertionSort: 'binary-insertion-sort',
  ShiftInsertionSort: 'shift-insertion-sort',
  SwapInsertionSort: 'swap-insertion-sort',
  GnomeSort: 'gnome-sort',
  IncerpiSedgewickShellSort: 'incerpi-sedgewick-shell-sort',
  KnuthShellSort: 'knuth-shell-sort',
  BottomUpMergeSort: 'bottom-up-merge-sort',
  TopDownMergeSort: 'top-down-merge-sort',
  HeapSort: 'heap-sort',
} as const;

type SortingAlgorithm =
  (typeof SortingAlgorithm)[keyof typeof SortingAlgorithm];

function assertIsSortingAlgorithm(
  value: unknown,
): asserts value is SortingAlgorithm {
  if (
    typeof value !== 'string' ||
    !Object.values(SortingAlgorithm).includes(value as SortingAlgorithm)
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
  [SortingAlgorithm.BubbleSort]: {
    key: SortingAlgorithm.BubbleSort,
    label: 'Bubble',
    strategy: new BubbleSortStrategy(),
  },
  [SortingAlgorithm.SelectionSort]: {
    key: SortingAlgorithm.SelectionSort,
    label: 'Selection',
    strategy: new SelectionSortStrategy(),
  },
  [SortingAlgorithm.BinaryInsertionSort]: {
    key: SortingAlgorithm.BinaryInsertionSort,
    label: 'Binary Insertion',
    strategy: new BinaryInsertionSortStrategy(),
  },
  [SortingAlgorithm.ShiftInsertionSort]: {
    key: SortingAlgorithm.ShiftInsertionSort,
    label: 'Shift Insertion',
    strategy: new ShiftInsertionSortStrategy(),
  },
  [SortingAlgorithm.SwapInsertionSort]: {
    key: SortingAlgorithm.SwapInsertionSort,
    label: 'Swap Insertion',
    strategy: new SwapInsertionSortStrategy(),
  },
  [SortingAlgorithm.GnomeSort]: {
    key: SortingAlgorithm.GnomeSort,
    label: 'Gnome',
    strategy: new GnomeSortStrategy(),
  },
  [SortingAlgorithm.IncerpiSedgewickShellSort]: {
    key: SortingAlgorithm.IncerpiSedgewickShellSort,
    label: 'Incerpi-Sedgewick Shell',
    strategy: new IncerpiSedgewickShellSortStrategy(),
  },
  [SortingAlgorithm.KnuthShellSort]: {
    key: SortingAlgorithm.KnuthShellSort,
    label: 'Knuth Shell',
    strategy: new KnuthShellSortStrategy(),
  },
  [SortingAlgorithm.BottomUpMergeSort]: {
    key: SortingAlgorithm.BottomUpMergeSort,
    label: 'Bottom-Up Merge',
    strategy: new BottomUpMergeSortStrategy(),
  },
  [SortingAlgorithm.TopDownMergeSort]: {
    key: SortingAlgorithm.TopDownMergeSort,
    label: 'Top-Down Merge',
    strategy: new TopDownMergeSortStrategy(),
  },
  [SortingAlgorithm.HeapSort]: {
    key: SortingAlgorithm.HeapSort,
    label: 'Heap',
    strategy: new HeapSortStrategy(),
  },
};

const INITIAL_SORTING_ALGORITHM: SortingAlgorithm = SortingAlgorithm.BubbleSort;

export {
  assertIsSortingAlgorithm,
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  SortingAlgorithm,
};
