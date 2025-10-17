import type { ReadonlyDeep } from 'type-fest';
import type { HeuristicsName } from './heuristics.ts';
import { START, type Vertex, WALL } from './vertex.ts';

type PathfindingAlgorithm = 'a-star' | 'bfs' | 'dijkstra' | 'gbfs';
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
  private isWithinBounds({
    col,
    gridCols,
    gridRows,
    row,
  }: {
    col: number;
    gridCols: number;
    gridRows: number;
    row: number;
  }): boolean {
    return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
  }

  private composeOrthogonalizedDirections({ row, col }: Step): Step[] {
    return [
      { row, col: 0 },
      { row: 0, col },
    ];
  }

  private shouldSkipDiagonalStep({
    dir,
    grid,
    vertex,
  }: {
    dir: Step;
    grid: Vertex[][];
    vertex: Vertex;
  }): boolean {
    const [o1, o2] = this.composeOrthogonalizedDirections(dir);
    const o1Row = vertex.row + o1.row;
    const o1Col = vertex.col + o1.col;
    if (
      !this.isWithinBounds({
        col: o1Col,
        gridCols: grid[0].length,
        gridRows: grid.length,
        row: o1Row,
      })
    ) {
      return true;
    }
    const o2Row = vertex.row + o2.row;
    const o2Col = vertex.col + o2.col;
    if (
      !this.isWithinBounds({
        col: o2Col,
        gridCols: grid[0].length,
        gridRows: grid.length,
        row: o2Row,
      })
    ) {
      return true;
    }
    if (grid[o1Row][o1Col].name === WALL && grid[o2Row][o2Col].name === WALL) {
      return true;
    }
    return false;
  }

  private isDiagonalMovement({
    col,
    row,
  }: {
    col: number;
    row: number;
  }): boolean {
    return Math.abs(row) === 1 && Math.abs(col) === 1;
  }

  public composeNeighbors({
    grid,
    isDiagonalAllowed,
    vertex,
  }: {
    grid: Vertex[][];
    isDiagonalAllowed: boolean;
    vertex: Vertex;
  }): Vertex[] {
    const directions: Step[] = [...OrthogonalCardinalDirections];
    if (isDiagonalAllowed) {
      directions.push(...DiagonalCardinalDirections);
    }
    const neighbors: Vertex[] = [];
    for (const dir of directions) {
      const dRow = vertex.row + dir.row;
      const dCol = vertex.col + dir.col;
      if (
        !this.isWithinBounds({
          col: dCol,
          gridCols: grid[0].length,
          gridRows: grid.length,
          row: dRow,
        })
      ) {
        continue;
      }
      const neighbor = grid[dRow][dCol];
      if (neighbor.name === WALL || neighbor.name === START) {
        continue;
      }
      if (
        this.isDiagonalMovement({
          col: dir.col,
          row: dir.row,
        }) &&
        this.shouldSkipDiagonalStep({
          dir,
          grid,
          vertex,
        })
      ) {
        continue;
      }
      neighbors.push(neighbor);
    }
    return neighbors;
  }

  public reconstructPath({
    end,
    previous,
    start,
  }: {
    end: Vertex;
    previous: Map<Vertex, Vertex | null>;
    start: Vertex;
  }): Vertex[] {
    const path: Vertex[] = [];
    let current: Vertex | null = end;
    do {
      path.unshift(current);
      current = previous.get(current) ?? null;
      if (current === null) {
        throw new Error('Current vertex is null, path reconstruction failed');
      }
    } while (!current.positionEquals(start));
    path.unshift(start);
    return path;
  }

  public abstract generator({
    end,
    grid,
    heuristicsName,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    heuristicsName?: HeuristicsName;
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[]>;
}

export { PathfindingStrategy, type PathfindingAlgorithm };
