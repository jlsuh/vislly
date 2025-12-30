'use client';

import { type ChangeEvent, type JSX, useId } from 'react';
import Button from '@/shared/ui/Button/Button.tsx';
import { Divider } from '@/shared/ui/Divider/Divider.tsx';
import PauseIcon from '@/shared/ui/PauseIcon/PauseIcon.tsx';
import ResetIcon from '@/shared/ui/ResetIcon/ResetIcon.tsx';
import Select from '@/shared/ui/Select/Select.tsx';
import ShuffleIcon from '@/shared/ui/ShuffleIcon/ShuffleIcon.tsx';
import SortIcon from '@/shared/ui/SortIcon/SortIcon.tsx';
import StepIcon from '@/shared/ui/StepIcon/StepIcon.tsx';
import VolumeOffIcon from '@/shared/ui/VolumeOffIcon/VolumeOffIcon.tsx';
import VolumeUpIcon from '@/shared/ui/VolumeUpIcon/VolumeUpIcon.tsx';
import {
  assertIsSortingAlgorithm,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import styles from './the-sound-of-sorting-controls.module.css';

type TheSoundOfSortingControlsProps = {
  isMuted: boolean;
  isSorted: boolean;
  isSorting: boolean;
  maxRange: number;
  sortingAlgorithm: string;
  speed: number;
  cancelAnimationFrameIfAny: () => void;
  executeSortingLoop: () => void;
  handleResetWithNewValues: () => void;
  handleStep: () => void;
  reset: (shouldGenerateNewValues: boolean) => void;
  setIsSorting: (newIsSorting: boolean) => void;
  setNewSortingAlgorithm: (newAlgorithm: SortingAlgorithm) => void;
  setNewSpeed: (newSpeed: number) => void;
  setNewStats: () => void;
  setMaxRange: (newMaxRange: number) => void;
  toggleMute: () => void;
};

function TheSoundOfSortingControls({
  isMuted,
  isSorted,
  isSorting,
  maxRange,
  sortingAlgorithm,
  speed,
  cancelAnimationFrameIfAny,
  executeSortingLoop,
  handleResetWithNewValues,
  handleStep,
  reset,
  setIsSorting,
  setNewSortingAlgorithm,
  setNewSpeed,
  setNewStats,
  setMaxRange,
  toggleMute,
}: TheSoundOfSortingControlsProps): JSX.Element {
  const countRangeInputId = useId();
  const speedRangeInputId = useId();

  const handleOnChangeMaxRange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxRange(+e.target.value);
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

  function composePrimaryAction() {
    if (isSorted) {
      return {
        label: 'Sort Again',
        icon: <SortIcon />,
        handler: handleSortAgain,
      };
    }
    if (isSorting) {
      return {
        label: 'Pause',
        icon: <PauseIcon />,
        handler: handlePause,
      };
    }
    return {
      label: 'Sort',
      icon: <SortIcon />,
      handler: handleSort,
    };
  }

  function composeSoundAction() {
    if (isMuted) {
      return { label: 'Unmute', icon: <VolumeOffIcon /> };
    }
    return { label: 'Mute', icon: <VolumeUpIcon /> };
  }

  const primaryAction = composePrimaryAction();
  const soundAction = composeSoundAction();

  return (
    <section className={styles.controlsContainer}>
      <div className={styles.inputsContainer}>
        <Select
          disabled={isSorting}
          handleOnSelectChange={handleOnChangeAlgorithm}
          label="Algorithm"
          options={Object.values(SORTING_ALGORITHMS).map(({ key, label }) => ({
            label,
            value: key,
          }))}
          value={sortingAlgorithm}
        />
        <div className={styles.rangeWrapper}>
          <label className={styles.rangeLabel} htmlFor={countRangeInputId}>
            Items: <strong>{maxRange}</strong>
          </label>
          <input
            className={styles.rangeInput}
            disabled={isSorting}
            id={countRangeInputId}
            max="1000"
            min="100"
            onChange={handleOnChangeMaxRange}
            step="100"
            type="range"
            value={maxRange}
          />
        </div>
        <div className={styles.rangeWrapper}>
          <label className={styles.rangeLabel} htmlFor={speedRangeInputId}>
            Speed: <strong>{speed}ms</strong>
          </label>
          <input
            className={styles.rangeInput}
            id={speedRangeInputId}
            max="100"
            min="0"
            onChange={handleOnChangeSpeed}
            step="10"
            type="range"
            value={speed}
          />
        </div>
      </div>
      <Divider />
      <div className={styles.buttonsContainer}>
        <Button
          fullWidth
          handleOnClickButton={primaryAction.handler}
          icon={primaryAction.icon}
          label={primaryAction.label}
        />
        <Button
          disabled={isSorted || isSorting}
          fullWidth
          handleOnClickButton={handleStep}
          icon={<StepIcon />}
          label="Step"
        />
        <Button
          fullWidth
          handleOnClickButton={toggleMute}
          icon={soundAction.icon}
          label={soundAction.label}
        />
        <Button
          fullWidth
          handleOnClickButton={handleResetWithSameValues}
          icon={<ResetIcon />}
          label="Reset"
        />
        <Button
          fullWidth
          handleOnClickButton={handleResetWithNewValues}
          icon={<ShuffleIcon />}
          label="Shuffle"
        />
      </div>
    </section>
  );
}

export default TheSoundOfSortingControls;
