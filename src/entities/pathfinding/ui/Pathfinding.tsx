'use client';

import type {
  Dispatch,
  JSX,
  MouseEvent,
  MouseEventHandler,
  RefObject,
  SetStateAction,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import type { ReadonlyDeep, StringSlice } from 'type-fest';
import composeCssCustomProperty from '@/shared/lib/composeCssVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import styles from './pathfinding.module.css';

type NodeTypeKey = 'wall' | 'empty' | 'end' | 'start';
type NodePosition = { col: number; row: number };
type NodeType = (typeof NODE_TYPE)[NodeTypeKey];
type NodeTypeKeyFirstChar = StringSlice<NodeTypeKey, 0, 1>;

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
const NODE_TYPE: ReadonlyDeep<
  Record<NodeTypeKey, { className: string; value: NodeTypeKey }>
> = {
  wall: { className: styles.wall, value: 'wall' },
  empty: { className: styles.empty, value: 'empty' },
  end: { className: styles.end, value: 'end' },
  start: { className: styles.start, value: 'start' },
};
const NODE_TYPES = Object.values(NODE_TYPE);
const DEFAULT_NODE_TYPE = NODE_TYPE.wall;

function isNodeType(value: unknown): value is NodeTypeKey {
  return NODE_TYPES.some((nodeType) => nodeType.value === value);
}

function isNodeTypeFirstChar(value: unknown): value is NodeTypeKeyFirstChar {
  return NODE_TYPES.some((nodeType) => nodeType.value.charAt(0) === value);
}

function assertIsNodeTypeKey(value: unknown): asserts value is NodeTypeKey {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string, but received: ${typeof value}`);
  }
  if (!isNodeType(value)) {
    throw new Error(`Invalid node type: ${value}`);
  }
}

function getNodeTypeFirstChar(value: NodeTypeKey): NodeTypeKeyFirstChar {
  const firstChar = value.charAt(0);
  if (!isNodeTypeFirstChar(firstChar)) {
    throw new Error(`Invalid node type first character: ${firstChar}`);
  }
  return firstChar;
}

function composeInitialPosition(): NodePosition {
  return { col: -1, row: -1 };
}

function isInitialPosition(nodePosition: NodePosition): boolean {
  return nodePosition.col === -1 && nodePosition.row === -1;
}

function isStartNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.start.value;
}

function isEndNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.end.value;
}

function isWallNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.wall.value;
}

function isEmptyNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.empty.value;
}

function setToInitialPositionIfCondition({
  condition,
  nodePositions,
}: {
  condition: ({
    targetCol,
    targetRow,
  }: {
    targetCol: number;
    targetRow: number;
  }) => boolean;
  nodePositions: RefObject<NodePosition>[];
}): void {
  for (const nodePosition of nodePositions) {
    const { col, row } = nodePosition.current;
    if (condition({ targetCol: col, targetRow: row })) {
      nodePosition.current = composeInitialPosition();
    }
  }
}

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
  col,
  nodeTypeClassName,
  row,
  textContent,
}: {
  col: number;
  nodeTypeClassName: string;
  row: number;
  textContent: NodeTypeKey;
}): void {
  const node = getElementByPosition({ col, row });
  if (node) {
    const paragraph = node.querySelector('p');
    if (paragraph) {
      paragraph.className = `${styles.nodeText} ${nodeTypeClassName}`;
      paragraph.textContent = getNodeTypeFirstChar(textContent);
    }
  }
}

function handleSpecialNode({
  grid,
  newCol,
  newNodeTypeValue,
  newRow,
  otherSpecialNodes,
  setGrid,
  specialNode,
}: {
  grid: NodeTypeKey[][];
  newCol: number;
  newNodeTypeValue: NodeTypeKey;
  newRow: number;
  otherSpecialNodes: RefObject<NodePosition>[];
  setGrid: Dispatch<SetStateAction<NodeTypeKey[][]>>;
  specialNode: RefObject<NodePosition>;
}): void {
  const { col, row } = specialNode.current;
  if (!isInitialPosition(specialNode.current)) {
    grid[row][col] = NODE_TYPE.empty.value;
    setGrid(grid);
    mutateAssociatedParagraph({
      col,
      nodeTypeClassName: NODE_TYPE.empty.className,
      row,
      textContent: NODE_TYPE.empty.value,
    });
  }
  setToInitialPositionIfCondition({
    condition: ({ targetCol, targetRow }): boolean =>
      newCol === targetCol && newRow === targetRow,
    nodePositions: otherSpecialNodes,
  });
  mutateAssociatedParagraph({
    col: newCol,
    nodeTypeClassName: NODE_TYPE[newNodeTypeValue].className,
    row: newRow,
    textContent: newNodeTypeValue,
  });
  specialNode.current = { col: newCol, row: newRow };
}

function Node({
  col,
  endNode,
  grid,
  nodeTypeInitialValue,
  row,
  selectedNodeType,
  setGrid,
  startNode,
}: {
  col: number;
  endNode: RefObject<NodePosition>;
  grid: NodeTypeKey[][];
  nodeTypeInitialValue: NodeType;
  row: number;
  selectedNodeType: NodeType;
  setGrid: Dispatch<SetStateAction<NodeTypeKey[][]>>;
  startNode: RefObject<NodePosition>;
}): JSX.Element {
  const [nodeType, setNodeType] = useState(nodeTypeInitialValue);

  const setNewNodeType = (newNodeType: NodeType): void => {
    if (isStartNode(newNodeType)) {
      handleSpecialNode({
        grid,
        newCol: col,
        newNodeTypeValue: newNodeType.value,
        newRow: row,
        otherSpecialNodes: [endNode],
        setGrid,
        specialNode: startNode,
      });
    }
    if (isEndNode(newNodeType)) {
      handleSpecialNode({
        grid,
        newCol: col,
        newNodeTypeValue: newNodeType.value,
        newRow: row,
        otherSpecialNodes: [startNode],
        setGrid,
        specialNode: endNode,
      });
    }
    if (isWallNode(newNodeType) || isEmptyNode(newNodeType)) {
      setToInitialPositionIfCondition({
        condition: ({ targetCol, targetRow }): boolean =>
          col === targetCol && row === targetRow,
        nodePositions: [startNode, endNode],
      });
    }
    grid[row][col] = newNodeType.value;
    setGrid(grid);
    setNodeType(NODE_TYPE[newNodeType.value]);
  };

  return (
    <button
      className={styles.node}
      data-col={col}
      data-row={row}
      onContextMenu={(e): void => e.preventDefault()}
      onMouseDown={(): void => setNewNodeType(selectedNodeType)}
      onTouchStart={(): void => setNewNodeType(selectedNodeType)}
      type="button"
    >
      <p className={`${styles.nodeText} ${nodeType.className}`}>
        {getNodeTypeFirstChar(nodeType.value)}
      </p>
    </button>
  );
}

function dispatchEvent({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}): void {
  const node = document.elementFromPoint(clientX, clientY);
  if (node) {
    const button = node.closest('button');
    if (button) {
      button.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          clientX,
          clientY,
        }),
      );
    }
  }
}

const dispatchPointerDown: TouchEventHandler<HTMLElement> = (
  e: TouchEvent<HTMLElement>,
): void => {
  const touch = e.touches[0];
  const { clientX, clientY } = touch;
  dispatchEvent({ clientX, clientY });
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
  const [grid, setGrid] = useState<NodeTypeKey[][]>([]);
  const [selectedNodeType, setSelectedNodeType] = useState(DEFAULT_NODE_TYPE);
  const endNode = useRef<NodePosition>(composeInitialPosition());
  const startNode = useRef<NodePosition>(composeInitialPosition());
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);
  const nodeTypeSelectId = useId();

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / NODE_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / NODE_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => NODE_TYPE.empty.value),
      );
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const nodeValue = prevGrid[row]?.[col];
          if (nodeValue !== undefined) {
            newGrid[row][col] = nodeValue;
          }
        }
      }
      return newGrid;
    });
    setToInitialPositionIfCondition({
      condition: ({ targetCol, targetRow }): boolean =>
        cols - 1 < targetCol || rows - 1 < targetRow,
      nodePositions: [startNode],
    });
    setToInitialPositionIfCondition({
      condition: ({ targetCol, targetRow }): boolean =>
        cols - 1 < targetCol || rows - 1 < targetRow,
      nodePositions: [endNode],
    });
  }, [rows, cols]);

  const setIsHoldingClickToFalse = (): void => {
    isHoldingClick.current = false;
  };

  const setIsHoldingClickToTrue = (): void => {
    isHoldingClick.current = true;
  };

  const dispatchMouseDown: MouseEventHandler<HTMLElement> = (
    e: MouseEvent<HTMLElement>,
  ): void => {
    if (!isHoldingClick.current) {
      return;
    }
    const { clientX, clientY } = e;
    dispatchEvent({ clientX, clientY });
  };

  return (
    <>
      <select
        id={nodeTypeSelectId}
        key={selectedNodeType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsNodeTypeKey(value);
          setSelectedNodeType(NODE_TYPE[value]);
        }}
        value={selectedNodeType.value}
      >
        {NODE_TYPES.map((nodeType) => (
          <option key={nodeType.value} value={nodeType.value}>
            {nodeType.value.charAt(0).toUpperCase() + nodeType.value.slice(1)}
          </option>
        ))}
      </select>
      <section
        aria-label="Pathfinding grid"
        className={styles.grid}
        onMouseDown={setIsHoldingClickToTrue}
        onMouseLeave={setIsHoldingClickToFalse}
        onMouseMove={dispatchMouseDown}
        onMouseUp={setIsHoldingClickToFalse}
        onTouchMove={dispatchPointerDown}
        onTouchStart={hideBodyOverflow}
        ref={ref}
        style={NODE_SIZE_VAR}
      >
        {grid.map((gridRow, row) =>
          gridRow.map((nodeTypeKey, col) => (
            <Node
              col={col}
              endNode={endNode}
              grid={grid}
              key={`node-row-${row}-col-${col}-value-${nodeTypeKey}`}
              nodeTypeInitialValue={NODE_TYPE[nodeTypeKey]}
              row={row}
              selectedNodeType={selectedNodeType}
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
