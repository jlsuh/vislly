import type { ReadonlyDeep } from 'type-fest';
import { BinaryInsertionSortStrategy } from './binary-insertion-sort-strategy.ts';
import { BubbleSortStrategy } from './bubble-sort-strategy.ts';
import { IncerpiSedgewickShellSortStrategy } from './incerpi-sedgewick-shell-sort-strategy.ts';
import { InsertionSortStrategy } from './insertion-sort-strategy.ts';
import { KnuthShellSortStrategy } from './knuth-shell-sort-strategy.ts';
import { SelectionSortStrategy } from './selection-sort-strategy.ts';
import type { SortingStrategy } from './sorting-strategy.ts';

type SortingAlgorithm =
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort'
  | 'binary-insertion-sort'
  | 'incerpi-sedgewick-shell-sort'
  | 'knuth-shell-sort';

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
  'insertion-sort': {
    key: 'insertion-sort',
    label: 'Insertion',
    strategy: new InsertionSortStrategy(),
  },
  'binary-insertion-sort': {
    key: 'binary-insertion-sort',
    label: 'Binary Insertion',
    strategy: new BinaryInsertionSortStrategy(),
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
};

const INITIAL_SORTING_ALGORITHM: SortingAlgorithm =
  SORTING_ALGORITHMS['bubble-sort'].key;

export {
  assertIsSortingAlgorithm,
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
};
