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
import { useEffect, useId, useRef, useState } from 'react';
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
  assertIsPathfindingAlgorithm,
  PATHFINDING_ALGORITHMS,
  type PathfindingAlgorithm,
} from '../model/pathfinding-algorithms.ts';
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
} from '../model/vertex.ts';
import Cell from './Cell.tsx';
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

function setButtonStyle(vertex: Vertex, backgroundColor: string): void {
  const { row, col } = vertex;
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
  paragraph.style = `background-color: ${backgroundColor};`;
}

function resetButtonStyles(vertices: Vertex[]): void {
  for (const vertex of vertices) {
    setButtonStyle(vertex, '');
  }
}

const ANIMATION_DELAY = 5;
const INITIAL_ALGORITHM = 'bfs';

function PathfindingGrid(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [grid, setGrid] = useState<Vertex[][]>([]);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
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
  const vertexNameSelectId = useId();

  const { dimensions, ref } =
    useResizeDimensions<HTMLElement>(RESIZE_DIMENSIONS);
  const { isHoldingClickRef } = useIsHoldingClickOnElement(ref);

  useOnClickOutside([ref], clearBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => composeNewGrid(prevGrid, rows, cols));
    handleOverflownTerminalCells(terminalVertices, rows, cols);
    return () => {
      isAnimationRunningRef.current = false;
      setIsAnimationRunning(false);
      lastGenerator.current = null;
    };
  }, [rows, cols]);

  useEffect(() => {
    resetButtonStyles(grid.flat());
  }, [grid]);

  const findPath = (): void => {
    if (!terminalVertices.current.start.appearsOnGrid()) {
      console.error('Start vertex is not set on the grid');
      return;
    }
    if (!terminalVertices.current.end.appearsOnGrid()) {
      console.error('End vertex is not set on the grid');
      return;
    }
    if (lastGenerator.current === null) {
      resetButtonStyles(lastVisitedVertices.current);
    }
    setIsAnimationRunning(true);
    isAnimationRunningRef.current = true;
    if (lastGenerator.current === null) {
      const { strategy } = PATHFINDING_ALGORITHMS[selectedAlgorithmName];
      const generator = strategy.generator(
        grid,
        terminalVertices.current.start,
        terminalVertices.current.end,
      );
      lastGenerator.current = generator;
    }
    const initialStart = terminalVertices.current.start;
    const initialEnd = terminalVertices.current.end;
    const intervalId = window.setInterval(() => {
      if (
        initialStart.row !== terminalVertices.current.start.row ||
        initialStart.col !== terminalVertices.current.start.col
      ) {
        console.info('Start vertex has been moved, exiting animation');
        reset();
        window.clearInterval(intervalId);
        return;
      }
      if (
        initialEnd.row !== terminalVertices.current.end.row ||
        initialEnd.col !== terminalVertices.current.end.col
      ) {
        console.info('End vertex has been moved, exiting animation');
        reset();
        window.clearInterval(intervalId);
        return;
      }
      if (!isAnimationRunningRef.current) {
        window.clearInterval(intervalId);
        return;
      }
      let it: IteratorResult<Vertex[], Vertex[]>;
      try {
        if (lastGenerator.current === null) {
          throw new Error('Generator not initialized');
        }
        it = lastGenerator.current.next();
      } catch (error) {
        console.info('Error during Pathfinding:', error);
        lastGenerator.current = null;
        isAnimationRunningRef.current = false;
        setIsAnimationRunning(false);
        window.clearInterval(intervalId);
        return;
      }
      const { done, value } = it;
      const lastVisited = value.at(-1);
      if (lastVisited === undefined) {
        console.error('No last visited vertex found');
        return;
      }
      if (!done) {
        setButtonStyle(lastVisited, '#AFEEEE');
        lastVisitedVertices.current = value;
        return;
      }
      const pathWithoutTerminals = value.slice(1, value.length - 1);
      for (const vertex of pathWithoutTerminals) {
        setButtonStyle(vertex, '#FEF250');
      }
      lastGenerator.current = null;
      isAnimationRunningRef.current = false;
      setIsAnimationRunning(false);
      window.clearInterval(intervalId);
    }, ANIMATION_DELAY);
  };

  const stopAnimation = (): void => {
    isAnimationRunningRef.current = false;
    setIsAnimationRunning(false);
  };

  const reset = (): void => {
    resetButtonStyles(lastVisitedVertices.current);
    lastVisitedVertices.current = [];
    isAnimationRunningRef.current = false;
    setIsAnimationRunning(false);
    lastGenerator.current = null;
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
        onClick={isAnimationRunning ? stopAnimation : findPath}
      >
        {isAnimationRunning ? 'Stop' : 'Play'}
      </button>
      <button onClick={reset} type="button">
        Reset
      </button>
      <section
        aria-label="Pathfinding grid"
        className={styles.grid}
        onPointerMove={dispatchOnPointerMove(
          isHoldingClickRef,
          lastVisitedVertices,
          reset,
        )}
        onTouchEnd={clearBodyOverflow}
        onTouchMove={dispatchOnTouchMove(lastVisitedVertices, reset)}
        onTouchStart={hideBodyOverflow}
        ref={ref}
        style={CELL_SIZE_VAR}
      >
        {grid.map((gridRow, cellRow) =>
          gridRow.map((gridCell, cellCol) => (
            <Cell
              grid={grid}
              gridCell={gridCell}
              key={`cell-row-${cellRow}-col-${cellCol}-value-${gridCell.name}`}
              lastVisitedVertices={lastVisitedVertices}
              reset={reset}
              selectedVertexName={selectedVertexName}
              terminalVertices={terminalVertices}
            />
          )),
        )}
      </section>
    </>
  );
}

export default PathfindingGrid;
