import type { JSX } from 'react';
import styles from './../shared.module.css';

function DarkThemeIcon(): JSX.Element {
  return (
    <svg
      className={styles.themeIconContainer}
      fill="none"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Always Dark Icon</title>
      <g clipPath="url(#clip0_78_60)">
        <path
          d="M7.24135 14C10.1123 13.9981 12.6803 12.2445 13.7367 9.59537C13.7953 9.44832 13.727 9.39266 13.5866 9.46575C12.7818 9.88471 11.888 10.1036 10.9806 10.104C7.86082 10.1042 5.33169 7.57506 5.33188 4.45524C5.3323 3.64636 5.50645 2.84701 5.84254 2.11127C6.17863 1.37552 6.66883 0.720544 7.27996 0.190644C7.42672 0.0486062 7.38444 -0.0171645 7.09498 0.00382823C3.42058 0.029058 0.24231 3.13569 0.24231 7.00113C0.24231 10.8666 3.3758 14.0002 7.24135 14Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath>
          <rect fill="currentColor" height={14} width={14} />
        </clipPath>
      </defs>
    </svg>
  );
}

export default DarkThemeIcon;
