import { PathfindingStrategy } from './pathfinding-strategy.ts';
import type { Vertex } from './vertex.ts';

class DfsStrategy extends PathfindingStrategy {
  private processNeighbor({
    closed,
    current,
    neighbor,
    open,
    parent,
  }: {
    closed: Set<Vertex>;
    current: Vertex;
    neighbor: Vertex;
    open: Vertex[];
    parent: Map<Vertex, Vertex | null>;
  }): void {
    if (!closed.has(neighbor)) {
      parent.set(neighbor, current);
      open.push(neighbor);
    }
  }

  public override *generator({
    end,
    grid,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[], unknown> {
    const open: Vertex[] = [start];
    const closed: Set<Vertex> = new Set<Vertex>();
    const parent = new Map<Vertex, Vertex | null>(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    while (open.length > 0) {
      const current =
        open.pop() ??
        (() => {
          throw new Error('Stack is empty');
        })();
      if (closed.has(current)) {
        continue;
      }
      closed.add(current);
      yield [...closed];
      if (current.positionEquals(end)) {
        return super.reconstructPath({
          end: current,
          previous: parent,
          start,
        });
      }
      const neighbors = super.composeNeighbors({
        grid,
        isDiagonalAllowed,
        vertex: current,
      });
      for (let i = neighbors.length - 1; i >= 0; i -= 1) {
        const neighbor = neighbors[i];
        this.processNeighbor({
          closed,
          current,
          neighbor,
          open,
          parent,
        });
      }
    }
    throw new Error('DFS: No path found');
  }
}

export { DfsStrategy };
