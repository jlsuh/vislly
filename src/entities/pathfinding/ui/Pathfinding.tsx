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

function Cell(): JSX.Element {
  const [isWall, setIsWall] = useState(false);

  const toggleWall = (): void => {
    setIsWall((prev) => !prev);
  };

  return (
    <button
      className={styles.cell}
      onMouseDown={toggleWall}
      onPointerDown={toggleWall}
      type="button"
    >
      <p
        style={{
          backgroundColor: isWall ? 'grey' : 'lightgray',
          color: 'black',
          fontSize: '0.5rem',
          margin: 0,
        }}
      >
        {isWall ? 1 : 0}
      </p>
    </button>
  );
}

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const currentCell = useRef<HTMLButtonElement>(null);
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
    eventType,
  }: { clientX: number; clientY: number; eventType: string }): void {
    const cell = document.elementFromPoint(clientX, clientY);
    if (cell) {
      const cellButton = cell.closest('button');
      if (cellButton && cellButton !== currentCell.current) {
        currentCell.current = cellButton;
        cellButton.dispatchEvent(
          new MouseEvent(eventType, {
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
    dispatchEvent({ clientX, clientY, eventType: 'pointerdown' });
  };

  const dispatchMouseDown: MouseEventHandler<HTMLElement> = (
    e: MouseEvent<HTMLElement>,
  ): void => {
    if (!isHoldingClick.current) {
      return;
    }
    const { clientX, clientY } = e;
    dispatchEvent({ clientX, clientY, eventType: 'mousedown' });
  };

  return (
    <section
      aria-label="Pathfinding grid"
      className={styles.grid}
      onMouseDown={setIsHoldingClickToTrue}
      onMouseLeave={setIsHoldingClickToFalse}
      onMouseMove={dispatchMouseDown}
      onMouseUp={setIsHoldingClickToFalse}
      onTouchEnd={(): void => {
        document.body.style.overflow = 'unset';
        isHoldingClick.current = false;
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
          return <Cell key={`cell-row-${row}-col-${col}`} />;
        })}
    </section>
  );
}

export default Pathfinding;
