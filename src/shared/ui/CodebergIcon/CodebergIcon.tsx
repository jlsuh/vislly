import { type JSX, useId } from 'react';
import styles from './codeberg-icon.module.css';

function CodebergIcon(): JSX.Element {
  const gradientId = useId();

  return (
    <svg
      className={styles.codebergIcon}
      height="16"
      version="1.1"
      viewBox="0 0 4.233 4.233"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Codeberg Icon</title>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="42519.285"
          x2="42575.336"
          y1="-7078.7891"
          y2="-6966.9307"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop
            offset="0.49517274"
            stopColor="currentColor"
            stopOpacity="0.3"
          />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <g transform="matrix(0.06551432,0,0,0.06551432,-2.232417,-1.431776)">
        <path
          d="m 42519.285,-7078.7891 a 0.76086879,0.56791688 0 0 0 -0.738,0.6739 l 33.586,125.8886 a 87.182358,87.182358 0 0 0 39.381,-33.7636 l -71.565,-92.5196 a 0.76086879,0.56791688 0 0 0 -0.664,-0.2793 z"
          fill={`url(#${gradientId})`}
          stroke="none"
          strokeWidth="3.67846"
          transform="matrix(0.37058478,0,0,0.37058478,-15690.065,2662.0533)"
        />
        <path
          d="m 11249.461,-1883.6961 c -12.74,0 -23.067,10.3275 -23.067,23.0671 0,4.3335 1.22,8.5795 3.522,12.2514 l 19.232,-24.8636 c 0.138,-0.1796 0.486,-0.1796 0.624,0 l 19.233,24.8646 c 2.302,-3.6721 3.523,-7.9185 3.523,-12.2524 0,-12.7396 -10.327,-23.0671 -23.067,-23.0671 z"
          fill="currentColor"
          strokeWidth="17.0055"
          transform="matrix(1.4006354,0,0,1.4006354,-15690.065,2662.0533)"
        />
      </g>
    </svg>
  );
}

export default CodebergIcon;
