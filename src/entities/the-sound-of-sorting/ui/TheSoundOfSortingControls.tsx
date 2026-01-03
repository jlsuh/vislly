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
import { SortingStatus } from '../model/sorting-status.ts';
import styles from './the-sound-of-sorting-controls.module.css';

type TheSoundOfSortingControlsProps = {
  delay: number;
  isMuted: boolean;
  maxRange: number;
  sortingAlgorithm: string;
  status: SortingStatus;
  handlePause: () => void;
  handleResetWithNewValues: () => void;
  handleResume: () => void;
  handleStep: () => void;
  reset: (shouldGenerateNewValues: boolean) => void;
  setMaxRange: (newMaxRange: number) => void;
  setNewDelay: (newDelay: number) => void;
  setNewSortingAlgorithm: (newAlgorithm: SortingAlgorithm) => void;
  toggleMute: () => void;
};

function TheSoundOfSortingControls({
  delay,
  isMuted,
  maxRange,
  sortingAlgorithm,
  status,
  handlePause,
  handleResetWithNewValues,
  handleResume,
  handleStep,
  reset,
  setMaxRange,
  setNewDelay,
  setNewSortingAlgorithm,
  toggleMute,
}: TheSoundOfSortingControlsProps): JSX.Element {
  const countRangeInputId = useId();
  const delayRangeInputId = useId();

  const isSortingOrVerifying =
    status === SortingStatus.Sorting || status === SortingStatus.Verifying;

  const handleOnChangeMaxRange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxRange(+e.target.value);
  };

  const handleResetWithSameValues = () => {
    reset(false);
  };

  const handleOnChangeAlgorithm = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    assertIsSortingAlgorithm(newAlgorithm);
    setNewSortingAlgorithm(newAlgorithm);
    handleResetWithSameValues();
  };

  const handleOnChangeDelay = (e: ChangeEvent<HTMLInputElement>) => {
    setNewDelay(+e.target.value);
  };

  const handleSortAgain = () => {
    handleResetWithSameValues();
    handleResume();
  };

  function composePrimaryAction() {
    if (isSortingOrVerifying) {
      return {
        label: 'Pause',
        icon: <PauseIcon />,
        handler: handlePause,
      };
    }
    if (status === SortingStatus.Finished) {
      return {
        label: 'Sort Again',
        icon: <SortIcon />,
        handler: handleSortAgain,
      };
    }
    if (
      status === SortingStatus.ReadyToResumeSorting ||
      status === SortingStatus.ReadyToResumeVerifying
    ) {
      return {
        label: 'Resume',
        icon: <SortIcon />,
        handler: handleResume,
      };
    }
    if (status === SortingStatus.Idle) {
      return {
        label: 'Sort',
        icon: <SortIcon />,
        handler: handleResume,
      };
    }
    throw new Error(`Unknown sorting status: ${status}`);
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
          disabled={isSortingOrVerifying}
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
            Array Size:<strong>{maxRange}</strong>
          </label>
          <input
            className={styles.rangeInput}
            disabled={isSortingOrVerifying}
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
          <label className={styles.rangeLabel} htmlFor={delayRangeInputId}>
            Delay:<strong>{delay}ms</strong>
          </label>
          <input
            className={styles.rangeInput}
            id={delayRangeInputId}
            max="100"
            min="0"
            onChange={handleOnChangeDelay}
            step="10"
            type="range"
            value={delay}
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
          disabled={status === SortingStatus.Finished || isSortingOrVerifying}
          fullWidth
          handleOnClickButton={handleStep}
          icon={<StepIcon />}
          label="Step"
          variant="secondary"
        />
        <Button
          fullWidth
          handleOnClickButton={toggleMute}
          icon={soundAction.icon}
          label={soundAction.label}
          variant="secondary"
        />
        <Button
          fullWidth
          handleOnClickButton={handleResetWithSameValues}
          icon={<ResetIcon />}
          label="Reset"
          variant="secondary"
        />
        <Button
          fullWidth
          handleOnClickButton={handleResetWithNewValues}
          icon={<ShuffleIcon />}
          label="Shuffle"
          variant="secondary"
        />
      </div>
    </section>
  );
}

export default TheSoundOfSortingControls;
