import type { ReadonlyDeep } from 'type-fest';
import { BubbleSortStrategy } from './bubble-sort-strategy.ts';
import { InsertionSortStrategy } from './insertion-sort-strategy.ts';
import { SelectionSortStrategy } from './selection-sort-strategy.ts';
import type { SortingStrategy } from './sorting-strategy.ts';

type SortingAlgorithm = 'bubble-sort' | 'insertion-sort' | 'selection-sort';

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
    strategy: new BubbleSortStrategy(),
    label: 'Bubble',
  },
  'insertion-sort': {
    key: 'insertion-sort',
    strategy: new InsertionSortStrategy(),
    label: 'Insertion (Swap)',
  },
  'selection-sort': {
    key: 'selection-sort',
    strategy: new SelectionSortStrategy(),
    label: 'Selection',
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
