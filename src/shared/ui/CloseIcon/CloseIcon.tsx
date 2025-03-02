import type { JSX } from 'react';

type CloseIconProps = {
  sx: string;
};

function CloseIcon({ sx }: CloseIconProps): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={sx}
      height="24"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default CloseIcon;
