'use client';

import {
  type JSX,
  type PropsWithChildren,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from 'react';
import { getElementByCoordinates } from '@/shared/lib/dom.ts';
import { xoshiro128ss } from '@/shared/lib/random.ts';
import { Rgba } from '@/shared/lib/rgba.ts';
import {
  type HeuristicsName,
  INITIAL_HEURISTICS,
} from '../model/heuristics.ts';
import {
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
} from '../model/pathfinding-algorithms.ts';
import type { PathfindingAlgorithm } from '../model/pathfinding-strategy.ts';
import {
  type IntersectionCoordinate,
  PerlinNoise,
} from '../model/perlin-noise.ts';
import {
  assertIsTerminalVertex,
  END,
  GRASS,
  GRAVEL,
  INITIAL_COORDINATE,
  INITIAL_VERTEX_NAME,
  NON_TERMINAL_VERTEX_NAMES,
  SAND,
  SNOW,
  START,
  STONE,
  type TerminalVertex,
  Vertex,
  type VertexName,
  WATER,
  WATER_DEEP,
} from '../model/vertex.ts';
import PathfindingContext from './PathfindingContext.tsx';

function composeRandomInitialVertexPosition(
  maxRows: number,
  maxCols: number,
  name: VertexName,
  vertexToSkip?: Vertex,
): Vertex {
  let row: number;
  let col: number;
  let vertex: Vertex;
  do {
    row = Math.floor(Math.random() * maxRows);
    col = Math.floor(Math.random() * maxCols);
    vertex = new Vertex(row, col, name);
  } while (vertexToSkip !== undefined && vertex.positionEquals(vertexToSkip));
  return vertex;
}

function appearsOnGrid(
  initialVertices: Record<TerminalVertex, Vertex>,
): boolean {
  for (const vertex of Object.values(initialVertices)) {
    if (!vertex.appearsOnGrid()) {
      console.info(`${vertex.name} vertex not found`);
      return false;
    }
  }
  return true;
}

function hasChangedOriginalPosition(
  initialVertices: Record<TerminalVertex, Vertex>,
  currentTerminalVertices: RefObject<Record<TerminalVertex, Vertex>>,
): boolean {
  for (const terminalVertex of Object.values(currentTerminalVertices.current)) {
    const name = terminalVertex.name;
    assertIsTerminalVertex(name);
    if (!terminalVertex.positionEquals(initialVertices[name])) {
      console.info(`${name} vertex has changed position`);
      return true;
    }
  }
  return false;
}

function getAssociatedDiv(row: number, col: number): Element {
  const element = getElementByCoordinates(row, col);
  const associatedDiv = element.firstElementChild;
  if (associatedDiv === null) {
    throw new Error(
      `Associated div not found for coordinates (${row}, ${col})`,
    );
  }
  return associatedDiv;
}

function setButtonBackground(
  row: number,
  col: number,
  backgroundColor: string,
): void {
  const associatedDiv = getAssociatedDiv(row, col);
  associatedDiv.setAttribute('style', `background-color: ${backgroundColor};`);
}

function removeButtonBackground(row: number, col: number): void {
  const associatedDiv = getAssociatedDiv(row, col);
  associatedDiv.removeAttribute('style');
}

function resetButtonStyles(vertices: Vertex[]): void {
  for (const vertex of vertices) {
    removeButtonBackground(vertex.row, vertex.col);
  }
}

function composeNoiseScale(cols: number, rows: number): number {
  const ratio = cols / rows;
  if (ratio <= 1) {
    return 3 * ratio;
  } else {
    return 4 - rows / cols;
  }
}

function composePerlinNoise(
  cols: number,
  rows: number,
): {
  values: Record<IntersectionCoordinate, number>;
  min: number;
  max: number;
} {
  const perlin = new PerlinNoise();
  const noiseScale = composeNoiseScale(cols, rows);
  const seedX = xoshiro128ss()();
  const seedY = xoshiro128ss()();
  const values: Record<IntersectionCoordinate, number> = {};
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const normalizedX = col / cols;
      const normalizedY = row / rows;
      const x = normalizedX * noiseScale + seedX;
      const y = normalizedY * noiseScale + seedY;
      const intensity = perlin.get(x, y);
      values[`${row},${col}`] = intensity;
      if (intensity < min) min = intensity;
      if (intensity > max) max = intensity;
    }
  }
  return { values, min, max };
}

