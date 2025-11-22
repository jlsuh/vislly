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
import {
  INITIAL_ALGORITHM,
  type PathfindingAlgorithm,
} from '../model/pathfinding-algorithms.ts';
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
  isDiagonalAllowed: boolean;
  lastVisitedVertices: RefObject<Vertex[]>;
  rows: number;
  selectedAlgorithmName: PathfindingAlgorithm;
  selectedHeuristicsName: string;
  selectedVertexName: VertexName;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
  composePerlinGrid: () => void;
  findPath: () => void;
  pausePathfind: () => void;
  resetGrid: () => void;
  resetPathfind: () => void;
  setCols: Dispatch<SetStateAction<number>>;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
  setIsDiagonalAllowed: Dispatch<SetStateAction<boolean>>;
  setRandomizedGrid: () => void;
  setRows: Dispatch<SetStateAction<number>>;
  setSelectedAlgorithmName: Dispatch<SetStateAction<PathfindingAlgorithm>>;
  setSelectedHeuristicsName: Dispatch<SetStateAction<HeuristicsName>>;
  setSelectedVertexName: Dispatch<SetStateAction<VertexName>>;
};

const PathfindingContext: Context<PathfindingContextType> =
  createContext<PathfindingContextType>({
    cols: 0,
    grid: [],
    isAnimationRunning: false,
    isDiagonalAllowed: true,
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
    composePerlinGrid: () => {},
    findPath: () => {},
    pausePathfind: () => {},
    resetGrid: () => {},
    resetPathfind: () => {},
    setCols: () => {},
    setGrid: () => {},
    setIsDiagonalAllowed: () => {},
    setRandomizedGrid: () => {},
    setRows: () => {},
    setSelectedAlgorithmName: () => {},
    setSelectedHeuristicsName: () => {},
    setSelectedVertexName: () => {},
  });

export default PathfindingContext;
