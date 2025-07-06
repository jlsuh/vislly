'use client';

import type {
  ChangeEvent,
  Dispatch,
  JSX,
  MouseEvent,
  PointerEvent,
  PointerEventHandler,
  RefObject,
  SetStateAction,
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
  assertIsNodeOfInterest,
  assertIsNodeTypeKey,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  type NodeOfInterest,
  PathfindingNode,
  type PathfindingNodeStrategy,
} from '../model/pathfinding.ts';
import styles from './pathfinding.module.css';

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

function mutateAssociatedParagraph(node: PathfindingNode): void {
  const { row, col, value } = node;
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
  paragraph.className = `${styles.nodeText} ${styles[value]}`;
  paragraph.textContent = node.getFirstChar();
}

function handleSpecialNode({
  grid,
  newNodeStrategy,
  nodeCol,
  nodeRow,
  nodesOfInterest,
  setGrid,
}: {
  grid: PathfindingNode[][];
  newNodeStrategy: PathfindingNodeStrategy;
  nodeCol: number;
  nodeRow: number;
  nodesOfInterest: RefObject<Record<NodeOfInterest, PathfindingNode>>;
  setGrid: Dispatch<SetStateAction<PathfindingNode[][]>>;
}): void {
  const newValue = newNodeStrategy.value;
  assertIsNodeOfInterest(newValue);
  if (nodesOfInterest.current[newValue].appearsOnGrid()) {
    const { row: pivotRow, col: pivotCol } = nodesOfInterest.current[newValue];
    grid[pivotRow][pivotCol] = new PathfindingNode(
      pivotRow,
      pivotCol,
      NODE_STRATEGIES.empty,
    );
    setGrid(grid);
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const targetNode = grid[nodeRow][nodeCol];
  if (
    targetNode.isNodeOfInterest() &&
    nodesOfInterest.current[newValue].positionEquals(targetNode)
  ) {
    targetNode.eliminateFromGrid();
  }
  nodesOfInterest.current[newValue] = new PathfindingNode(
    nodeRow,
    nodeCol,
    newNodeStrategy,
  );
  mutateAssociatedParagraph(nodesOfInterest.current[newValue]);
}

function Node({
  grid,
  gridNode,
  nodesOfInterest,
  selectedNodeStrategy,
  setGrid,
}: {
  grid: PathfindingNode[][];
  gridNode: PathfindingNode;
  nodesOfInterest: RefObject<Record<NodeOfInterest, PathfindingNode>>;
  selectedNodeStrategy: PathfindingNodeStrategy;
  setGrid: Dispatch<SetStateAction<PathfindingNode[][]>>;
}): JSX.Element {
  const [node, setNode] = useState(gridNode);
  const { row: nodeRow, col: nodeCol } = gridNode;

  const setNewNodeType = (newNodeStrategy: PathfindingNodeStrategy): void => {
    if (newNodeStrategy.isNodeOfInterest()) {
      handleSpecialNode({
        grid,
        newNodeStrategy,
        nodeCol,
        nodeRow,
        nodesOfInterest,
        setGrid,
      });
    } else {
      const { start, end } = nodesOfInterest.current;
      if (gridNode.positionEquals(start)) {
        start.eliminateFromGrid();
      }
      if (gridNode.positionEquals(end)) {
        end.eliminateFromGrid();
      }
    }
    grid[nodeRow][nodeCol] = new PathfindingNode(
      nodeRow,
      nodeCol,
      newNodeStrategy,
    );
    setGrid(grid);
    setNode(grid[nodeRow][nodeCol]);
  };

  return (
    <button
      className={styles.node}
      data-col={nodeCol}
      data-row={nodeRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>): void =>
        e.preventDefault()
      }
      onMouseDown={(): void => setNewNodeType(selectedNodeStrategy)}
      onTouchStart={(): void => setNewNodeType(selectedNodeStrategy)}
      type="button"
    >
      <p className={`${styles.nodeText} ${styles[node.value]}`}>
        {node.getFirstChar()}
      </p>
    </button>
  );
}

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

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [grid, setGrid] = useState<PathfindingNode[][]>([]);
  const [selectedNodeStrategy, setSelectedNodeStrategy] = useState(
    NODE_STRATEGIES.wall,
  );
  const nodesOfInterest = useRef<Record<NodeOfInterest, PathfindingNode>>({
    start: new PathfindingNode(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      NODE_STRATEGIES.start,
    ),
    end: new PathfindingNode(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      NODE_STRATEGIES.end,
    ),
  });
  const { dimensions, ref } =
    useResizeDimensions<HTMLElement>(RESIZE_DIMENSIONS);
  const { isHoldingClickRef } = useIsHoldingClickOnElement(ref);
  const nodeTypeSelectId = useId();

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / NODE_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / NODE_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = Array.from({ length: rows }, (_, row) =>
        Array.from(
          { length: cols },
          (__, col) => new PathfindingNode(row, col, NODE_STRATEGIES.empty),
        ),
      );
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const nodeValue: PathfindingNode | undefined = prevGrid[row]?.[col];
          if (nodeValue === undefined) {
            continue;
          }
          newGrid[row][col] = nodeValue;
        }
      }
      return newGrid;
    });
    const startNode = nodesOfInterest.current.start;
    const { row: startRow, col: startCol } = startNode;
    if (cols - 1 < startCol || rows - 1 < startRow) {
      startNode.eliminateFromGrid();
    }
    const endNode = nodesOfInterest.current.end;
    const { row: endCol, col: endRow } = endNode;
    if (cols - 1 < endCol || rows - 1 < endRow) {
      endNode.eliminateFromGrid();
    }
  }, [rows, cols]);

  return (
    <>
      <select
        id={nodeTypeSelectId}
        key={selectedNodeStrategy.value}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => {
          const { value } = e.target;
          assertIsNodeTypeKey(value);
          setSelectedNodeStrategy(NODE_STRATEGIES[value]);
        }}
        value={selectedNodeStrategy.value}
      >
        {Object.values(NODE_STRATEGIES).map(({ value }) => (
          <option key={value} value={value}>
            {value}
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
              key={`node-row-${nodeRow}-col-${nodeCol}-value-${gridNode.value}`}
              grid={grid}
              gridNode={gridNode}
              nodesOfInterest={nodesOfInterest}
              selectedNodeStrategy={selectedNodeStrategy}
              setGrid={setGrid}
            />
          )),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