function composePerlinNoiseGrid(cols: number, rows: number): Vertex[][] {
  const { values, min, max } = composePerlinNoise(cols, rows);
  const perlinNoiseGrid: Vertex[][] = [];
  for (let row = 0; row < rows; row += 1) {
    const newRow: Vertex[] = [];
    for (let col = 0; col < cols; col += 1) {
      const intensity = values[`${row},${col}`];
      const numerator = intensity - min;
      const denominator = max - min || 1;
      const normalizedIntensity = numerator / denominator;
      const vertexName = mapIntensityToVertexName(normalizedIntensity);
      newRow.push(new Vertex(row, col, vertexName));
    }
    perlinNoiseGrid.push(newRow);
  }
  return perlinNoiseGrid;
}

function mapIntensityToVertexName(intensity: number): VertexName {
  if (intensity < 0.1) {
    return WATER_DEEP;
  } else if (intensity < 0.25) {
    return WATER;
  } else if (intensity < 0.4) {
    return SAND;
  } else if (intensity < 0.7) {
    return GRASS;
  } else if (intensity < 0.85) {
    return STONE;
  } else if (intensity < 0.95) {
    return GRAVEL;
  } else {
    return SNOW;
  }
}

const ANIMATION_DELAY = 5;
const PATH: string = new Rgba(
  0.996_078_431_372_549,
  0.949_019_607_843_137_2,
  0.313_725_490_196_078_4,
  0.75,
).toStyle();
const VISITED: string = new Rgba(
  0.686_274_509_803_921_6,
  0.933_333_333_333_333_3,
  0.933_333_333_333_333_3,
  0.6,
).toStyle();

type PathfindingProviderProps = PropsWithChildren;

