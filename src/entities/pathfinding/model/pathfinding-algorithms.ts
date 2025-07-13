import type { Vertex } from './vertex.ts';

class BfsStrategy {
  public reconstructPath(
    previous: Map<Vertex, Vertex | null>,
    start: Vertex,
    end: Vertex,
  ): Vertex[] {
    console.log('>>>>> previous:', previous);
    const path: Vertex[] = [];
    let current: Vertex | null = end;
    while (current !== start) {
      console.log('>>>>> current:', current);
      if (current === null) {
        throw new Error('No path found');
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
        if (neighbor.name !== 'wall') {
          neighbors.push(neighbor);
        }
      }
    }
    return neighbors;
  }

  public solve(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
  ): [Vertex[], Set<Vertex>] {
    const queue: Vertex[] = [start];
    const visited: Set<Vertex> = new Set();
    const previous: Map<Vertex, Vertex | null> = new Map();

    for (const row of grid) {
      for (const vertex of row) {
        previous.set(vertex, null);
      }
    }

    visited.add(start);

    while (queue.length > 0) {
      const current =
        queue.shift() ??
        (() => {
          throw new Error('Queue is empty');
        })();

      for (const neighbor of this.getNeighbors(grid, current)) {
        if (!visited.has(neighbor)) {
          if (neighbor.name === end.name) {
            previous.set(neighbor, current);
            return [this.reconstructPath(previous, start, neighbor), visited];
          }
          queue.push(neighbor);
          visited.add(neighbor);
          previous.set(neighbor, current);
        }
      }
    }

    return [[], visited];
  }
}

export { BfsStrategy };
