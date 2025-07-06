import {
  type Dispatch,
  type JSX,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  useState,
} from 'react';
import type { ReadonlyDeep } from 'type-fest';
import {
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  PathfindingNode,
  PathfindingNodeStrategy,
  type PathfindingSpecialNodeKey,
} from '../model/pathfinding.ts';
import styles from './node.module.css';

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
  specialNodes,
}: {
  grid: PathfindingNode[][];
  newNodeStrategy: ReadonlyDeep<PathfindingNodeStrategy>;
  nodeCol: number;
  nodeRow: number;
  specialNodes: RefObject<Record<PathfindingSpecialNodeKey, PathfindingNode>>;
}): void {
  const newValue = newNodeStrategy.value;
  PathfindingNodeStrategy.assertIsSpecialNode(newValue);
  if (specialNodes.current[newValue].appearsOnGrid()) {
    const { row: pivotRow, col: pivotCol } = specialNodes.current[newValue];
    grid[pivotRow][pivotCol] = new PathfindingNode(
      pivotRow,
      pivotCol,
      NODE_STRATEGIES.empty,
    );
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const newSpecialNodes = {
    ...specialNodes.current,
  };
  const targetNode = grid[nodeRow][nodeCol];
  if (targetNode.isSpecial()) {
    const targetNodeValue = targetNode.value;
    PathfindingNodeStrategy.assertIsSpecialNode(targetNodeValue);
    newSpecialNodes[targetNodeValue] = new PathfindingNode(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      NODE_STRATEGIES[targetNodeValue],
    );
  }
  newSpecialNodes[newValue] = new PathfindingNode(
    nodeRow,
    nodeCol,
    newNodeStrategy,
  );
  mutateAssociatedParagraph(newSpecialNodes[newValue]);
  specialNodes.current = newSpecialNodes;
}

function Node({
  grid,
  gridNode,
  specialNodes,
  selectedNodeStrategy,
  setGrid,
}: {
  grid: PathfindingNode[][];
  gridNode: PathfindingNode;
  specialNodes: RefObject<Record<PathfindingSpecialNodeKey, PathfindingNode>>;
  selectedNodeStrategy: ReadonlyDeep<PathfindingNodeStrategy>;
  setGrid: Dispatch<SetStateAction<PathfindingNode[][]>>;
}): JSX.Element {
  const [node, setNode] = useState(gridNode);
  const { row: nodeRow, col: nodeCol } = gridNode;

  const setNewNodeStrategy = (
    newNodeStrategy: ReadonlyDeep<PathfindingNodeStrategy>,
  ): void => {
    if (newNodeStrategy.isSpecial()) {
      handleSpecialNode({
        grid,
        newNodeStrategy,
        nodeCol,
        nodeRow,
        specialNodes,
      });
    } else if (grid[nodeRow][nodeCol].isSpecial()) {
      const specialNodeValue = grid[nodeRow][nodeCol].value;
      PathfindingNodeStrategy.assertIsSpecialNode(specialNodeValue);
      specialNodes.current[specialNodeValue] = new PathfindingNode(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        NODE_STRATEGIES[specialNodeValue],
      );
    }
    grid[nodeRow][nodeCol] = new PathfindingNode(
      nodeRow,
      nodeCol,
      newNodeStrategy,
    );
    setGrid(grid);
    setNode(grid[nodeRow][nodeCol]);
    console.log('>>>>>> Start:', specialNodes.current.start);
    console.log('>>>>>> End:', specialNodes.current.end);
  };

  return (
    <button
      className={styles.node}
      data-col={nodeCol}
      data-row={nodeRow}
      onContextMenu={(e: MouseEvent<HTMLButtonElement>): void =>
        e.preventDefault()
      }
      onMouseDown={(): void => setNewNodeStrategy(selectedNodeStrategy)}
      onTouchStart={(): void => setNewNodeStrategy(selectedNodeStrategy)}
      type="button"
    >
      <p className={`${styles.nodeText} ${styles[node.value]}`}>
        {node.getFirstChar()}
      </p>
    </button>
  );
}

export default Node;
