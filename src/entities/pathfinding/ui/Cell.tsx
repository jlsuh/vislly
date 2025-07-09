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
  const { row: cellRow, col: cellCol } = gridCell;

  const setNewVertexName = (newVertexName: VertexName): void => {
    const targetVertexName = grid[cellRow][cellCol].vertexName;
    if (isTerminal(targetVertexName)) {
      terminalVertices.current[targetVertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        targetVertexName,
      );
    }
    if (isTerminal(newVertexName)) {
      const currentTerminalVertex = terminalVertices.current[newVertexName];
      if (currentTerminalVertex.appearsOnGrid()) {
        const { row: vertexRow, col: vertexCol } = currentTerminalVertex;
        const newEmptyVertex = new Vertex(vertexRow, vertexCol, EMPTY);
        grid[vertexRow][vertexCol] = newEmptyVertex;
        mutateAssociatedParagraph(newEmptyVertex);
      }
      const newterminalVertices = {
        ...terminalVertices.current,
      };
      newterminalVertices[newVertexName] = new Vertex(
        cellRow,
        cellCol,
        newVertexName,
      );
      mutateAssociatedParagraph(newterminalVertices[newVertexName]);
      terminalVertices.current = newterminalVertices;
    }
    grid[cellRow][cellCol] = new Vertex(cellRow, cellCol, newVertexName);
    setGrid(grid);
    setCell(grid[cellRow][cellCol].deepCopy());
    console.log('>>>>> Start:', terminalVertices.current.start);
    console.log('>>>>> End:', terminalVertices.current.end);
    console.log(
      '>>>>> Start on grid:',
      grid[terminalVertices.current.start.row]?.[
        terminalVertices.current.start.col
      ],
    );
    console.log(
      '>>>>> End on grid:',
      grid[terminalVertices.current.end.row]?.[
        terminalVertices.current.end.col
      ],
    );
  };

  return (
    <button
      className={styles.cell}
      data-col={cellCol}
      data-row={cellRow}
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
