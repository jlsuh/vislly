import type { ReadonlyDeep } from 'type-fest';
import type { Vertex } from './vertex.ts';

type PathfindingAlgorithm = 'bfs';

abstract class PathfindingStrategy {
  private isWithinBounds(
    col: number,
    row: number,
    gridCols: number,
    gridRows: number,
  ): boolean {
    return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
  }

  public getNeighbors(grid: Vertex[][], vertex: Vertex): Vertex[] {
    const neighbors: Vertex[] = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ];
    for (const dir of directions) {
      const dRow = vertex.row + dir.row;
      const dCol = vertex.col + dir.col;
      if (this.isWithinBounds(dCol, dRow, grid[0].length, grid.length)) {
        const neighbor = grid[dRow][dCol];
        if (neighbor.name !== 'wall' && neighbor.name !== 'start') {
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
  ): Generator<Vertex, Vertex[]>;
}

class BfsStrategy extends PathfindingStrategy {
  public *generator(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
  ): Generator<Vertex, Vertex[]> {
    const queue: Vertex[] = [start];
    const visited: Set<Vertex> = new Set([start]);
    const previous: Map<Vertex, Vertex | null> = new Map(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    while (queue.length > 0) {
      const current =
        queue.shift() ??
        (() => {
          throw new Error('Queue is empty');
        })();
      for (const neighbor of super.getNeighbors(grid, current)) {
        if (visited.has(neighbor)) {
          continue;
        }
        previous.set(neighbor, current);
        if (neighbor.name === end.name) {
          return super.reconstructPath(previous, start, neighbor);
        }
        queue.push(neighbor);
        visited.add(neighbor);
        yield neighbor;
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
