import type { ReadonlyDeep } from 'type-fest';
import { Queue } from '@/shared/lib/queue.ts';
import { START, type Vertex, WALL } from './vertex.ts';

type PathfindingAlgorithm = 'bfs';
type Step = { row: number; col: number };

const OrthogonalCardinalDirections: ReadonlyDeep<Step[]> = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: -1 },
];
const DiagonalCardinalDirections: ReadonlyDeep<Step[]> = [
  { row: -1, col: -1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
  { row: -1, col: 1 },
];

abstract class PathfindingStrategy {
  private isWithinBounds(
    row: number,
    col: number,
    gridRows: number,
    gridCols: number,
  ): boolean {
    return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
  }

  private composeOrthogonalizedDirections(diagonalStep: Step): Step[] {
    const o1 = { row: diagonalStep.row, col: 0 };
    const o2 = { row: 0, col: diagonalStep.col };
    return [o1, o2];
  }

  private composeDiagonalDirectionsWithoutDiagonalWallJumps(
    grid: Vertex[][],
    vertex: Vertex,
  ): Step[] {
    const directions: Step[] = [];
    for (const diagonalDirection of DiagonalCardinalDirections) {
      const [o1, o2] = this.composeOrthogonalizedDirections(diagonalDirection);
      const dRow1 = vertex.row + o1.row;
      const dCol1 = vertex.col + o1.col;
      if (!this.isWithinBounds(dRow1, dCol1, grid.length, grid[0].length)) {
        continue;
      }
      const dRow2 = vertex.row + o2.row;
      const dCol2 = vertex.col + o2.col;
      if (!this.isWithinBounds(dRow2, dCol2, grid.length, grid[0].length)) {
        continue;
      }
      if (
        grid[dRow1][dCol1].name !== WALL &&
        grid[dRow2][dCol2].name !== WALL
      ) {
        directions.push(diagonalDirection);
      }
    }
    return directions;
  }

  public composeNeighbors(
    grid: Vertex[][],
    vertex: Vertex,
    isDiagonalAllowed: boolean,
  ): Vertex[] {
    const directions: Step[] = [...OrthogonalCardinalDirections];
    if (isDiagonalAllowed) {
      directions.push(
        ...this.composeDiagonalDirectionsWithoutDiagonalWallJumps(grid, vertex),
      );
    }
    const neighbors: Vertex[] = [];
    for (const dir of directions) {
      const dRow = vertex.row + dir.row;
      const dCol = vertex.col + dir.col;
      if (this.isWithinBounds(dRow, dCol, grid.length, grid[0].length)) {
        const neighbor = grid[dRow][dCol];
        if (neighbor.name !== WALL && neighbor.name !== START) {
          neighbors.push(neighbor);
        }
      }
    }
    return neighbors;
  }

  public reconstructPath(
    previous: Map<Vertex, Vertex | null>,
    start: Vertex,
    end: Vertex,
  ): Vertex[] {
    const path: Vertex[] = [];
    let current: Vertex | null = end;
    while (current !== start) {
      if (current === null) {
        throw new Error('Current vertex is null, path reconstruction failed');
      }
      path.unshift(current);
      current = previous.get(current) ?? null;
    }
    path.unshift(start);
    return path;
  }

  public abstract generator(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
    isDiagonalAllowed: boolean,
  ): Generator<Vertex[], Vertex[]>;
}

class BfsStrategy extends PathfindingStrategy {
  public *generator(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
    isDiagonalAllowed: boolean,
  ): Generator<Vertex[], Vertex[]> {
    const queue: Queue<Vertex> = new Queue([start]);
    const visited: Set<Vertex> = new Set([start]);
    const previous: Map<Vertex, Vertex | null> = new Map(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    while (!queue.empty()) {
      const current =
        queue.dequeue() ??
        (() => {
          throw new Error('Queue is empty');
        })();
      const neighbors = super.composeNeighbors(
        grid,
        current,
        isDiagonalAllowed,
      );
      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) {
          continue;
        }
        previous.set(neighbor, current);
        if (neighbor.name === end.name) {
          return super.reconstructPath(previous, start, neighbor);
        }
        queue.enqueue(neighbor);
        visited.add(neighbor);
        yield [...visited];
      }
    }
    throw new Error('BFS: No path found');
  }
}

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
};

export {
  assertIsPathfindingAlgorithm,
  PATHFINDING_ALGORITHMS,
  type PathfindingAlgorithm,
};
