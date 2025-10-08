'use client';

import { type ChangeEvent, type JSX, use } from 'react';
import { capitalizeFirstLetter } from '@/shared/lib/strings.ts';
import Button from '@/shared/ui/Button/Button.tsx';
import Checkbox from '@/shared/ui/Checkbox/Checkbox.tsx';
import ClearPathIcon from '@/shared/ui/ClearPathIcon/ClearPathIcon.tsx';
import DiceFiveIcon from '@/shared/ui/DiceFiveIcon/DiceFiveIcon.tsx';
import { Divider } from '@/shared/ui/Divider/Divider.tsx';
import PauseIcon from '@/shared/ui/PauseIcon/PauseIcon.tsx';
import PlayIcon from '@/shared/ui/PlayIcon/PlayIcon.tsx';
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

export default function PathfindingControls(): JSX.Element {
  const {
    isAnimationRunning,
    isDiagonalAllowed,
    selectedAlgorithmName,
    selectedHeuristicsName,
    selectedVertexName,
    findPath,
    generatePerlinGrid,
    pausePathfind,
    resetPathfind,
    setIsDiagonalAllowed,
    setRandomizedGrid,
    setSelectedAlgorithmName,
    setSelectedHeuristicsName,
    setSelectedVertexName,
  } = use(PathfindingContext);

  return (
    <section className={styles.pathfindingControlsContainer}>
      <div className={styles.pathfindingSelectsContainer}>
        <Select
          handleOnSelectChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const { value } = e.target;
            assertIsVertexName(value);
            setSelectedVertexName(value);
          }}
          label="Vertex type"
          options={VERTEX_NAMES.map((vertexName) => ({
            value: vertexName,
            label: capitalizeFirstLetter(vertexName),
          }))}
          value={selectedVertexName}
        />
        <Select
          handleOnSelectChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const { value } = e.target;
            assertIsPathfindingAlgorithm(value);
            setSelectedAlgorithmName(value);
          }}
          label="Pathfinding algorithm"
          options={Object.values(PATHFINDING_ALGORITHMS).map(({ key }) => ({
            value: key,
            label: PATHFINDING_ALGORITHMS[key].label,
          }))}
          value={selectedAlgorithmName}
        />
        <Select
          disabled={
            !PATHFINDING_ALGORITHMS[selectedAlgorithmName].withHeuristics
          }
          handleOnSelectChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const { value } = e.target;
            assertIsHeuristicsName(value);
            setSelectedHeuristicsName(value);
          }}
          label="Heuristics"
          options={Object.values(HeuristicsNames).map((heuristics) => ({
            value: heuristics,
            label: capitalizeFirstLetter(heuristics),
          }))}
          value={selectedHeuristicsName}
        />
      </div>
      <Divider />
      <div className={styles.checkboxContainer}>
        <Checkbox
          checked={isDiagonalAllowed}
          disabled={false}
          handleOnChangeCheckbox={(e: ChangeEvent<HTMLInputElement>) =>
            setIsDiagonalAllowed(e.target.checked)
          }
          label="Allow diagonal traversal"
        />
      </div>
      <Divider />
      <div className={styles.pathfindingButtonsContainer}>
        <Button
          fullWidth
          handleOnClickButton={isAnimationRunning ? pausePathfind : findPath}
          icon={isAnimationRunning ? <PauseIcon /> : <PlayIcon />}
          label={isAnimationRunning ? 'Pause' : 'Play'}
        />
        <Button
          fullWidth
          handleOnClickButton={resetPathfind}
          icon={<ClearPathIcon />}
          label="Clear Pathfind"
        />
        <Button
          fullWidth
          handleOnClickButton={setRandomizedGrid}
          icon={<DiceFiveIcon />}
          label="Randomize Grid"
        />
        <Button
          fullWidth
          handleOnClickButton={generatePerlinGrid}
          icon={<TerrainIcon />}
          label="Generate Perlin Noise"
        />
      </div>
    </section>
  );
}
