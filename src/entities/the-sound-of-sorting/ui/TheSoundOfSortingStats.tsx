import type { JSX } from 'react';
import {
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import type { SortingStats } from '../model/sorting-stats.ts';
import styles from './the-sound-of-sorting-stats.module.css';

type TheSoundOfSortingStatsProps = {
  algorithm: SortingAlgorithm;
  delay: number;
  stats: SortingStats;
};

function TheSoundOfSortingStats({
  algorithm,
  delay,
  stats,
}: TheSoundOfSortingStatsProps): JSX.Element {
  const algorithmLabel = SORTING_ALGORITHMS[algorithm].label;

  return (
    <div className={styles.statsContainer}>
      {algorithmLabel} - {stats.comparisons} comparisons, {stats.accesses} R/W
      accesses, {stats.swaps} swaps, {stats.shifts} shifts, {delay}ms delay
    </div>
  );
}

export default TheSoundOfSortingStats;
