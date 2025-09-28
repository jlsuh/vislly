'use client';

import type {
  ChangeEvent,
  JSX,
  PointerEvent,
  PointerEventHandler,
  RefObject,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
  pxToRem,
} from '@/shared/lib/css.ts';
import { Rgba } from '@/shared/lib/rgba.ts';
import useIsHoldingClickOnElement from '@/shared/lib/useIsHoldingClickOnElement.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import {
  type ResizeDimensions,
  useResizeDimensions,
} from '@/shared/lib/useResizeDimensions.ts';
import {
  assertIsPathfindingAlgorithm,
  INITIAL_ALGORITHM,
  PATHFINDING_ALGORITHMS,
} from '../model/pathfinding-algorithms.ts';
import type { PathfindingAlgorithm } from '../model/pathfinding-strategy.ts';
import {
  assertIsTerminalVertex,
  assertIsVertexName,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  NON_TERMINAL_VERTEX_NAMES,
  START,
  type TerminalVertex,
  VERTEX_NAMES,
  Vertex,
  type VertexName,
  WALL,
} from '../model/vertex.ts';
import Cell from './Cell.tsx';
import getElementByCoordinates from './getElementByCoordinates.ts';
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

function getAssociatedDiv(row: number, col: number): Element {
  const element = getElementByCoordinates(row, col);
  const associatedDiv = element.firstElementChild;
  if (associatedDiv === null) {
    throw new Error(
      `Associated div not found for coordinates (${row}, ${col})`,
    );
  }
  return associatedDiv;
}

function setButtonBackground(
  row: number,
  col: number,
  backgroundColor: string,
): void {
  const associatedDiv = getAssociatedDiv(row, col);
  associatedDiv.setAttribute('style', `background-color: ${backgroundColor};`);
}

function removeButtonBackground(row: number, col: number): void {
  const associatedDiv = getAssociatedDiv(row, col);
  associatedDiv.removeAttribute('style');
}

function resetButtonStyles(vertices: Vertex[]): void {
  for (const vertex of vertices) {
    removeButtonBackground(vertex.row, vertex.col);
  }
}

function hasChangedOriginalPosition(
  initialVertices: Record<TerminalVertex, Vertex>,
  currentTerminalVertices: RefObject<Record<TerminalVertex, Vertex>>,
): boolean {
  for (const terminalVertex of Object.values(currentTerminalVertices.current)) {
    const name = terminalVertex.name;
    assertIsTerminalVertex(name);
    if (!terminalVertex.positionEquals(initialVertices[name])) {
      console.info(`${name} vertex has changed position`);
      return true;
    }
  }
  return false;
}

function appearsOnGrid(
  initialVertices: Record<TerminalVertex, Vertex>,
): boolean {
  for (const vertex of Object.values(initialVertices)) {
    if (!vertex.appearsOnGrid()) {
      console.info(`${vertex.name} vertex not found`);
      return false;
    }
  }
  return true;
}

const ANIMATION_DELAY = 5;
const VISITED: string = new Rgba(
  0.686_274_509_803_921_6,
  0.933_333_333_333_333_3,
  0.933_333_333_333_333_3,
  0.6,
).toStyle();
const PATH: string = new Rgba(
  0.996_078_431_372_549,
  0.949_019_607_843_137_2,
  0.313_725_490_196_078_4,
  0.75,
).toStyle();

