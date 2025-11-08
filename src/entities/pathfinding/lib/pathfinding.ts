import { EMPTY, Vertex } from '../model/vertex.ts';

function composeNewRow(
  prevGrid: Vertex[][],
  row: number,
  cols: number,
): Vertex[] {
  const newRow: Vertex[] = [];
  for (let col = 0; col < cols; col += 1) {
    const prevVertex: Vertex | undefined = prevGrid[row]?.[col];
    if (prevVertex === undefined) {
      newRow.push(new Vertex(row, col, EMPTY));
    } else {
      newRow.push(prevVertex);
    }
  }
  return newRow;
}

function composeNewGrid(
  prevGrid: Vertex[][] | null,
  rows: number,
  cols: number,
): Vertex[][] {
  const newGrid: Vertex[][] = [];
  for (let row = 0; row < rows; row += 1) {
    if (prevGrid === null) {
      newGrid.push(composeNewRow([], row, cols));
      continue;
    }
    newGrid.push(composeNewRow(prevGrid, row, cols));
  }
  return newGrid;
}

export { composeNewGrid };
