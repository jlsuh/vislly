import type { ReadonlyDeep } from 'type-fest';
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
    { strategy: PathfindingStrategy; label: PathfindingAlgorithm }
  >
> = {
  bfs: { strategy: new BfsStrategy(), label: 'bfs' },
  dijkstra: { strategy: new DijkstraStrategy(), label: 'dijkstra' },
};

const INITIAL_ALGORITHM = 'bfs';

export {
  assertIsPathfindingAlgorithm,
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
};