function PathfindingGrid(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [grid, setGrid] = useState<Vertex[][]>([]);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [isDiagonalAllowed, setIsDiagonalAllowed] = useState(false);
  const [rows, setRows] = useState(0);
  const [selectedAlgorithmName, setSelectedAlgorithmName] =
    useState<PathfindingAlgorithm>(INITIAL_ALGORITHM);
  const [selectedVertexName, setSelectedVertexName] =
    useState<VertexName>(WALL);

  const isAnimationRunningRef = useRef(false);
  const lastGenerator = useRef<Iterator<Vertex[], Vertex[]>>(null);
  const lastVisitedVertices = useRef<Vertex[]>([]);
  const terminalVertices = useRef<Record<TerminalVertex, Vertex>>({
    start: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, START),
    end: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, END),
  });

  const algorithmSelectId = useId();
  const isDiagonalAllowedInputId = useId();
  const vertexNameSelectId = useId();

  const { dimensions, ref } =
    useResizeDimensions<HTMLElement>(RESIZE_DIMENSIONS);
  const { isHoldingClickRef } = useIsHoldingClickOnElement(ref);

  useOnClickOutside([ref], clearBodyOverflow);

  const pausePathfind = useCallback((): void => {
    isAnimationRunningRef.current = false;
    setIsAnimationRunning(false);
  }, []);

  const stopPathfind = useCallback((): void => {
    pausePathfind();
    lastGenerator.current = null;
  }, [pausePathfind]);

  const resetPathfind = useCallback((): void => {
    stopPathfind();
    resetButtonStyles(lastVisitedVertices.current);
    lastVisitedVertices.current = [];
  }, [stopPathfind]);

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
    dimensions.boundedHeight,
    dimensions.boundedWidth,
    cols,
    rows,
    resetPathfind,
  ]);

  function handlePathfindingFrame(intervalId: number): void {
    let it: IteratorResult<Vertex[], Vertex[]>;
    try {
      if (lastGenerator.current === null) {
        throw new Error('Generator not initialized');
      }
      it = lastGenerator.current.next();
    } catch (error) {
      console.info('Error during Pathfinding:', error);
      stopPathfind();
      window.clearInterval(intervalId);
      return;
    }
    const { done, value } = it;
    const lastVisited = value.at(-1);
    if (lastVisited === undefined) {
      throw new Error('Last visited vertex is undefined');
    }
    if (!done) {
      try {
        setButtonBackground(lastVisited.row, lastVisited.col, VISITED);
      } catch (_) {
        console.info('Skipping setting background for', lastVisited);
        stopPathfind();
        window.clearInterval(intervalId);
        return;
      }
      lastVisitedVertices.current = value;
      return;
    }
    const pathWithoutTerminals = value.slice(1, -1);
    for (const vertex of pathWithoutTerminals) {
      setButtonBackground(vertex.row, vertex.col, PATH);
    }
    stopPathfind();
    window.clearInterval(intervalId);
  }

  function update(
    initialVertices: Record<TerminalVertex, Vertex>,
    intervalId: number,
  ): void {
    if (hasChangedOriginalPosition(initialVertices, terminalVertices)) {
      resetPathfind();
      window.clearInterval(intervalId);
      return;
    }
    if (!isAnimationRunningRef.current) {
      window.clearInterval(intervalId);
      return;
    }
    if (lastGenerator.current === null) {
      const { strategy } = PATHFINDING_ALGORITHMS[selectedAlgorithmName];
      const generator = strategy.generator(
        grid,
        terminalVertices.current.start,
        terminalVertices.current.end,
        isDiagonalAllowed,
      );
      lastGenerator.current = generator;
    }
    handlePathfindingFrame(intervalId);
  }

  const findPath = (): void => {
    const initialVertices = terminalVertices.current;
    if (!appearsOnGrid(initialVertices)) {
      return;
    }
    if (lastGenerator.current === null && !isAnimationRunningRef.current) {
      resetButtonStyles(lastVisitedVertices.current);
    }
    setIsAnimationRunning(true);
    isAnimationRunningRef.current = true;
    const intervalId = window.setInterval(
      () => update(initialVertices, intervalId),
      ANIMATION_DELAY,
    );
  };

  const randomizeGrid = (): void => {
    resetPathfind();
    terminalVertices.current = {
      start: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, START),
      end: new Vertex(INITIAL_COORDINATE, INITIAL_COORDINATE, END),
    };
    const newGrid: Vertex[][] = [];
    for (let row = 0; row < rows; row += 1) {
      const newRow: Vertex[] = [];
      for (let col = 0; col < cols; col += 1) {
        const randomName =
          NON_TERMINAL_VERTEX_NAMES[
            Math.floor(Math.random() * NON_TERMINAL_VERTEX_NAMES.length)
          ];
        newRow.push(new Vertex(row, col, randomName));
      }
      newGrid.push(newRow);
    }
    setGrid(newGrid);
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
      <select
        id={algorithmSelectId}
        key={selectedAlgorithmName}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const { value } = e.target;
          assertIsPathfindingAlgorithm(value);
          setSelectedAlgorithmName(value);
        }}
        value={selectedAlgorithmName}
      >
        {Object.values(PATHFINDING_ALGORITHMS).map(({ label }) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={isAnimationRunning ? pausePathfind : findPath}
      >
        {isAnimationRunning ? 'Stop' : 'Play'}
      </button>
      <button onClick={resetPathfind} type="button">
        Reset
      </button>
      <button onClick={randomizeGrid} type="button">
        Randomize
      </button>
      <div>
        <input
          id={isDiagonalAllowedInputId}
          type="checkbox"
          checked={isDiagonalAllowed}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setIsDiagonalAllowed(e.target.checked)
          }
        />
        <label htmlFor={isDiagonalAllowedInputId}>
          Allow diagonal movement
        </label>
      </div>
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
                  grid={grid}
                  gridCell={gridCell}
                  key={`cell-row-${cellRow}-col-${cellCol}-value-${gridCell.name}`}
                  lastVisitedVertices={lastVisitedVertices}
                  reset={resetPathfind}
                  selectedVertexName={selectedVertexName}
                  terminalVertices={terminalVertices}
                />
              ))}
            </div>
          );
        })}
      </section>
    </>
  );
}

export default PathfindingGrid;
