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
  type TerminalVertex,
  Vertex,
  VertexStrategy,
} from '../model/pathfinding.ts';
import styles from './node.module.css';

function mutateAssociatedParagraph(node: Vertex): void {
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

function handleTerminalNode({
  grid,
  newNodeStrategy,
  nodeCol,
  nodeRow,
  terminalNodes,
}: {
  grid: Vertex[][];
  newNodeStrategy: ReadonlyDeep<VertexStrategy>;
  nodeCol: number;
  nodeRow: number;
  terminalNodes: RefObject<Record<TerminalVertex, Vertex>>;
}): void {
  const newValue = newNodeStrategy.value;
  VertexStrategy.assertIsTerminalNode(newValue);
  if (terminalNodes.current[newValue].appearsOnGrid()) {
    const { row: pivotRow, col: pivotCol } = terminalNodes.current[newValue];
    grid[pivotRow][pivotCol] = new Vertex(
      pivotRow,
      pivotCol,
      NODE_STRATEGIES.empty,
    );
    mutateAssociatedParagraph(grid[pivotRow][pivotCol]);
  }
  const newterminalNodes = {
    ...terminalNodes.current,
  };
  const targetNode = grid[nodeRow][nodeCol];
  if (targetNode.isTerminal()) {
    const targetNodeValue = targetNode.value;
    VertexStrategy.assertIsTerminalNode(targetNodeValue);
    newterminalNodes[targetNodeValue] = new Vertex(
      INITIAL_COORDINATE,
      INITIAL_COORDINATE,
      NODE_STRATEGIES[targetNodeValue],
    );
  }
  newterminalNodes[newValue] = new Vertex(nodeRow, nodeCol, newNodeStrategy);
  mutateAssociatedParagraph(newterminalNodes[newValue]);
  terminalNodes.current = newterminalNodes;
}

function Node({
  grid,
  gridNode,
  terminalNodes,
  selectedNodeStrategy,
  setGrid,
}: {
  grid: Vertex[][];
  gridNode: Vertex;
  terminalNodes: RefObject<Record<TerminalVertex, Vertex>>;
  selectedNodeStrategy: ReadonlyDeep<VertexStrategy>;
  setGrid: Dispatch<SetStateAction<Vertex[][]>>;
}): JSX.Element {
  const [node, setNode] = useState(gridNode);
  const { row: nodeRow, col: nodeCol } = gridNode;

  const setNewNodeStrategy = (
    newNodeStrategy: ReadonlyDeep<VertexStrategy>,
  ): void => {
    if (newNodeStrategy.isTerminal()) {
      handleTerminalNode({
        grid,
        newNodeStrategy,
        nodeCol,
        nodeRow,
        terminalNodes,
      });
    } else if (grid[nodeRow][nodeCol].isTerminal()) {
      const terminalNodeValue = grid[nodeRow][nodeCol].value;
      VertexStrategy.assertIsTerminalNode(terminalNodeValue);
      terminalNodes.current[terminalNodeValue] = new Vertex(
        INITIAL_COORDINATE,
        INITIAL_COORDINATE,
        NODE_STRATEGIES[terminalNodeValue],
      );
    }
    grid[nodeRow][nodeCol] = new Vertex(nodeRow, nodeCol, newNodeStrategy);
    setGrid(grid);
    setNode(grid[nodeRow][nodeCol]);
    console.log('>>>>>> Start:', terminalNodes.current.start);
    console.log('>>>>>> End:', terminalNodes.current.end);
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
