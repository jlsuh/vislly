import type { JSX } from 'react';

type BurgerIconProps = {
  sx: string;
};

function BurgerIcon({ sx }: BurgerIconProps): JSX.Element {
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
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default BurgerIcon;
