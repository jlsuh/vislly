'use client';

import { type ChangeEvent, type JSX, useId } from 'react';
import Button from '@/shared/ui/Button/Button.tsx';
import Divider from '@/shared/ui/Divider/Divider.tsx';
import InfoIcon from '@/shared/ui/InfoIcon/InfoIcon.tsx';
import PauseIcon from '@/shared/ui/PauseIcon/PauseIcon.tsx';
import RangeInput from '@/shared/ui/RangeInput/RangeInput.tsx';
import ResetIcon from '@/shared/ui/ResetIcon/ResetIcon.tsx';
import Select from '@/shared/ui/Select/Select.tsx';
import ShuffleIcon from '@/shared/ui/ShuffleIcon/ShuffleIcon.tsx';
import SortIcon from '@/shared/ui/SortIcon/SortIcon.tsx';
import StepIcon from '@/shared/ui/StepIcon/StepIcon.tsx';
import VolumeOffIcon from '@/shared/ui/VolumeOffIcon/VolumeOffIcon.tsx';
import VolumeUpIcon from '@/shared/ui/VolumeUpIcon/VolumeUpIcon.tsx';
import {
  assertIsDataPattern,
  DATA_PATTERNS,
  type DataPattern,
} from '../model/data-patterns.ts';
import {
  assertIsQuickSortPivot,
  QUICK_SORT_PIVOTS,
  type QuickSortPivot,
} from '../model/quick-sort-pivot.ts';
import {
  assertIsSortingAlgorithm,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import { SortingStatus } from '../model/sorting-status.ts';
import TheSoundOfSortingAboutDialog from './TheSoundOfSortingAboutDialog.tsx';
import styles from './the-sound-of-sorting-controls.module.css';

type TheSoundOfSortingControlsProps = {
  dataPattern: DataPattern;
  delay: number;
  isMuted: boolean;
  maxRange: number;
  pivot: QuickSortPivot;
  sortingAlgorithm: SortingAlgorithm;
  status: SortingStatus;
  handlePause: () => void;
  handleResetWithNewDataPattern: () => void;
  handleResume: () => void;
  handleStep: () => void;
  reset: (shouldGenerateNewDataPattern: boolean) => void;
  setMaxRange: (newMaxRange: number) => void;
  setNewDataPattern: (newPattern: DataPattern) => void;
  setNewDelay: (newDelay: number) => void;
  setNewPivot: (newType: QuickSortPivot) => void;
  setNewSortingAlgorithm: (newAlgorithm: SortingAlgorithm) => void;
  toggleMute: () => void;
};

const SORTING_ALGORITHMS_OPTIONS = Object.values(SORTING_ALGORITHMS).map(
  ({ key, label }) => ({
    label,
    value: key,
  }),
);
const QUICK_SORT_PIVOTS_OPTIONS = Object.values(QUICK_SORT_PIVOTS);
const DATA_PATTERN_OPTIONS = Object.values(DATA_PATTERNS).map(
  ({ key, label }) => ({
    label,
    value: key,
  }),
);

function TheSoundOfSortingControls({
  dataPattern,
  delay,
  isMuted,
  maxRange,
  pivot,
  sortingAlgorithm,
  status,
  handlePause,
  handleResetWithNewDataPattern,
  handleResume,
  handleStep,
  reset,
  setMaxRange,
  setNewDataPattern,
  setNewDelay,
  setNewPivot,
  setNewSortingAlgorithm,
  toggleMute,
}: TheSoundOfSortingControlsProps): JSX.Element {
  const aboutDialogId = useId();

  const isSortingOrVerifying =
    status === SortingStatus.Sorting || status === SortingStatus.Verifying;

  const handleOnChangeMaxRange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxRange(+e.target.value);
  };

  const handleResetWithSameDataPattern = () => {
    reset(false);
  };

  const handleOnChangeAlgorithm = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    assertIsSortingAlgorithm(newAlgorithm);
    setNewSortingAlgorithm(newAlgorithm);
    handleResetWithSameDataPattern();
  };

  const handleOnChangeDataPattern = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDataPattern = e.target.value;
    assertIsDataPattern(newDataPattern);
    setNewDataPattern(newDataPattern);
  };

  const handleOnChangeDelay = (e: ChangeEvent<HTMLInputElement>) => {
    setNewDelay(+e.target.value);
  };

  const handleSortAgain = () => {
    handleResetWithSameDataPattern();
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

  const currentStrategy = SORTING_ALGORITHMS[sortingAlgorithm].strategy;

  const handleOnChangePivot = (e: ChangeEvent<HTMLSelectElement>) => {
    const { target } = e;
    const { value } = target;
    assertIsQuickSortPivot(value);
    setNewPivot(value);
    handleResetWithSameDataPattern();
  };

  return (
    <section className={styles.controlsContainer}>
      <div className={styles.inputsContainer}>
        <Select
          disabled={isSortingOrVerifying}
          label="Algorithm"
          options={SORTING_ALGORITHMS_OPTIONS}
          size="sm"
          value={sortingAlgorithm}
          handleOnSelectChange={handleOnChangeAlgorithm}
        />
        <Select
          disabled={isSortingOrVerifying}
          label="Data Pattern"
          options={DATA_PATTERN_OPTIONS}
          size="sm"
          value={dataPattern}
          handleOnSelectChange={handleOnChangeDataPattern}
        />
        <Select
          disabled={isSortingOrVerifying || !currentStrategy.requiresPivot}
          label="Pivot Rule"
          options={QUICK_SORT_PIVOTS_OPTIONS}
          size="sm"
          value={pivot}
          handleOnSelectChange={handleOnChangePivot}
        />
        <RangeInput
          disabled={isSortingOrVerifying}
          label="Array Size"
          max={1000}
          min={100}
          size="sm"
          step={100}
          value={maxRange}
          handleOnChangeInput={handleOnChangeMaxRange}
        />
        <RangeInput
          label="Delay"
          max={100}
          min={0}
          size="sm"
          step={10}
          value={delay}
          valuePostfix="ms"
          handleOnChangeInput={handleOnChangeDelay}
        />
      </div>
      <Divider />
      <div className={styles.buttonsContainer}>
        <Button
          fullWidth
          icon={primaryAction.icon}
          label={primaryAction.label}
          onClick={primaryAction.handler}
        />
        <Button
          disabled={status === SortingStatus.Finished || isSortingOrVerifying}
          fullWidth
          icon={<StepIcon />}
          label="Step"
          onClick={handleStep}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={soundAction.icon}
          label={soundAction.label}
          onClick={toggleMute}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={<ResetIcon />}
          label="Reset"
          onClick={handleResetWithSameDataPattern}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={<ShuffleIcon />}
          label="Shuffle"
          onClick={handleResetWithNewDataPattern}
          variant="secondary"
        />
        <Button
          command="show-modal"
          commandfor={aboutDialogId}
          fullWidth
          icon={<InfoIcon />}
          label="About"
          variant="secondary"
        />
      </div>
      <TheSoundOfSortingAboutDialog id={aboutDialogId} />
    </section>
  );
}

export default TheSoundOfSortingControls;
