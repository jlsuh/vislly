'use client';

import { type ChangeEvent, type JSX, useId } from 'react';
import Select from '@/shared/ui/Select/Select.tsx';
import {
  assertIsSortingAlgorithm,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import styles from './the-sound-of-sorting-controls.module.css';

type TheSoundOfSortingControlsProps = {
  isSorted: boolean;
  isSorting: boolean;
  rangeEnd: number;
  sortingAlgorithm: string;
  speed: number;
  stats: { comparisons: number; accesses: number };
  cancelAnimationFrameIfAny: () => void;
  executeSortingLoop: () => void;
  handleResetWithNewValues: () => void;
  handleStep: () => void;
  reset: (shouldGenerateNewValues: boolean) => void;
  setIsSorting: (newIsSorting: boolean) => void;
  setNewSortingAlgorithm: (newAlgorithm: SortingAlgorithm) => void;
  setNewSpeed: (newSpeed: number) => void;
  setNewStats: () => void;
  setRangeEnd: (newRangeEnd: number) => void;
};

export function TheSoundOfSortingControls({
  isSorted,
  isSorting,
  rangeEnd,
  sortingAlgorithm,
  speed,
  stats,
  cancelAnimationFrameIfAny,
  executeSortingLoop,
  handleResetWithNewValues,
  handleStep,
  reset,
  setIsSorting,
  setNewSortingAlgorithm,
  setNewSpeed,
  setNewStats,
  setRangeEnd,
}: TheSoundOfSortingControlsProps): JSX.Element {
  const countRangeInputId = useId();
  const speedRangeInputId = useId();

  const handleOnChangeRangeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeEnd(+e.target.value);
  };

  const handleOnChangeAlgorithm = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    assertIsSortingAlgorithm(newAlgorithm);
    setNewSortingAlgorithm(newAlgorithm);
    handleResetWithSameValues();
  };

  const handleOnChangeSpeed = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSpeed(+e.target.value);
  };

  const handleResetWithSameValues = () => {
    reset(false);
  };

  const handleSortAgain = () => {
    handleResetWithSameValues();
    handleSort();
  };

  const handlePause = () => {
    cancelAnimationFrameIfAny();
    setIsSorting(false);
    setNewStats();
  };

  const handleSort = () => {
    setIsSorting(true);
    executeSortingLoop();
  };

  const composePrimaryAction = () => {
    if (isSorted) {
      return {
        primaryActionLabel: 'Sort Again',
        primaryActionHandler: handleSortAgain,
      };
    }
    if (isSorting) {
      return {
        primaryActionLabel: 'Pause',
        primaryActionHandler: handlePause,
      };
    }
    return {
      primaryActionLabel: 'Sort',
      primaryActionHandler: handleSort,
    };
  };

  const { primaryActionLabel, primaryActionHandler } = composePrimaryAction();

  return (
    <div className={styles.controls}>
      <div className={styles.controlRow}>
        <Select
          disabled={isSorting}
          handleOnSelectChange={handleOnChangeAlgorithm}
          label="Algorithm"
          options={Object.values(SORTING_ALGORITHMS).map(({ key, label }) => ({
            value: key,
            label,
          }))}
          value={sortingAlgorithm}
        />
      </div>
      <div className={styles.controlRow}>
        <label htmlFor={countRangeInputId}>
          Items: <strong>{rangeEnd}</strong>
        </label>
        <input
          id={countRangeInputId}
          max="1000"
          min="100"
          onChange={handleOnChangeRangeEnd}
          step="100"
          type="range"
          value={rangeEnd}
        />
      </div>
      <div className={styles.controlRow}>
        <label htmlFor={speedRangeInputId}>
          Speed delay: <strong>{speed}ms</strong>
        </label>
        <input
          id={speedRangeInputId}
          max="100"
          min="0"
          onChange={handleOnChangeSpeed}
          step="10"
          type="range"
          value={speed}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={handleResetWithNewValues}
          type="button"
        >
          Shuffle
        </button>
        <button
          className={styles.button}
          onClick={handleResetWithSameValues}
          type="button"
        >
          Reset
        </button>
        <button
          className={styles.button}
          disabled={isSorted || isSorting}
          onClick={handleStep}
          type="button"
        >
          Step
        </button>
        <button
          className={styles.button}
          onClick={primaryActionHandler}
          type="button"
        >
          {primaryActionLabel}
        </button>
      </div>
      <div className={styles.stats}>
        <span>
          Comparisons: <strong>{stats.comparisons}</strong>
        </span>
        <span>
          Accesses: <strong>{stats.accesses}</strong>
        </span>
      </div>
    </div>
  );
}
