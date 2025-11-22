import type { ReadonlyDeep } from 'type-fest';
import { AStarStrategy } from './a-star-strategy.ts';
import { BfsStrategy } from './bfs-strategy.ts';
import { DfsStrategy } from './dfs-strategy.ts';
import { DijkstraStrategy } from './dijkstra-strategy.ts';
import { GreedyBestFirstSearchStrategy } from './gbfs-strategy.ts';
import type { PathfindingStrategy } from './pathfinding-strategy.ts';

type PathfindingAlgorithm = 'a-star' | 'bfs' | 'dfs' | 'dijkstra' | 'gbfs';

function assertIsPathfindingAlgorithm(
  value: unknown,
): asserts value is PathfindingAlgorithm {
  if (
    typeof value !== 'string' ||
    !Object.keys(PATHFINDING_ALGORITHMS).includes(value)
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
  'a-star': {
    key: 'a-star',
    strategy: new AStarStrategy(),
    label: 'A*',
    withHeuristics: true,
  },
  bfs: {
    key: 'bfs',
    strategy: new BfsStrategy(),
    label: 'Breadth-First Search',
    withHeuristics: false,
  },
  dfs: {
    key: 'dfs',
    strategy: new DfsStrategy(),
    label: 'Depth-First Search',
    withHeuristics: false,
  },
  dijkstra: {
    key: 'dijkstra',
    strategy: new DijkstraStrategy(),
    label: 'Dijkstra',
    withHeuristics: false,
  },
  gbfs: {
    key: 'gbfs',
    strategy: new GreedyBestFirstSearchStrategy(),
    label: 'Greedy Best-First Search',
    withHeuristics: true,
  },
};

const INITIAL_ALGORITHM: PathfindingAlgorithm = 'a-star';

export {
  assertIsPathfindingAlgorithm,
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
  type PathfindingAlgorithm,
};
