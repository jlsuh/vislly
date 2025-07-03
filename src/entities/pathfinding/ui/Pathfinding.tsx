'use client';

import type {
  Dispatch,
  JSX,
  PointerEvent,
  PointerEventHandler,
  RefObject,
  SetStateAction,
  TouchEvent,
} from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import composeCssCustomProperty from '@/shared/lib/composeCssVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useIsHoldingClickOnElement from '@/shared/lib/useIsHoldingClickOnElement.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import {
  assertIsNodeTypeKey,
  NODE_OPTIONS,
  PathfindingNode,
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
const NODE_SIZE_VAR = composeCssCustomProperty(
  'node-size',
  `${NODE_DIM_SIZE}rem`,
);

function getElementByPosition({
  col,
  row,
}: {
  col: number;
  row: number;
}): HTMLButtonElement | null {
  return document.querySelector(`[data-col="${col}"][data-row="${row}"]`);
}

function mutateAssociatedParagraph({
  pathfindingNode,
}: {
  pathfindingNode: PathfindingNode;
}): void {
  const node = getElementByPosition({
    col: pathfindingNode.col,
    row: pathfindingNode.row,
  });
  if (node === null) {
    return;
  }
  const paragraph = node.querySelector('p');
  if (paragraph === null) {
    return;
  }
  paragraph.className = `${styles.nodeText} ${styles[pathfindingNode.value]}`;
  paragraph.textContent = pathfindingNode.getFirstChar();
}

function handleSpecialNode({
  grid,
  newCol,
  newPathfindingNode,
  newRow,
  otherSpecialNodes,
  setGrid,
  specialNode,
}: {
  grid: PathfindingNode[][];
  newCol: number;
  newPathfindingNode: PathfindingNode;
  newRow: number;
  otherSpecialNodes: RefObject<PathfindingNode>[];
  setGrid: Dispatch<SetStateAction<PathfindingNode[][]>>;
  specialNode: RefObject<PathfindingNode>;
}): void {
  const { col, row } = specialNode.current;
  if (!specialNode.current.isInitialPosition()) {
    grid[row][col] = new PathfindingNode({ row, col, value: 'empty' });
    setGrid(grid);
    mutateAssociatedParagraph({
      pathfindingNode: new PathfindingNode({ row, col, value: 'empty' }),
    });
  }
  for (const node of otherSpecialNodes) {
    node.current.setToInitialPositionIfCondition({
      condition: ({ targetCol, targetRow }): boolean =>
        newCol === targetCol && newRow === targetRow,
    });
  }
  mutateAssociatedParagraph({
    pathfindingNode: new PathfindingNode({
      row: newRow,
      col: newCol,
      value: newPathfindingNode.value,
    }),
  });
  specialNode.current = new PathfindingNode({
    row: newRow,
    col: newCol,
    value: newPathfindingNode.value,
  });
}

function Node({
  col,
  endNode,
  grid,
  pathfindingNode,
  row,
  selectedNodeOption,
  setGrid,
  startNode,
}: {
  col: number;
  endNode: RefObject<PathfindingNode>;
  grid: PathfindingNode[][];
  pathfindingNode: PathfindingNode;
  row: number;
  selectedNodeOption: PathfindingNode;
  setGrid: Dispatch<SetStateAction<PathfindingNode[][]>>;
  startNode: RefObject<PathfindingNode>;
}): JSX.Element {
  const [nodeType, setNodeType] = useState(pathfindingNode);

  const setNewNodeType = (newPathfindingNode: PathfindingNode): void => {
    if (newPathfindingNode.isStartNode()) {
      handleSpecialNode({
        grid,
        newCol: col,
        newPathfindingNode,
        newRow: row,
        otherSpecialNodes: [endNode],
        setGrid,
        specialNode: startNode,
      });
    }
    if (newPathfindingNode.isEndNode()) {
      handleSpecialNode({
        grid,
        newCol: col,
        newPathfindingNode,
        newRow: row,
        otherSpecialNodes: [startNode],
        setGrid,
        specialNode: endNode,
      });
    }
    if (newPathfindingNode.isWallNode() || newPathfindingNode.isEmptyNode()) {
      startNode.current.setToInitialPositionIfCondition({
        condition: ({ targetCol, targetRow }): boolean =>
          col === targetCol && row === targetRow,
      });
      endNode.current.setToInitialPositionIfCondition({
        condition: ({ targetCol, targetRow }): boolean =>
          col === targetCol && row === targetRow,
      });
    }
    grid[row][col] = new PathfindingNode({
      row,
      col,
      value: newPathfindingNode.value,
    });
    setGrid(grid);
    setNodeType(newPathfindingNode);
  };

  return (
    <button
      className={styles.node}
      data-col={col}
      data-row={row}
      onContextMenu={(e): void => e.preventDefault()}
      onMouseDown={(): void => setNewNodeType(selectedNodeOption)}
      onTouchStart={(): void => setNewNodeType(selectedNodeOption)}
      type="button"
    >
      <p className={`${styles.nodeText} ${styles[nodeType.value]}`}>
        {nodeType.getFirstChar()}
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
  const [selectedNodeOption, setSelectedNodeOption] = useState(
    new PathfindingNode({ row: -1, col: -1, value: 'wall' }),
  );
  const endNode = useRef(
    new PathfindingNode({
      row: -1,
      col: -1,
      value: 'end',
    }),
  );
  const startNode = useRef(
    new PathfindingNode({ row: -1, col: -1, value: 'start' }),
  );
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
          (__, col) => new PathfindingNode({ row, col, value: 'empty' }),
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
    startNode.current.setToInitialPositionIfCondition({
      condition: ({ targetCol, targetRow }): boolean =>
        cols - 1 < targetCol || rows - 1 < targetRow,
    });
    endNode.current.setToInitialPositionIfCondition({
      condition: ({ targetCol, targetRow }): boolean =>
        cols - 1 < targetCol || rows - 1 < targetRow,
    });
  }, [rows, cols]);

  return (
    <>
      <select
        id={nodeTypeSelectId}
        key={selectedNodeOption.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsNodeTypeKey(value);
          setSelectedNodeOption(
            new PathfindingNode({ row: -1, col: -1, value }),
          );
        }}
        value={selectedNodeOption.value}
      >
        {NODE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
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
        {grid.map((gridRow, row) =>
          gridRow.map((pathfindingNode, col) => (
            <Node
              col={col}
              endNode={endNode}
              grid={grid}
              key={`node-row-${row}-col-${col}-value-${pathfindingNode.value}`}
              pathfindingNode={pathfindingNode}
              row={row}
              selectedNodeOption={selectedNodeOption}
              setGrid={setGrid}
              startNode={startNode}
            />
          )),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
