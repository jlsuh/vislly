import {
  type Dispatch,
  type JSX,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  useState,
} from 'react';
import type { ReadonlyDeep } from 'type-fest';
import {
  assertIsTerminal,
  EMPTY,
  INITIAL_COORDINATE,
  isTerminal,
  type TerminalVertex,
  Vertex,
  type VertexName,
} from '../model/pathfinding.ts';
import styles from './node.module.css';

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
  paragraph.className = `${styles.nodeText} ${styles[vertexName]}`;
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
  newvertexName: ReadonlyDeep<VertexName>;
  vertexCol: number;
  vertexRow: number;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
}): void {
  assertIsTerminal(newvertexName);
  if (terminalVertices.current[newvertexName].appearsOnGrid()) {
    const { row: pivotRow, col: pivotCol } =
      terminalVertices.current[newvertexName];
    grid[pivotRow][pivotCol] = new Vertex(pivotRow, pivotCol, EMPTY);
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const newterminalVertices = {
    ...terminalVertices.current,
  };
  const targetVertex = grid[vertexRow][vertexCol];
  if (targetVertex.isTerminal()) {
    assertIsTerminal(targetVertex.vertexName);
    newterminalVertices[targetVertex.vertexName] = new Vertex(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      targetVertex.vertexName,
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

function Node({
  grid,
  gridNode,
  terminalVertices,
  selectedVertexName,
  setGrid,
}: {
  grid: Vertex[][];
  gridNode: Vertex;
  terminalVertices: RefObject<Record<TerminalVertex, Vertex>>;
  selectedVertexName: ReadonlyDeep<VertexName>;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
}): JSX.Element {
  const [node, setNode] = useState(gridNode);
  const { row: vertexRow, col: vertexCol } = gridNode;

  const setNewVertexName = (newvertexName: ReadonlyDeep<VertexName>): void => {
    if (isTerminal(newvertexName)) {
      handleTerminalVertex({
        grid,
        newvertexName,
        vertexCol,
        vertexRow,
        terminalVertices,
      });
    } else if (grid[vertexRow][vertexCol].isTerminal()) {
      const terminalVertexName = grid[vertexRow][vertexCol].vertexName;
      assertIsTerminal(terminalVertexName);
      terminalVertices.current[terminalVertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        terminalVertexName,
      );
    }
    grid[vertexRow][vertexCol] = new Vertex(
      vertexRow,
      vertexCol,
      newvertexName,
    );
    setGrid(grid);
    setNode(grid[vertexRow][vertexCol]);
    console.log('>>>>>> Start:', terminalVertices.current.start);
    console.log('>>>>>> End:', terminalVertices.current.end);
  };

  return (
    <button
      className={styles.node}
      data-col={vertexCol}
      data-row={vertexRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>): void =>
        e.preventDefault()
      }
      onMouseDown={(): void => setNewVertexName(selectedVertexName)}
      onTouchStart={(): void => setNewVertexName(selectedVertexName)}
      type="button"
    >
      <p className={`${styles.nodeText} ${styles[node.vertexName]}`}>
        {node.getFirstChar()}
      </p>
    </button>
  );
}

export default Node;
