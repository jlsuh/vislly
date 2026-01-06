import type { JSX } from 'react';

function PauseIcon(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M6 19h4V5H6zm8-14v14h4V5z"></path>
    </svg>
  );
}

export default PauseIcon;
