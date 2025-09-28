import type { ReadonlyDeep } from 'type-fest';
import { AStarStrategy } from './a-star-strategy.ts';
import { BfsStrategy } from './bfs-strategy.ts';
import { DijkstraStrategy } from './dijkstra-strategy.ts';
import type {
  PathfindingAlgorithm,
  PathfindingStrategy,
} from './pathfinding-strategy.ts';

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
      strategy: PathfindingStrategy;
      label: PathfindingAlgorithm;
      withHeuristics: boolean;
    }
  >
> = {
  'a-star': {
    strategy: new AStarStrategy(),
    label: 'a-star',
    withHeuristics: true,
  },
  bfs: { strategy: new BfsStrategy(), label: 'bfs', withHeuristics: false },
  dijkstra: {
    strategy: new DijkstraStrategy(),
    label: 'dijkstra',
    withHeuristics: false,
  },
};

const INITIAL_ALGORITHM = 'bfs';

export {
  assertIsPathfindingAlgorithm,
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
};
