'use client';

import type {
  ChangeEvent,
  JSX,
  PointerEvent,
  PointerEventHandler,
  RefObject,
  TouchEvent,
} from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
  pxToRem,
} from '@/shared/lib/css.ts';
import useIsHoldingClickOnElement from '@/shared/lib/useIsHoldingClickOnElement.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import {
  assertIsTerminalVertex,
  assertIsVertexName,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  START,
  type TerminalVertex,
  VERTEX_NAMES,
  Vertex,
  type VertexName,
  WALL,
} from '../model/pathfinding.ts';
import Cell from './Cell.tsx';
import styles from './pathfinding-grid.module.css';

const RESIZE_DIMENSIONS = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  height: 0,
  width: 0,
};
const CELL_DIM_SIZE = 1;
const CELL_SIZE_VAR: CssCustomProperty = composeCssCustomProperty(
  'cell-size',
  `${CELL_DIM_SIZE}rem`,
);

function dispatchMouseDownOnCell({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}): void {
  const cell = document.elementFromPoint(clientX, clientY);
  if (cell === null) {
    return;
  }
  const button = cell.closest('button');
  if (button === null) {
    return;
  }
  button.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      clientX,
      clientY,
    }),
  );
}

function dispatchOnPointerMove(
  isHoldingClickRef: RefObject<boolean>,
): PointerEventHandler<HTMLElement> {
  return (e: PointerEvent<HTMLElement>) => {
    if (!isHoldingClickRef.current) {
      return;
    }
    const { clientX, clientY } = e;
    dispatchMouseDownOnCell({ clientX, clientY });
  };
}

const dispatchOnTouchMove = (e: TouchEvent<HTMLElement>): void => {
  const touch = e.touches[0];
  const { clientX, clientY } = touch;
  dispatchMouseDownOnCell({ clientX, clientY });
};

const hideBodyOverflow = (): void => {
  document.body.style.overflow = 'hidden';
};

const unsetBodyOverflow = (): void => {
  document.body.style.overflow = 'unset';
};

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
  prevGrid: Vertex[][],
  rows: number,
  cols: number,
): Vertex[][] {
  const newGrid: Vertex[][] = [];
  for (let row = 0; row < rows; row += 1) {
    newGrid.push(composeNewRow(prevGrid, row, cols));
  }
  return newGrid;
}

function handleOverflownTerminalCells(
  terminalCells: RefObject<Record<TerminalVertex, Vertex>>,
  rows: number,
  cols: number,
): void {
  const newTerminalCells: Record<TerminalVertex, Vertex> = {
    ...terminalCells.current,
  };
  for (const terminalCell of Object.values(terminalCells.current)) {
    const { row, col, name } = terminalCell;
    const isOverflown = col > cols - 1 || row > rows - 1;
    if (isOverflown) {
      assertIsTerminalVertex(name);
      newTerminalCells[name] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        name,
      );
    }
  }
  terminalCells.current = newTerminalCells;
}

function PathfindingGrid(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [grid, setGrid] = useState<Vertex[][]>([]);
  const [selectedVertexName, setSelectedVertexName] =
    useState<VertexName>(WALL);
  const terminalVertices = useRef<Record<TerminalVertex, Vertex>>({
    start: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, START),
    end: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, END),
  });
  const { dimensions, ref } =
    useResizeDimensions<HTMLElement>(RESIZE_DIMENSIONS);
  const { isHoldingClickRef } = useIsHoldingClickOnElement(ref);
  const vertexNameSelectId = useId();

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => composeNewGrid(prevGrid, rows, cols));
    handleOverflownTerminalCells(terminalVertices, rows, cols);
  }, [rows, cols]);

  const log = (): void => {
    console.log('Grid:', grid);
    console.log('Start:', terminalVertices.current.start);
    console.log('End:', terminalVertices.current.end);
  };

  return (
    <>
      <select
        id={vertexNameSelectId}
        key={selectedVertexName}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const { value } = e.target;
          assertIsVertexName(value);
          setSelectedVertexName(value);
        }}
        value={selectedVertexName}
      >
        {VERTEX_NAMES.map((vertexName) => (
          <option key={vertexName} value={vertexName}>
            {vertexName}
          </option>
        ))}
      </select>
      <button onClick={log} type="button">
        Log
      </button>
      <section
        aria-label="Pathfinding grid"
        className={styles.grid}
        onPointerMove={dispatchOnPointerMove(isHoldingClickRef)}
        onTouchEnd={unsetBodyOverflow}
        onTouchMove={dispatchOnTouchMove}
        onTouchStart={hideBodyOverflow}
        ref={ref}
        style={CELL_SIZE_VAR}
      >
        {grid.map((gridRow, cellRow) =>
          gridRow.map((gridCell, cellCol) => (
            <Cell
              key={`cell-row-${cellRow}-col-${cellCol}-value-${gridCell.name}`}
              grid={grid}
              gridCell={gridCell}
              terminalVertices={terminalVertices}
              selectedVertexName={selectedVertexName}
              setGrid={setGrid}
            />
          )),
        )}
      </section>
    </>
  );
}

export default PathfindingGrid;
