import {
  type Dispatch,
  type JSX,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  useState,
} from 'react';
import {
  EMPTY,
  INITIAL_COORDINATE,
  isTerminalVertex,
  type TerminalVertex,
  Vertex,
  type VertexName,
} from '../model/vertex.ts';
import styles from './cell.module.css';

function setParagraphStyle(vertex: Vertex): void {
  const { row, col, name } = vertex;
  const element = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  if (element === null) {
    return;
  }
  const paragraph = element.querySelector('p');
  if (paragraph === null) {
    return;
  }
  paragraph.className = `${styles.cellText} ${styles[name]}`;
  paragraph.textContent = vertex.firstChar;
}

function Cell({
  grid,
  gridCell,
  lastVisitedVertices,
  reset,
  selectedVertexName,
  setGrid,
  terminalVertices,
}: {
  grid: Vertex[][];
  gridCell: Vertex;
  lastVisitedVertices: RefObject<Vertex[]>;
  reset: () => void;
  selectedVertexName: VertexName;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
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
        setParagraphStyle(newEmptyVertex);
      }
      const newterminalVertices = {
        ...terminalVertices.current,
      };
      newterminalVertices[newVertexName] = new Vertex(
        cellRow,
        cellCol,
        newVertexName,
      );
      setParagraphStyle(newterminalVertices[newVertexName]);
      terminalVertices.current = newterminalVertices;
    }
    grid[cellRow][cellCol] = new Vertex(cellRow, cellCol, newVertexName);
    setGrid(grid);
    setCell(grid[cellRow][cellCol].deepCopy());
  };

  return (
    <button
      className={styles.cell}
      data-col={cellCol}
      data-row={cellRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>) => e.preventDefault()}
      onMouseDown={() => setNewVertexName(selectedVertexName)}
      onTouchStart={() => setNewVertexName(selectedVertexName)}
      type="button"
    >
      <p className={`${styles.cellText} ${styles[cell.name]}`}>
        {cell.firstChar}
      </p>
    </button>
  );
}

export default Cell;
