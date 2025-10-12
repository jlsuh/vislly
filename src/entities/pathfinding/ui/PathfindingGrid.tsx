'use client';

import type {
  JSX,
  PointerEvent,
  PointerEventHandler,
  RefObject,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { use, useEffect } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
  pxToRem,
} from '@/shared/lib/css.ts';
import useIsHoldingClickOnElement from '@/shared/lib/useIsHoldingClickOnElement.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import {
  type ResizeDimensions,
  useResizeDimensions,
} from '@/shared/lib/useResizeDimensions.ts';
import {
  assertIsTerminalVertex,
  EMPTY,
  INITIAL_COORDINATE,
  type TerminalVertex,
  Vertex,
} from '../model/vertex.ts';
import Cell from './Cell.tsx';
import PathfindingContext from './PathfindingContext.tsx';
import styles from './pathfinding-grid.module.css';

const RESIZE_DIMENSIONS: ResizeDimensions = {
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
  lastVisitedVertices: RefObject<Vertex[]>,
  reset: () => void,
): PointerEventHandler<HTMLElement> {
  return (e: PointerEvent<HTMLElement>) => {
    if (!isHoldingClickRef.current) {
      return;
    }
    if (lastVisitedVertices.current.length > 0) {
      reset();
    }
    const { clientX, clientY } = e;
    dispatchMouseDownOnCell({ clientX, clientY });
  };
}

function dispatchOnTouchMove(
  lastVisitedVertices: RefObject<Vertex[]>,
  reset: () => void,
): TouchEventHandler<HTMLElement> {
  return (e: TouchEvent<HTMLElement>) => {
    if (lastVisitedVertices.current.length > 0) {
      reset();
    }
    const touch = e.touches[0];
    const { clientX, clientY } = touch;
    dispatchMouseDownOnCell({ clientX, clientY });
  };
}

const hideBodyOverflow = (): void => {
  document.body.style.overflow = 'hidden';
};

const clearBodyOverflow = (): void => {
  document.body.style.overflow = '';
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
  const { dimensions, ref } =
    useResizeDimensions<HTMLElement>(RESIZE_DIMENSIONS);
  const { isHoldingClickRef } = useIsHoldingClickOnElement(ref);

  useOnClickOutside([ref], clearBodyOverflow);

  const {
    cols,
    grid,
    lastVisitedVertices,
    rows,
    terminalVertices,
    resetPathfind,
    setCols,
    setGrid,
    setRows,
  } = use(PathfindingContext);

  useEffect(() => {
    resetPathfind();
    const newCols = Math.floor(
      pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE,
    );
    if (newCols !== cols) {
      setCols(newCols);
    }
    const newRows = Math.floor(
      pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE,
    );
    if (newRows !== rows) {
      setRows(newRows);
    }
    setGrid((prevGrid) => composeNewGrid(prevGrid, rows, cols));
    handleOverflownTerminalCells(terminalVertices, rows, cols);
  }, [
    cols,
    dimensions.boundedHeight,
    dimensions.boundedWidth,
    rows,
    terminalVertices,
    resetPathfind,
    setCols,
    setGrid,
    setRows,
  ]);

  return (
    <section
      aria-label="Pathfinding grid"
      className={styles.grid}
      onPointerMove={dispatchOnPointerMove(
        isHoldingClickRef,
        lastVisitedVertices,
        resetPathfind,
      )}
      onTouchEnd={clearBodyOverflow}
      onTouchMove={dispatchOnTouchMove(lastVisitedVertices, resetPathfind)}
      onTouchStart={hideBodyOverflow}
      ref={ref}
      style={CELL_SIZE_VAR}
    >
      {grid.map((gridRow, cellRow) => {
        const rowKey = `row-${cellRow}`;
        return (
          <div key={rowKey} className={styles.row}>
            {gridRow.map((gridCell, cellCol) => (
              <Cell
                gridCell={gridCell}
                key={`cell-row-${cellRow}-col-${cellCol}-value-${gridCell.name}`}
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}

export default PathfindingGrid;
