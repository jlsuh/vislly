import type { ReadonlyDeep } from 'type-fest';
import { BinaryInsertionSortStrategy } from './binary-insertion-sort-strategy.ts';
import { BottomUpMergeSortStrategy } from './bottom-up-merge-sort-strategy.ts';
import { BubbleSortStrategy } from './bubble-sort-strategy.ts';
import { GnomeSortStrategy } from './gnome-sort-strategy.ts';
import { HeapSortStrategy } from './heap-sort-strategy.ts';
import { HoarePartitionQuickSortStrategy } from './hoare-partition-quick-sort-strategy.ts';
import { IncerpiSedgewickGapsShellSortStrategy } from './incerpi-sedgewick-gaps-shell-sort-strategy.ts';
import { IntroSortStrategy } from './intro-sort-strategy.ts';
import { KnuthGapsShellSortStrategy } from './knuth-gaps-shell-sort-strategy.ts';
import { LomutoPartitionQuickSortStrategy } from './lomuto-partition-quick-sort-strategy.ts';
import { LsdRadixSortStrategy } from './lsd-radix-sort-strategy.ts';
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
  IncerpiSedgewickGapsShellSort: 'incerpi-sedgewick-gaps-shell-sort',
  KnuthGapsShellSort: 'knuth-gaps-shell-sort',
  BottomUpMergeSort: 'bottom-up-merge-sort',
  TopDownMergeSort: 'top-down-merge-sort',
  HeapSort: 'heap-sort',
  HoarePartitionQuickSort: 'hoare-partition-quick-sort',
  LomutoPartitionQuickSort: 'lomuto-partition-quick-sort',
  IntroSort: 'intro-sort',
  LsdRadixSort: 'lsd-radix-sort',
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
    label: 'Bubble Sort',
    strategy: new BubbleSortStrategy(),
  },
  [SortingAlgorithm.SelectionSort]: {
    key: SortingAlgorithm.SelectionSort,
    label: 'Selection Sort',
    strategy: new SelectionSortStrategy(),
  },
  [SortingAlgorithm.BinaryInsertionSort]: {
    key: SortingAlgorithm.BinaryInsertionSort,
    label: 'Binary Insertion Sort',
    strategy: new BinaryInsertionSortStrategy(),
  },
  [SortingAlgorithm.ShiftInsertionSort]: {
    key: SortingAlgorithm.ShiftInsertionSort,
    label: 'Shift Insertion Sort',
    strategy: new ShiftInsertionSortStrategy(),
  },
  [SortingAlgorithm.SwapInsertionSort]: {
    key: SortingAlgorithm.SwapInsertionSort,
    label: 'Swap Insertion Sort',
    strategy: new SwapInsertionSortStrategy(),
  },
  [SortingAlgorithm.GnomeSort]: {
    key: SortingAlgorithm.GnomeSort,
    label: 'Gnome Sort',
    strategy: new GnomeSortStrategy(),
  },
  [SortingAlgorithm.IncerpiSedgewickGapsShellSort]: {
    key: SortingAlgorithm.IncerpiSedgewickGapsShellSort,
    label: 'Incerpi-Sedgewick Gaps Shell Sort',
    strategy: new IncerpiSedgewickGapsShellSortStrategy(),
  },
  [SortingAlgorithm.KnuthGapsShellSort]: {
    key: SortingAlgorithm.KnuthGapsShellSort,
    label: 'Knuth Gaps Shell Sort',
    strategy: new KnuthGapsShellSortStrategy(),
  },
  [SortingAlgorithm.BottomUpMergeSort]: {
    key: SortingAlgorithm.BottomUpMergeSort,
    label: 'Bottom-Up Merge Sort',
    strategy: new BottomUpMergeSortStrategy(),
  },
  [SortingAlgorithm.TopDownMergeSort]: {
    key: SortingAlgorithm.TopDownMergeSort,
    label: 'Top-Down Merge Sort',
    strategy: new TopDownMergeSortStrategy(),
  },
  [SortingAlgorithm.HeapSort]: {
    key: SortingAlgorithm.HeapSort,
    label: 'Heap Sort',
    strategy: new HeapSortStrategy(),
  },
  [SortingAlgorithm.HoarePartitionQuickSort]: {
    key: SortingAlgorithm.HoarePartitionQuickSort,
    label: 'Hoare Partition Quick Sort',
    strategy: new HoarePartitionQuickSortStrategy(),
  },
  [SortingAlgorithm.LomutoPartitionQuickSort]: {
    key: SortingAlgorithm.LomutoPartitionQuickSort,
    label: 'Lomuto Partition Quick Sort',
    strategy: new LomutoPartitionQuickSortStrategy(),
  },
  [SortingAlgorithm.IntroSort]: {
    key: SortingAlgorithm.IntroSort,
    label: 'Intro Sort',
    strategy: new IntroSortStrategy(),
  },
  [SortingAlgorithm.LsdRadixSort]: {
    key: SortingAlgorithm.LsdRadixSort,
    label: 'LSD Radix Sort',
    strategy: new LsdRadixSortStrategy(),
  },
};

const INITIAL_SORTING_ALGORITHM: SortingAlgorithm = SortingAlgorithm.BubbleSort;

export {
  assertIsSortingAlgorithm,
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  SortingAlgorithm,
};
