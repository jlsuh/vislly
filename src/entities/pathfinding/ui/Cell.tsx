'use client';

import { type JSX, type MouseEvent, use, useState } from 'react';
import {
  EMPTY,
  INITIAL_COORDINATE,
  isTerminalVertex,
  Vertex,
  type VertexName,
} from '../model/vertex.ts';
import styles from './cell.module.css';
import PathfindingContext from './PathfindingContext.tsx';

function Cell({ gridCell }: { gridCell: Vertex }): JSX.Element {
  const [cell, setCell] = useState(gridCell);
  const { row: cellRow, col: cellCol } = gridCell;

  const {
    grid,
    lastVisitedVertices,
    selectedVertexName,
    terminalVertices,
    resetPathfind,
    setGrid,
    setTerminalVertices,
  } = use(PathfindingContext);

  const setNewVertexName = (newVertexName: VertexName): void => {
    if (lastVisitedVertices.current.length > 0) {
      resetPathfind();
    }
    const nextGrid = grid.map((row) => [...row]);
    const nextTerminalVertices = { ...terminalVertices.current };
    const targetVertexName = nextGrid[cellRow][cellCol].name;
    if (isTerminalVertex(targetVertexName)) {
      nextTerminalVertices[targetVertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        targetVertexName,
      );
    }
    if (isTerminalVertex(newVertexName)) {
      const terminalVertex = nextTerminalVertices[newVertexName];
      if (terminalVertex.appearsOnGrid()) {
        const { row: terminalVertexRow, col: terminalVertexCol } =
          terminalVertex;
        const newEmptyVertex = new Vertex(
          terminalVertexRow,
          terminalVertexCol,
          EMPTY,
        );
        nextGrid[terminalVertexRow][terminalVertexCol] = newEmptyVertex;
      }
      nextTerminalVertices[newVertexName] = new Vertex(
        cellRow,
        cellCol,
        newVertexName,
      );
    }
    nextGrid[cellRow][cellCol] = new Vertex(cellRow, cellCol, newVertexName);
    setTerminalVertices(nextTerminalVertices);
    setGrid(nextGrid);
    setCell(nextGrid[cellRow][cellCol].deepCopy());
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
    >
      <div className={styles.cellTraversalStatus} />
    </button>
  );
}

export default Cell;
