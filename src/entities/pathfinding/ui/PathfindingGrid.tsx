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
} from '@/shared/lib/composeCssVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useIsHoldingClickOnElement from '@/shared/lib/useIsHoldingClickOnElement.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import {
  assertIsTerminal,
  assertIsVertex,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  START,
  type TerminalVertex,
  Vertex,
  type VertexName,
  WALL,
} from '../model/pathfinding.ts';
import Node from './Node.tsx';
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
const NODE_DIM_SIZE = 1;
const NODE_SIZE_VAR: CssCustomProperty = composeCssCustomProperty(
  'node-size',
  `${NODE_DIM_SIZE}rem`,
);

function dispatchMouseDownOnNode({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}): void {
  const node = document.elementFromPoint(clientX, clientY);
  if (node === null) {
    return;
  }
  const button = node.closest('button');
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
    dispatchMouseDownOnNode({ clientX, clientY });
  };
}

const dispatchOnTouchMove = (e: TouchEvent<HTMLElement>): void => {
  const touch = e.touches[0];
  const { clientX, clientY } = touch;
  dispatchMouseDownOnNode({ clientX, clientY });
};

const hideBodyOverflow = (): void => {
  document.body.style.overflow = 'hidden';
};

const unsetBodyOverflow = (): void => {
  document.body.style.overflow = 'unset';
};

function composeNewGrid(
  prevGrid: Vertex[][],
  rows: number,
  cols: number,
): Vertex[][] {
  const newGrid = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (__, col) => new Vertex(row, col, EMPTY)),
  );
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const vertex: Vertex | undefined = prevGrid[row]?.[col];
      if (vertex === undefined) {
        continue;
      }
      newGrid[row][col] = vertex;
    }
  }
  return newGrid;
}

function handleOverflownTerminalNodes(
  terminalNodes: RefObject<Record<TerminalVertex, Vertex>>,
  rows: number,
  cols: number,
): void {
  const newTerminalNodes: Record<TerminalVertex, Vertex> = {
    ...terminalNodes.current,
  };
  for (const terminalNode of Object.values(terminalNodes.current)) {
    const { row, col, vertexName } = terminalNode;
    if (col > cols - 1 || row > rows - 1) {
      assertIsTerminal(vertexName);
      newTerminalNodes[vertexName] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        vertexName,
      );
    }
  }
  terminalNodes.current = newTerminalNodes;
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
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / NODE_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / NODE_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => composeNewGrid(prevGrid, rows, cols));
    handleOverflownTerminalNodes(terminalVertices, rows, cols);
  }, [rows, cols]);

  useEffect(() => {
    console.log('>>>>> grid:', grid);
    console.log('>>>>>> Start:', terminalVertices.current.start);
    console.log('>>>>>> End:', terminalVertices.current.end);
  }, [grid]);

  return (
    <>
      <select
        id={vertexNameSelectId}
        key={selectedVertexName}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => {
          const { value } = e.target;
          assertIsVertex(value);
          setSelectedVertexName(value);
        }}
        value={selectedVertexName}
      >
        {[WALL, EMPTY, END, START].map((vertexName) => (
          <option key={vertexName} value={vertexName}>
            {vertexName}
          </option>
        ))}
      </select>
      <section
        aria-label="Pathfinding grid"
        className={styles.grid}
        onPointerMove={dispatchOnPointerMove(isHoldingClickRef)}
        onTouchEnd={unsetBodyOverflow}
        onTouchMove={dispatchOnTouchMove}
        onTouchStart={hideBodyOverflow}
        ref={ref}
        style={NODE_SIZE_VAR}
      >
        {grid.map((gridRow, nodeRow) =>
          gridRow.map((gridNode, nodeCol) => (
            <Node
              key={`node-row-${nodeRow}-col-${nodeCol}-value-${gridNode.vertexName}`}
              grid={grid}
              gridNode={gridNode}
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
