import { Queue } from '@/shared/lib/queue.ts';
import { PathfindingStrategy } from './pathfinding-strategy.ts';
import type { Vertex } from './vertex.ts';

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

export { BfsStrategy };
