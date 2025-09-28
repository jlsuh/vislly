import type { ReadonlyDeep } from 'type-fest';
import type { Vertex } from './vertex.ts';

const CHEBYSHEV_DISTANCE = 'chebyshevDistance';
const DIAGONAL_DISTANCE = 'diagonalDistance';
const EUCLIDEAN_DISTANCE = 'euclideanDistance';
const MANHATTAN_DISTANCE = 'manhattanDistance';
const OCTILE_DISTANCE = 'octileDistance';

type HeuristicsName =
  | typeof CHEBYSHEV_DISTANCE
  | typeof DIAGONAL_DISTANCE
  | typeof EUCLIDEAN_DISTANCE
  | typeof MANHATTAN_DISTANCE
  | typeof OCTILE_DISTANCE;

const HeuristicsNames: ReadonlyDeep<HeuristicsName[]> = [
  CHEBYSHEV_DISTANCE,
  DIAGONAL_DISTANCE,
  EUCLIDEAN_DISTANCE,
  MANHATTAN_DISTANCE,
  OCTILE_DISTANCE,
];

type HeuristicsFunction = (from: Vertex, to: Vertex) => number;

const Heuristics: ReadonlyDeep<Record<HeuristicsName, HeuristicsFunction>> = {
  chebyshevDistance: (from: Vertex, to: Vertex): number => {
    return Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));
  },
  diagonalDistance: (from: Vertex, to: Vertex): number => {
    const dx = Math.abs(to.row - from.row);
    const dy = Math.abs(to.col - from.col);
    const D = 1;
    const DPrime = Math.SQRT2;
    return D * Math.max(dx, dy) + (DPrime - D) * Math.min(dx, dy);
  },
  euclideanDistance: (from: Vertex, to: Vertex): number => {
    return Math.sqrt((to.row - from.row) ** 2 + (to.col - from.col) ** 2);
  },
  manhattanDistance: (from: Vertex, to: Vertex): number => {
    return Math.abs(to.row - from.row) + Math.abs(to.col - from.col);
  },
  octileDistance: (from: Vertex, to: Vertex): number => {
    const dx = Math.abs(to.row - from.row);
    const dy = Math.abs(to.col - from.col);
    return Math.max(dx, dy) + Math.SQRT2 * Math.min(dx, dy);
  },
};

function assertIsHeuristicsName(
  value: unknown,
): asserts value is HeuristicsName {
  if (typeof value !== 'string' || !Object.keys(Heuristics).includes(value)) {
    throw new Error(`Invalid heuristics name: ${value}`);
  }
}

const INITIAL_HEURISTICS: HeuristicsName = MANHATTAN_DISTANCE;

export {
  assertIsHeuristicsName,
  Heuristics,
  HeuristicsNames,
  INITIAL_HEURISTICS,
  type HeuristicsName,
};