function PathfindingProvider({
  children,
}: PathfindingProviderProps): JSX.Element {
  const [cols, setCols] = useState(0);
  const [grid, setGrid] = useState<Vertex[][]>([]);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [rows, setRows] = useState(0);
  const [selectedVertexName, setSelectedVertexName] =
    useState<VertexName>(INITIAL_VERTEX_NAME);
  const [selectedAlgorithmName, setSelectedAlgorithmName] =
    useState<PathfindingAlgorithm>(INITIAL_ALGORITHM);
  const [isDiagonalAllowed, setIsDiagonalAllowed] = useState(true);
  const [selectedHeuristicsName, setSelectedHeuristicsName] =
    useState<HeuristicsName>(INITIAL_HEURISTICS);

  const isAnimationRunningRef = useRef(false);
  const lastGenerator = useRef<Iterator<Vertex[], Vertex[], never>>(null);
  const lastVisitedVertices = useRef<Vertex[]>([]);
  const terminalVertices = useRef<Record<TerminalVertex, Vertex>>({
    start: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, START),
    end: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, END),
  });

  const pausePathfind = useCallback((): void => {
    isAnimationRunningRef.current = false;
    setIsAnimationRunning(false);
  }, []);

  const stopPathfind = useCallback((): void => {
    pausePathfind();
    lastGenerator.current = null;
  }, [pausePathfind]);

  const resetPathfind = useCallback((): void => {
    stopPathfind();
    resetButtonStyles(lastVisitedVertices.current);
    lastVisitedVertices.current = [];
  }, [stopPathfind]);

  const composeRandomizedGrid = (): {
    newGrid: Vertex[][];
    startVertexPosition: Vertex;
    endVertexPosition: Vertex;
  } => {
    const newGrid: Vertex[][] = [];
    for (let row = 0; row < rows; row += 1) {
      const newRow: Vertex[] = [];
      for (let col = 0; col < cols; col += 1) {
        const randomName =
          NON_TERMINAL_VERTEX_NAMES[
            Math.floor(Math.random() * NON_TERMINAL_VERTEX_NAMES.length)
          ];
        newRow.push(new Vertex(row, col, randomName));
      }
      newGrid.push(newRow);
    }
    const startVertexPosition = composeRandomInitialVertexPosition(
      rows,
      cols,
      START,
    );
    const endVertexPosition = composeRandomInitialVertexPosition(
      rows,
      cols,
      END,
      startVertexPosition,
    );
    newGrid[startVertexPosition.row][startVertexPosition.col] =
      startVertexPosition;
    newGrid[endVertexPosition.row][endVertexPosition.col] = endVertexPosition;
    return {
      newGrid,
      startVertexPosition,
      endVertexPosition,
    };
  };

  const setRandomizedGrid = (): void => {
    resetPathfind();
    const { newGrid, startVertexPosition, endVertexPosition } =
      composeRandomizedGrid();
    terminalVertices.current = {
      start: startVertexPosition,
      end: endVertexPosition,
    };
    setGrid(newGrid);
  };

  function handlePathfindingFrame(intervalId: number): void {
    let it: IteratorResult<Vertex[], Vertex[]>;
    try {
      if (lastGenerator.current === null) {
        throw new Error('Generator not initialized');
      }
      it = lastGenerator.current.next();
    } catch (error) {
      console.info('Error during Pathfinding:', error);
      stopPathfind();
      window.clearInterval(intervalId);
      return;
    }
    const { done, value } = it;
    const lastVisited = value.at(-1);
    if (lastVisited === undefined) {
      throw new Error('Last visited vertex is undefined');
    }
    if (!done) {
      try {
        setButtonBackground(lastVisited.row, lastVisited.col, VISITED);
      } catch (_) {
        console.info('Skipping setting background for', lastVisited);
        stopPathfind();
        window.clearInterval(intervalId);
        return;
      }
      lastVisitedVertices.current = value;
      return;
    }
    const pathWithoutTerminals = value.slice(1, -1);
    for (const vertex of pathWithoutTerminals) {
      setButtonBackground(vertex.row, vertex.col, PATH);
    }
    stopPathfind();
    window.clearInterval(intervalId);
  }

  function update(
    initialVertices: Record<TerminalVertex, Vertex>,
    intervalId: number,
  ): void {
    if (hasChangedOriginalPosition(initialVertices, terminalVertices)) {
      resetPathfind();
      window.clearInterval(intervalId);
      return;
    }
    if (!isAnimationRunningRef.current) {
      window.clearInterval(intervalId);
      return;
    }
    if (lastGenerator.current === null) {
      const { strategy } = PATHFINDING_ALGORITHMS[selectedAlgorithmName];
      const generator = strategy.generator({
        end: terminalVertices.current.end,
        grid,
        heuristicsName: selectedHeuristicsName,
        isDiagonalAllowed,
        start: terminalVertices.current.start,
      });
      lastGenerator.current = generator;
    }
    handlePathfindingFrame(intervalId);
  }

  const findPath = (): void => {
    const initialVertices = terminalVertices.current;
    if (!appearsOnGrid(initialVertices)) {
      return;
    }
    if (lastGenerator.current === null && !isAnimationRunningRef.current) {
      resetButtonStyles(lastVisitedVertices.current);
    }
    setIsAnimationRunning(true);
    isAnimationRunningRef.current = true;
    const intervalId = window.setInterval(
      () => update(initialVertices, intervalId),
      ANIMATION_DELAY,
    );
  };

  const composePerlinGrid = () => {
    const perlinNoiseGrid = composePerlinNoiseGrid(cols, rows);
    const startVertexPosition = composeRandomInitialVertexPosition(
      rows,
      cols,
      START,
    );
    const endVertexPosition = composeRandomInitialVertexPosition(
      rows,
      cols,
      END,
      startVertexPosition,
    );
    perlinNoiseGrid[startVertexPosition.row][startVertexPosition.col] =
      startVertexPosition;
    perlinNoiseGrid[endVertexPosition.row][endVertexPosition.col] =
      endVertexPosition;
    terminalVertices.current = {
      start: startVertexPosition,
      end: endVertexPosition,
    };
    resetPathfind();
    setGrid(perlinNoiseGrid);
  };

  return (
    <PathfindingContext
      value={{
        cols,
        grid,
        isAnimationRunning,
        isDiagonalAllowed,
        lastVisitedVertices,
        rows,
        selectedAlgorithmName,
        selectedHeuristicsName,
        selectedVertexName,
        terminalVertices,
        composePerlinGrid,
        findPath,
        pausePathfind,
        resetPathfind,
        setCols,
        setGrid,
        setIsDiagonalAllowed,
        setRandomizedGrid,
        setRows,
        setSelectedAlgorithmName,
        setSelectedHeuristicsName,
        setSelectedVertexName,
      }}
    >
      {children}
    </PathfindingContext>
  );
}

export default PathfindingProvider;
