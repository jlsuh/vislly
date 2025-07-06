import {
  type Dispatch,
  type JSX,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  useState,
} from 'react';
import {
  assertIsNodeOfInterest,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  type NodeOfInterest,
  PathfindingNode,
  type PathfindingNodeStrategy,
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
  nodesOfInterest,
}: {
  grid: PathfindingNode[][];
  newNodeStrategy: PathfindingNodeStrategy;
  nodeCol: number;
  nodeRow: number;
  nodesOfInterest: RefObject<Record<NodeOfInterest, PathfindingNode>>;
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
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const newNodesOfInterest = {
    ...nodesOfInterest.current,
  };
  const targetNode = grid[nodeRow][nodeCol];
  if (targetNode.isNodeOfInterest()) {
    const targetNodeValue = targetNode.value;
    assertIsNodeOfInterest(targetNodeValue);
    newNodesOfInterest[targetNodeValue] = new PathfindingNode(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      NODE_STRATEGIES[targetNodeValue],
    );
  }
  newNodesOfInterest[newValue] = new PathfindingNode(
    nodeRow,
    nodeCol,
    newNodeStrategy,
  );
  mutateAssociatedParagraph(newNodesOfInterest[newValue]);
  nodesOfInterest.current = newNodesOfInterest;
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
      });
    } else {
      nodesOfInterest.current = {
        ...nodesOfInterest.current,
        [newNodeStrategy.value]: new PathfindingNode(
          INITIAL_COORDINATE,
          INITIAL_COORDINATE,
          newNodeStrategy,
        ),
      };
    }
    grid[nodeRow][nodeCol] = new PathfindingNode(
      nodeRow,
      nodeCol,
      newNodeStrategy,
    );
    setGrid(grid);
    setNode(grid[nodeRow][nodeCol]);
    console.log('>>>>>> Start:', nodesOfInterest.current.start);
    console.log('>>>>>> End:', nodesOfInterest.current.end);
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

export default Node;
