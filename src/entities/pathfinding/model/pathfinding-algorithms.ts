import type { ReadonlyDeep } from 'type-fest';
import { AStarStrategy } from './a-star-strategy.ts';
import { BfsStrategy } from './bfs-strategy.ts';
import { DfsStrategy } from './dfs-strategy.ts';
import { DijkstraStrategy } from './dijkstra-strategy.ts';
import { GreedyBestFirstSearchStrategy } from './gbfs-strategy.ts';
import type { PathfindingStrategy } from './pathfinding-strategy.ts';

const PathfindingAlgorithm = {
  AStar: 'a-star',
  Bfs: 'bfs',
  Dfs: 'dfs',
  Dijkstra: 'dijkstra',
  Gbfs: 'gbfs',
} as const;

type PathfindingAlgorithm =
  (typeof PathfindingAlgorithm)[keyof typeof PathfindingAlgorithm];

function assertIsPathfindingAlgorithm(
  value: unknown,
): asserts value is PathfindingAlgorithm {
  if (
    typeof value !== 'string' ||
    !Object.values(PathfindingAlgorithm).includes(value as PathfindingAlgorithm)
  ) {
    throw new Error(`Invalid pathfinding algorithm: ${value}`);
  }
}

const PATHFINDING_ALGORITHMS: ReadonlyDeep<
  Record<
    PathfindingAlgorithm,
    {
      key: PathfindingAlgorithm;
      strategy: PathfindingStrategy;
      label: string;
      withHeuristics: boolean;
    }
  >
> = {
  [PathfindingAlgorithm.AStar]: {
    key: PathfindingAlgorithm.AStar,
    strategy: new AStarStrategy(),
    label: 'A*',
    withHeuristics: true,
  },
  [PathfindingAlgorithm.Bfs]: {
    key: PathfindingAlgorithm.Bfs,
    strategy: new BfsStrategy(),
    label: 'Breadth-First Search',
    withHeuristics: false,
  },
  [PathfindingAlgorithm.Dfs]: {
    key: PathfindingAlgorithm.Dfs,
    strategy: new DfsStrategy(),
    label: 'Depth-First Search',
    withHeuristics: false,
  },
  [PathfindingAlgorithm.Dijkstra]: {
    key: PathfindingAlgorithm.Dijkstra,
    strategy: new DijkstraStrategy(),
    label: 'Dijkstra',
    withHeuristics: false,
  },
  [PathfindingAlgorithm.Gbfs]: {
    key: PathfindingAlgorithm.Gbfs,
    strategy: new GreedyBestFirstSearchStrategy(),
    label: 'Greedy Best-First Search',
    withHeuristics: true,
  },
};

const INITIAL_ALGORITHM: PathfindingAlgorithm = PathfindingAlgorithm.AStar;

export {
  assertIsPathfindingAlgorithm,
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
  PathfindingAlgorithm,
};
