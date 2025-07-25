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

  private composeOrthogonalizedDirections({ row, col }: Step): Step[] {
    return [
      { row, col: 0 },
      { row: 0, col },
    ];
  }

  private shouldSkipDiagonalStep(
    grid: Vertex[][],
    vertex: Vertex,
    dir: Step,
  ): boolean {
    const [o1, o2] = this.composeOrthogonalizedDirections(dir);
    const o1Row = vertex.row + o1.row;
    const o1Col = vertex.col + o1.col;
    if (!this.isWithinBounds(o1Row, o1Col, grid.length, grid[0].length)) {
      return true;
    }
    const o2Row = vertex.row + o2.row;
    const o2Col = vertex.col + o2.col;
    if (!this.isWithinBounds(o2Row, o2Col, grid.length, grid[0].length)) {
      return true;
    }
    if (grid[o1Row][o1Col].name === WALL && grid[o2Row][o2Col].name === WALL) {
      return true;
    }
    return false;
  }

  private isDiagonalMovement(row: number, col: number): boolean {
    return Math.abs(row) === 1 && Math.abs(col) === 1;
  }

  public composeNeighbors(
    grid: Vertex[][],
    vertex: Vertex,
    isDiagonalAllowed: boolean,
  ): Vertex[] {
    const directions: Step[] = [...OrthogonalCardinalDirections];
    if (isDiagonalAllowed) {
      directions.push(...DiagonalCardinalDirections);
    }
    const neighbors: Vertex[] = [];
    for (const dir of directions) {
      const dRow = vertex.row + dir.row;
      const dCol = vertex.col + dir.col;
      if (!this.isWithinBounds(dRow, dCol, grid.length, grid[0].length)) {
        continue;
      }
      const neighbor = grid[dRow][dCol];
      if (neighbor.name === WALL || neighbor.name === START) {
        continue;
      }
      if (
        this.isDiagonalMovement(dir.row, dir.col) &&
        this.shouldSkipDiagonalStep(grid, vertex, dir)
      ) {
        continue;
      }
      neighbors.push(neighbor);
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
