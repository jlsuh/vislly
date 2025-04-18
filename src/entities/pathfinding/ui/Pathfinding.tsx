'use client';

import composeCSSCustomProperty from '@/shared/lib/composeCSSVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type {
  JSX,
  MouseEvent,
  MouseEventHandler,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ReadonlyDeep } from 'type-fest';
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

const CELL_DIM_SIZE = 1;
const CELL_SIZE_VAR = composeCSSCustomProperty(
  'cell-size',
  `${CELL_DIM_SIZE}rem`,
);

type CellTypeValue = 'empty' | 'wall' | 'start' | 'finish';
type CellType = (typeof CELL_TYPE)[CellTypeValue];

const CELL_TYPE: ReadonlyDeep<{
  [key in CellTypeValue]: { value: CellTypeValue; className: string };
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

const CELL_TYPES = Object.values(CELL_TYPE);

function isCellType(value: unknown): value is CellTypeValue {
  return CELL_TYPES.some((cellType) => cellType.value === value);
}

function assertIsCellType(value: unknown): asserts value is CellTypeValue {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string, but received: ${typeof value}`);
  }
  if (!isCellType(value)) {
    throw new Error(`Invalid cell type: ${value}`);
  }
}

function composeNodeText(value: CellTypeValue): string {
  if (value === CELL_TYPE.empty.value) {
    return 'E';
  }
  if (value === CELL_TYPE.wall.value) {
    return 'W';
  }
  if (value === CELL_TYPE.start.value) {
    return 'S';
  }
  if (value === CELL_TYPE.finish.value) {
    return 'F';
  }
  throw new Error(`Invalid cell type: ${value}`);
}

function Cell({ currentCellType }: { currentCellType: CellType }): JSX.Element {
  const [cellType, setCellType] = useState(CELL_TYPE.empty);

  return (
    <button
      className={styles.cell}
      onContextMenu={(e): void => e.preventDefault()}
      onMouseDown={(): void => setCellType(currentCellType)}
      onTouchStart={(): void => setCellType(currentCellType)}
      type="button"
    >
      <p className={`${styles.cellText} ${cellType.className}`}>
        {composeNodeText(cellType.value)}
      </p>
    </button>
  );
}

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [currentCellType, setCurrentCellType] = useState(CELL_TYPE.wall);
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

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
    const cell = document.elementFromPoint(clientX, clientY);
    if (cell) {
      const cellButton = cell.closest('button');
      if (cellButton) {
        cellButton.dispatchEvent(
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
        value={currentCellType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsCellType(value);
          setCurrentCellType(CELL_TYPE[value]);
        }}
      >
        {CELL_TYPES.map((cellType) => (
          <option key={cellType.value} value={cellType.value}>
            {cellType.value.charAt(0).toUpperCase() + cellType.value.slice(1)}
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
        onTouchEnd={(): void => {
          document.body.style.overflow = 'unset';
        }}
        onTouchMove={dispatchPointerDown}
        onTouchStart={(): void => {
          document.body.style.overflow = 'hidden';
        }}
        ref={ref}
        style={CELL_SIZE_VAR}
      >
        {Array.from({ length: rows * cols })
          .fill(0)
          .map((_, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            return (
              <Cell
                currentCellType={currentCellType}
                key={`cell-row-${row}-col-${col}`}
              />
            );
          })}
      </section>
    </>
  );
}

export default Pathfinding;
