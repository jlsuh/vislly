'use client';

import pxToRem from '@/shared/lib/pxToRem.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

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
const CELL_SIZE = 1;

function Pathfinding(): JSX.Element {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useEffect(() => {
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_SIZE));
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, ${CELL_SIZE}rem)`,
        gridTemplateRows: `repeat(auto-fit, ${CELL_SIZE}rem)`,
        height: '40rem',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {Array.from({ length: rows * cols })
        .fill(0)
        .map((_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          return (
            <div
              key={`cell-${row}-${col}`}
              style={{
                backgroundColor: 'lightgray',
                height: `${CELL_SIZE}rem`,
                outline: '0.0625rem solid black',
                width: `${CELL_SIZE}rem`,
                fontSize: '0.0325rem',
              }}
            />
          );
        })}
    </div>
  );
}

export default Pathfinding;
