'use client';

import { type ChangeEvent, type JSX, use } from 'react';
import { capitalizeFirstLetter } from '@/shared/lib/string.ts';
import Button from '@/shared/ui/Button/Button.tsx';
import Checkbox from '@/shared/ui/Checkbox/Checkbox.tsx';
import ClearPathIcon from '@/shared/ui/ClearPathIcon/ClearPathIcon.tsx';
import DiceFiveIcon from '@/shared/ui/DiceFiveIcon/DiceFiveIcon.tsx';
import Divider from '@/shared/ui/Divider/Divider.tsx';
import PauseIcon from '@/shared/ui/PauseIcon/PauseIcon.tsx';
import PlayIcon from '@/shared/ui/PlayIcon/PlayIcon.tsx';
import ResetIcon from '@/shared/ui/ResetIcon/ResetIcon.tsx';
import Select from '@/shared/ui/Select/Select.tsx';
import TerrainIcon from '@/shared/ui/TerrainIcon/TerrainIcon.tsx';
import {
  assertIsHeuristicsName,
  HeuristicsNames,
} from '../model/heuristics.ts';
import {
  assertIsPathfindingAlgorithm,
  PATHFINDING_ALGORITHMS,
} from '../model/pathfinding-algorithms.ts';
import { assertIsVertexName, VERTEX_NAMES } from '../model/vertex.ts';
import PathfindingContext from './PathfindingContext.tsx';
import styles from './pathfinding-controls.module.css';

const VERTEX_TYPE_OPTIONS = VERTEX_NAMES.map((vertexName) => ({
  value: vertexName,
  label: capitalizeFirstLetter(vertexName),
}));

const PATHFINDING_ALGORITHM_OPTIONS = Object.values(PATHFINDING_ALGORITHMS).map(
  ({ key }) => ({
    value: key,
    label: PATHFINDING_ALGORITHMS[key].label,
  }),
);

const HEURISTICS_OPTIONS = Object.values(HeuristicsNames).map((heuristics) => ({
  value: heuristics,
  label: capitalizeFirstLetter(heuristics),
}));

function PathfindingControls(): JSX.Element {
  const {
    isAnimationRunning,
    isDiagonalAllowed,
    selectedAlgorithmName,
    selectedHeuristicsName,
    selectedVertexName,
    composePerlinGrid,
    findPath,
    pausePathfind,
    resetGrid,
    resetPathfind,
    setIsDiagonalAllowed,
    setRandomizedGrid,
    setSelectedAlgorithmName,
    setSelectedHeuristicsName,
    setSelectedVertexName,
  } = use(PathfindingContext);

  const isHeuristicsDisabled =
    !PATHFINDING_ALGORITHMS[selectedAlgorithmName].withHeuristics;

  const mainButtonIcon = isAnimationRunning ? <PauseIcon /> : <PlayIcon />;
  const mainButtonLabel = isAnimationRunning ? 'Pause' : 'Play';
  const handleOnClickMainButton = isAnimationRunning ? pausePathfind : findPath;

  const handleOnChangeVertexType = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    assertIsVertexName(value);
    setSelectedVertexName(value);
  };

  const handleOnChangePathfindingAlgorithm = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = e.target;
    assertIsPathfindingAlgorithm(value);
    setSelectedAlgorithmName(value);
  };

  const handleOnChangeHeuristics = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    assertIsHeuristicsName(value);
    setSelectedHeuristicsName(value);
  };

  const handleOnChangeAllowDiagonalTraversal = (
    e: ChangeEvent<HTMLInputElement>,
  ) => setIsDiagonalAllowed(e.target.checked);

  return (
    <section className={styles.pathfindingControlsContainer}>
      <div className={styles.pathfindingSelectsContainer}>
        <Select
          handleOnSelectChange={handleOnChangeVertexType}
          label="Vertex type"
          options={VERTEX_TYPE_OPTIONS}
          value={selectedVertexName}
        />
        <Select
          handleOnSelectChange={handleOnChangePathfindingAlgorithm}
          label="Pathfinding algorithm"
          options={PATHFINDING_ALGORITHM_OPTIONS}
          value={selectedAlgorithmName}
        />
        <Select
          disabled={isHeuristicsDisabled}
          handleOnSelectChange={handleOnChangeHeuristics}
          label="Heuristics"
          options={HEURISTICS_OPTIONS}
          value={selectedHeuristicsName}
        />
      </div>
      <Divider />
      <div className={styles.checkboxContainer}>
        <Checkbox
          checked={isDiagonalAllowed}
          disabled={false}
          handleOnChangeCheckbox={handleOnChangeAllowDiagonalTraversal}
          label="Allow diagonal traversal"
        />
      </div>
      <Divider />
      <div className={styles.pathfindingButtonsContainer}>
        <Button
          fullWidth
          icon={mainButtonIcon}
          label={mainButtonLabel}
          onClick={handleOnClickMainButton}
        />
        <Button
          fullWidth
          icon={<ResetIcon />}
          label="Reset Grid"
          onClick={resetGrid}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={<ClearPathIcon />}
          label="Clear Pathfind"
          onClick={resetPathfind}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={<DiceFiveIcon />}
          label="Randomize Grid"
          onClick={setRandomizedGrid}
          variant="secondary"
        />
        <Button
          fullWidth
          icon={<TerrainIcon />}
          label="Generate Perlin Noise"
          onClick={composePerlinGrid}
          variant="secondary"
        />
      </div>
    </section>
  );
}

export default PathfindingControls;
