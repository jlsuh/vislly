'use client';

import composeCSSCustomProperty from '@/shared/lib/composeCSSVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type { JSX, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './pathfinding.module.css';

type CellProps = { isMousePressed: RefObject<boolean> };

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

function Cell({ isMousePressed }: CellProps): JSX.Element {
  const [isSet, setIsSet] = useState(false);

  return (
    <button
      className={styles.cell}
      onMouseEnter={(): void => {
        if (isMousePressed.current) {
          setIsSet((prev) => !prev);
        }
      }}
      onPointerDown={(): void => {
        setIsSet((prev) => !prev);
      }}
      type="button"
    >
      <p
        style={{
          backgroundColor: isSet ? 'grey' : 'lightgray',
          color: 'black',
          fontSize: '0.5rem',
          margin: 0,
        }}
      >
        {isSet ? 1 : 0}
      </p>
    </button>
  );
}

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
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

  return (
    <section
      aria-label="Pathfinding grid"
      className={styles.grid}
      onMouseDown={setIsHoldingClickToTrue}
      onMouseLeave={setIsHoldingClickToFalse}
      onMouseUp={setIsHoldingClickToFalse}
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
              isMousePressed={isHoldingClick}
              key={`cell-row-${row}-col-${col}`}
            />
          );
        })}
    </section>
  );
}

export default Pathfinding;
