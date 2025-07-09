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
  isTerminal,
  type TerminalVertex,
  Vertex,
  type VertexName,
} from '../model/pathfinding.ts';
import styles from './cell.module.css';

function mutateAssociatedParagraph(vertex: Vertex): void {
  const { row, col, vertexName } = vertex;
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
  paragraph.className = `${styles.cellText} ${styles[vertexName]}`;
  paragraph.textContent = vertex.getFirstChar();
}

function handleTerminalVertex({
  grid,
  newvertexName,
  vertexCol,
  vertexRow,
  terminalVertices,
}: {
  grid: Vertex[][];
  newvertexName: TerminalVertex;
  vertexCol: number;
  vertexRow: number;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
}): void {
  if (terminalVertices.current[newvertexName].appearsOnGrid()) {
    const { row: pivotRow, col: pivotCol } =
      terminalVertices.current[newvertexName];
    grid[pivotRow][pivotCol] = new Vertex(pivotRow, pivotCol, EMPTY);
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const newterminalVertices = {
    ...terminalVertices.current,
  };
  const targetVertexName = grid[vertexRow][vertexCol].vertexName;
  if (isTerminal(targetVertexName)) {
    newterminalVertices[targetVertexName] = new Vertex(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      targetVertexName,
    );
  }
  newterminalVertices[newvertexName] = new Vertex(
    vertexRow,
    vertexCol,
    newvertexName,
  );
  mutateAssociatedParagraph(newterminalVertices[newvertexName]);
  terminalVertices.current = newterminalVertices;
}

function Cell({
  grid,
  gridCell,
  terminalVertices,
  selectedVertexName,
  setGrid,
}: {
  grid: Vertex[][];
  gridCell: Vertex;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
  selectedVertexName: VertexName;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
}): JSX.Element {
  const [cell, setCell] = useState(gridCell);
  const { row: vertexRow, col: vertexCol } = gridCell;
  const targetVertexName = grid[vertexRow][vertexCol].vertexName;

  const setNewVertexName = (newvertexName: VertexName): void => {
    if (isTerminal(newvertexName)) {
      handleTerminalVertex({
        grid,
        newvertexName,
        vertexCol,
        vertexRow,
        terminalVertices,
      });
    } else if (isTerminal(targetVertexName)) {
      terminalVertices.current[targetVertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        targetVertexName,
      );
    }
    grid[vertexRow][vertexCol] = new Vertex(
      vertexRow,
      vertexCol,
      newvertexName,
    );
    setGrid(grid);
    setCell(grid[vertexRow][vertexCol]);
    console.log('>>>>>> Start:', terminalVertices.current.start);
    console.log('>>>>>> End:', terminalVertices.current.end);
  };

  return (
    <button
      className={styles.cell}
      data-col={vertexCol}
      data-row={vertexRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>): void =>
        e.preventDefault()
      }
      onMouseDown={(): void => setNewVertexName(selectedVertexName)}
      onTouchStart={(): void => setNewVertexName(selectedVertexName)}
      type="button"
    >
      <p className={`${styles.cellText} ${styles[cell.vertexName]}`}>
        {cell.getFirstChar()}
      </p>
    </button>
  );
}

export default Cell;
