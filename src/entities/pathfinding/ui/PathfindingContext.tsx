'use client';

import {
  type Context,
  createContext,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {
  type HeuristicsName,
  INITIAL_HEURISTICS,
} from '../model/heuristics.ts';
import { INITIAL_ALGORITHM } from '../model/pathfinding-algorithms.ts';
import type { PathfindingAlgorithm } from '../model/pathfinding-strategy.ts';
import {
  END,
  INITIAL_COORDINATE,
  START,
  type TerminalVertex,
  Vertex,
  type VertexName,
} from '../model/vertex.ts';

type PathfindingContextType = {
  cols: number;
  grid: Vertex[][];
  isAnimationRunning: boolean;
  isAnimationRunningRef: RefObject<boolean>;
  isDiagonalAllowed: boolean;
  lastGenerator: RefObject<Iterator<Vertex[], Vertex[], never> | null>;
  lastVisitedVertices: RefObject<Vertex[]>;
  rows: number;
  selectedAlgorithmName: PathfindingAlgorithm;
  selectedHeuristicsName: string;
  selectedVertexName: VertexName;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
  findPath: () => void;
  pausePathfind: () => void;
  resetPathfind: () => void;
  setCols: Dispatch<SetStateAction<number>>;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
  setIsAnimationRunning: Dispatch<SetStateAction<boolean>>;
  setIsDiagonalAllowed: Dispatch<SetStateAction<boolean>>;
  setRandomizedGrid: () => void;
  setRows: Dispatch<SetStateAction<number>>;
  setSelectedAlgorithmName: Dispatch<SetStateAction<PathfindingAlgorithm>>;
  setSelectedHeuristicsName: Dispatch<SetStateAction<HeuristicsName>>;
  setSelectedVertexName: Dispatch<SetStateAction<VertexName>>;
  stopPathfind: () => void;
};

const PathfindingContext: Context<PathfindingContextType> =
  createContext<PathfindingContextType>({
    cols: 0,
    grid: [],
    isAnimationRunning: false,
    isAnimationRunningRef: { current: false },
    isDiagonalAllowed: true,
    lastGenerator: { current: null },
    lastVisitedVertices: { current: [] },
    rows: 0,
    selectedAlgorithmName: INITIAL_ALGORITHM,
    selectedHeuristicsName: INITIAL_HEURISTICS,
    selectedVertexName: START,
    terminalVertices: {
      current: {
        start: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, START),
        end: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, END),
      },
    },
    findPath: () => {},
    pausePathfind: () => {},
    resetPathfind: () => {},
    setCols: () => {},
    setGrid: () => {},
    setIsAnimationRunning: () => {},
    setIsDiagonalAllowed: () => {},
    setRandomizedGrid: () => {},
    setRows: () => {},
    setSelectedAlgorithmName: () => {},
    setSelectedHeuristicsName: () => {},
    setSelectedVertexName: () => {},
    stopPathfind: () => {},
  });

export default PathfindingContext;
