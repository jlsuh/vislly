import { type JSX, type MouseEvent, type RefObject, useState } from 'react';
import {
  EMPTY,
  INITIAL_COORDINATE,
  isTerminalVertex,
  type TerminalVertex,
  Vertex,
  type VertexName,
} from '../model/vertex.ts';
import styles from './cell.module.css';
import getElementByCoordinates from './getElementByCoordinates.ts';

function setButtonStyle(vertex: Vertex): void {
  const { row, col, name } = vertex;
  const element = getElementByCoordinates(row, col);
  element.className = `${styles.cell} ${styles[name]}`;
}

function Cell({
  grid,
  gridCell,
  lastVisitedVertices,
  reset,
  selectedVertexName,
  terminalVertices,
}: {
  grid: Vertex[][];
  gridCell: Vertex;
  lastVisitedVertices: RefObject<Vertex[]>;
  reset: () => void;
  selectedVertexName: VertexName;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
}): JSX.Element {
  const [cell, setCell] = useState(gridCell);
  const { row: cellRow, col: cellCol } = gridCell;

  const setNewVertexName = (newVertexName: VertexName): void => {
    if (lastVisitedVertices.current.length > 0) {
      reset();
    }
    const targetVertexName = grid[cellRow][cellCol].name;
    if (isTerminalVertex(targetVertexName)) {
      terminalVertices.current[targetVertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        targetVertexName,
      );
    }
    if (isTerminalVertex(newVertexName)) {
      const terminalVertex = terminalVertices.current[newVertexName];
      if (terminalVertex.appearsOnGrid()) {
        const { row: terminalVertexRow, col: terminalVertexCol } =
          terminalVertex;
        const newEmptyVertex = new Vertex(
          terminalVertexRow,
          terminalVertexCol,
          EMPTY,
        );
        grid[terminalVertexRow][terminalVertexCol] = newEmptyVertex;
        setButtonStyle(newEmptyVertex);
      }
      const newterminalVertices = {
        ...terminalVertices.current,
      };
      newterminalVertices[newVertexName] = new Vertex(
        cellRow,
        cellCol,
        newVertexName,
      );
      setButtonStyle(newterminalVertices[newVertexName]);
      terminalVertices.current = newterminalVertices;
    }
    grid[cellRow][cellCol] = new Vertex(cellRow, cellCol, newVertexName);
    setCell(grid[cellRow][cellCol].deepCopy());
  };

  return (
    <button
      className={`${styles.cell} ${styles[cell.name]}`}
      data-col={cellCol}
      data-row={cellRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>) => e.preventDefault()}
      onMouseDown={() => setNewVertexName(selectedVertexName)}
      onTouchStart={() => setNewVertexName(selectedVertexName)}
      type="button"
    />
  );
}

export default Cell;
