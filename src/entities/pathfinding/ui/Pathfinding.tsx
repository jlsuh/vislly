'use client';

import composeCSSCustomProperty from '@/shared/lib/composeCSSVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type {
  JSX,
  MouseEvent,
  MouseEventHandler,
  RefObject,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ReadonlyDeep, StringSlice } from 'type-fest';
import styles from './pathfinding.module.css';

type NodeTypeKey = 'wall' | 'empty' | 'finish' | 'start';
type NodePosition = { x: number; y: number };
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
const NODE_SIZE_VAR = composeCSSCustomProperty(
  'node-size',
  `${NODE_DIM_SIZE}rem`,
);
const NODE_TYPE: ReadonlyDeep<{
  [key in NodeTypeKey]: { value: NodeTypeKey; className: string };
}> = {
  wall: {
    value: 'wall',
    className: styles.wall,
  },
  empty: {
    value: 'empty',
    className: styles.empty,
  },
  finish: {
    value: 'finish',
    className: styles.finish,
  },
  start: {
    value: 'start',
    className: styles.start,
  },
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
  return { x: -1, y: -1 };
}

function isInitialPosition(nodePosition: NodePosition): boolean {
  return nodePosition.x === -1 && nodePosition.y === -1;
}

function isStartNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.start.value;
}

function isFinishNode(nodeType: NodeType): boolean {
  return nodeType.value === NODE_TYPE.finish.value;
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
  condition: (targetX: number, targetY: number) => boolean;
  nodePositions: RefObject<NodePosition>[];
}): void {
  for (const nodePosition of nodePositions) {
    const { x, y } = nodePosition.current;
    if (condition(x, y)) {
      nodePosition.current = composeInitialPosition();
    }
  }
}

function getElementByPosition({
  x,
  y,
}: { x: number; y: number }): HTMLButtonElement | null {
  return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}

function mutateAssociatedParagraph({
  nodeTypeClassName,
  textContent,
  x,
  y,
}: {
  nodeTypeClassName: string;
  textContent: NodeTypeKey;
  x: number;
  y: number;
}): void {
  const node = getElementByPosition({ x, y });
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
  newNodeTypeValue,
  newX,
  newY,
  otherSpecialNodes,
  specialNode,
}: {
  grid: NodeTypeKey[][];
  newNodeTypeValue: NodeTypeKey;
  newX: number;
  newY: number;
  otherSpecialNodes: RefObject<NodePosition>[];
  specialNode: RefObject<NodePosition>;
}): void {
  const { x, y } = specialNode.current;
  if (!isInitialPosition(specialNode.current)) {
    grid[x][y] = NODE_TYPE.empty.value;
    mutateAssociatedParagraph({
      nodeTypeClassName: NODE_TYPE.empty.className,
      textContent: NODE_TYPE.empty.value,
      x,
      y,
    });
  }
  setToInitialPositionIfCondition({
    condition: (targetX, targetY): boolean =>
      newX === targetX && newY === targetY,
    nodePositions: otherSpecialNodes,
  });
  mutateAssociatedParagraph({
    nodeTypeClassName: NODE_TYPE[newNodeTypeValue].className,
    textContent: newNodeTypeValue,
    x: newX,
    y: newY,
  });
  specialNode.current = { x: newX, y: newY };
}

function Node({
  finishNode,
  grid,
  nodeTypeInitialValue,
  selectedNodeType,
  startNode,
  x,
  y,
}: {
  finishNode: RefObject<NodePosition>;
  grid: NodeTypeKey[][];
  nodeTypeInitialValue: NodeType;
  selectedNodeType: NodeType;
  startNode: RefObject<NodePosition>;
  x: number;
  y: number;
}): JSX.Element {
  const [nodeType, setNodeType] = useState(nodeTypeInitialValue);

  const setNewNodeType = (newNodeType: NodeType): void => {
    if (isStartNode(newNodeType)) {
      handleSpecialNode({
        grid,
        newNodeTypeValue: newNodeType.value,
        newX: x,
        newY: y,
        otherSpecialNodes: [finishNode],
        specialNode: startNode,
      });
    }
    if (isFinishNode(newNodeType)) {
      handleSpecialNode({
        grid,
        newNodeTypeValue: newNodeType.value,
        newX: x,
        newY: y,
        otherSpecialNodes: [startNode],
        specialNode: finishNode,
      });
    }
    if (isWallNode(newNodeType) || isEmptyNode(newNodeType)) {
      setToInitialPositionIfCondition({
        condition: (targetX, targetY): boolean =>
          x === targetX && y === targetY,
        nodePositions: [startNode, finishNode],
      });
    }
    setNodeType(NODE_TYPE[newNodeType.value]);
    grid[x][y] = newNodeType.value;
  };

  return (
    <button
      className={styles.node}
      data-x={x}
      data-y={y}
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

const hideBodyOverflow = (): void => {
  document.body.style.overflow = 'hidden';
};

const unsetBodyOverflow = (): void => {
  document.body.style.overflow = 'unset';
};

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [selectedNodeType, setSelectedNodeType] = useState(DEFAULT_NODE_TYPE);
  const [grid, setGrid] = useState<NodeTypeKey[][]>([]);
  const startNode = useRef<NodePosition>(composeInitialPosition());
  const finishNode = useRef<NodePosition>(composeInitialPosition());
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / NODE_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / NODE_DIM_SIZE));
    console.log('>>>>> startNode', startNode.current);
    console.log('>>>>> finishNode', finishNode.current);
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => NODE_TYPE.empty.value),
      );
      for (let x = 0; x < rows; x += 1) {
        for (let y = 0; y < cols; y += 1) {
          const nodeValue = prevGrid[x]?.[y];
          if (nodeValue !== undefined) {
            newGrid[x][y] = nodeValue;
          }
        }
      }
      return newGrid;
    });
  }, [rows, cols]);

  useEffect(() => {
    setToInitialPositionIfCondition({
      condition: (targetX, targetY): boolean =>
        rows - 1 < targetX || cols - 1 < targetY,
      nodePositions: [startNode],
    });
    setToInitialPositionIfCondition({
      condition: (targetX, targetY): boolean =>
        rows - 1 < targetX || cols - 1 < targetY,
      nodePositions: [finishNode],
    });
  }, [rows, cols]);

  const setIsHoldingClickToFalse = (): void => {
    isHoldingClick.current = false;
  };

  const setIsHoldingClickToTrue = (): void => {
    isHoldingClick.current = true;
  };

  function dispatchEvent({
    clientX,
    clientY,
  }: { clientX: number; clientY: number }): void {
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
        key={selectedNodeType.value}
        value={selectedNodeType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsNodeTypeKey(value);
          setSelectedNodeType(NODE_TYPE[value]);
        }}
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
        {grid.map((row, x) =>
          row.map((nodeValueFirstChar, y) => (
            <Node
              finishNode={finishNode}
              grid={grid}
              key={`node-x-${x}-y-${y}-value-${nodeValueFirstChar}`}
              nodeTypeInitialValue={NODE_TYPE[nodeValueFirstChar]}
              selectedNodeType={selectedNodeType}
              startNode={startNode}
              x={x}
              y={y}
            />
          )),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
