import type { Vertex } from './vertex.ts';

class BfsStrategy {
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

  public getNeighbors(grid: Vertex[][], vertex: Vertex): Vertex[] {
    const neighbors: Vertex[] = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ];
    for (const dir of directions) {
      const newRow = vertex.row + dir.row;
      const newCol = vertex.col + dir.col;
      if (
        newRow >= 0 &&
        newRow < grid.length &&
        newCol >= 0 &&
        newCol < grid[0].length
      ) {
        const neighbor = grid[newRow][newCol];
        if (neighbor.name !== 'wall' && neighbor.name !== 'start') {
          neighbors.push(neighbor);
        }
      }
    }
    return neighbors;
  }

  public *solve(
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
      for (const neighbor of this.getNeighbors(grid, current)) {
        if (!visited.has(neighbor)) {
          previous.set(neighbor, current);
          if (neighbor.name === end.name) {
            return this.reconstructPath(previous, start, neighbor);
          }
          queue.push(neighbor);
          visited.add(neighbor);
          yield neighbor;
        }
      }
    }
    throw new Error('No path found');
  }
}

export { BfsStrategy };
