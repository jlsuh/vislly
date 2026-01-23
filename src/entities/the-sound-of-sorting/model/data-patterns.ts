import type { ReadonlyDeep } from 'type-fest';
import { integerRange } from '@/shared/lib/array';
import {
  composeFisherYatesIntegerRangeShuffle,
  fisherYatesShuffle,
} from '@/shared/lib/random.ts';

const DataPattern = {
  Random: 'random',
  Ascending: 'ascending',
  Descending: 'descending',
  Cubic: 'cubic',
  Quintic: 'quintic',
  NMinus2Equal: 'n-minus-2-equal',
} as const;

type DataPattern = (typeof DataPattern)[keyof typeof DataPattern];

type PatternGenerator = (length: number) => number[];

const DATA_PATTERNS: ReadonlyDeep<
  Record<
    DataPattern,
    { key: DataPattern; label: string; generate: PatternGenerator }
  >
> = {
  [DataPattern.Random]: {
    generate: (length: number) => {
      return composeFisherYatesIntegerRangeShuffle(1, length);
    },
    key: DataPattern.Random,
    label: 'Random Shuffle',
  },
  [DataPattern.Ascending]: {
    generate: (length: number) => {
      return integerRange(1, length);
    },
    key: DataPattern.Ascending,
    label: 'Ascending',
  },
  [DataPattern.Descending]: {
    generate: (length: number) => {
      return integerRange(1, length).reverse();
    },
    key: DataPattern.Descending,
    label: 'Descending',
  },
  [DataPattern.Cubic]: {
    generate: (length: number) => {
      const arr = new Array(length);
      for (let i = 0; i < length; i += 1) {
        const x = (2.0 * i) / length - 1.0;
        const v = x ** 3;
        const w = ((v + 1.0) / 2.0) * length + 1;
        arr[i] = Math.floor(w);
      }
      return fisherYatesShuffle(arr);
    },
    key: DataPattern.Cubic,
    label: 'Shuffled Cubic',
  },
  [DataPattern.Quintic]: {
    generate: (length: number) => {
      const arr = new Array(length);
      for (let i = 0; i < length; i += 1) {
        const x = (2.0 * i) / length - 1.0;
        const v = x ** 5;
        const w = ((v + 1.0) / 2.0) * length + 1;
        arr[i] = Math.floor(w);
      }
      return fisherYatesShuffle(arr);
    },
    key: DataPattern.Quintic,
    label: 'Shuffled Quintic',
  },
  [DataPattern.NMinus2Equal]: {
    generate: (length: number) => {
      if (length === 0) return [];
      const arr = new Array(length);
      arr[0] = 1;
      const midValue = Math.floor(length / 2) + 1;
      if (length > 2) {
        arr.fill(midValue, 1, length - 1);
      }
      arr[length - 1] = length;
      return fisherYatesShuffle(arr);
    },
    key: DataPattern.NMinus2Equal,
    label: 'Shuffled n-2 Equal',
  },
};

const INITIAL_DATA_PATTERN: DataPattern = DataPattern.Random;

function assertIsDataPattern(value: unknown): asserts value is DataPattern {
  if (
    typeof value !== 'string' ||
    !Object.values(DataPattern).includes(value as DataPattern)
  ) {
    throw new Error(`Invalid data pattern: ${value}`);
  }
}

export {
  assertIsDataPattern,
  DATA_PATTERNS,
  DataPattern,
  INITIAL_DATA_PATTERN,
};
