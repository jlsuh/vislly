import { PriorityQueue } from '@/shared/lib/priority-queue.ts';
import { PathfindingStrategy } from './pathfinding-strategy';
import type { Vertex } from './vertex';

class DijkstraStrategy extends PathfindingStrategy {
  private processNeighbor({
    closed,
    current,
    distances,
    neighbor,
    open,
    parent,
  }: {
    closed: Set<Vertex>;
    current: Vertex;
    distances: Map<Vertex, number>;
    neighbor: Vertex;
    open: PriorityQueue<Vertex>;
    parent: Map<Vertex, Vertex | null>;
  }): void {
    if (closed.has(neighbor)) {
      return;
    }
    const newDistance = (distances.get(current) ?? Infinity) + neighbor.weight;
    if (newDistance < (distances.get(neighbor) ?? Infinity)) {
      distances.set(neighbor, newDistance);
      parent.set(neighbor, current);
      open.enqueue(neighbor, newDistance);
    }
  }

  public *generator({
    end,
    grid,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[]> {
    const open = new PriorityQueue<Vertex>([{ item: start, priority: 0 }]);
    const closed = new Set<Vertex>();
    const distances = new Map<Vertex, number>(
      grid.flatMap((row) => row.map((vertex) => [vertex, Infinity])),
    );
    const parent = new Map<Vertex, Vertex | null>(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    distances.set(start, 0);
    while (!open.empty()) {
      const current =
        open.dequeue() ??
        (() => {
          throw new Error('PriorityQueue is empty');
        })();
      closed.add(current);
      yield [...closed];
      if (current.positionEquals(end)) {
        return super.reconstructPath(parent, start, current);
      }
      const neighbors = super.composeNeighbors(
        grid,
        current,
        isDiagonalAllowed,
      );
      for (const neighbor of neighbors) {
        this.processNeighbor({
          closed,
          current,
          distances,
          neighbor,
          open,
          parent,
        });
      }
    }
    throw new Error('Dijkstra: No path found');
  }
}

export { DijkstraStrategy };
