import type { JSX } from 'react';

function Pathfinding(): JSX.Element {
  return (
    <>
      <svg aria-hidden="true">
        <rect fill="grey" width="100" height="100" stroke="red" />
      </svg>
      <div
        style={{
          borderLeft: '3px solid white',
          width: '100px',
          height: '100px',
        }}
      />
    </>
  );
}

export default Pathfinding;
