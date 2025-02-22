import type { JSX } from 'react';
import styles from './brand-logo.module.css';

function BrandLogo(): JSX.Element {
  return (
    <a className={styles.brandLink} href="/">
      <svg
        aria-hidden="true"
        fill="none"
        height="53"
        viewBox="0 0 52 53"
        width="52"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          className={styles.brandPath_fill_colorOnSurfaceVariantDark}
          height="42"
          rx="10"
          transform="rotate(-45 -3.5 26.5)"
          width="42"
          x="-3.5"
          y="26.5"
        />
        <path
          className={styles.brandPath_fill_colorOutlineVariantDark}
          d="M31.1033 34.6161C28.6278 35.7488 24.7388 30.1795 24.7388 26.5554C24.7388 22.9314 27.9207 18.0711 31.1033 18.4941C34.2847 20.1925 30.7778 22.9313 30.7778 26.5553C30.7778 30.1793 34.9918 32.2133 31.1033 34.6161Z"
        />
        <path
          className={styles.brandPath_stroke_colorInverseOnSurfaceDark}
          d="M23.6777 11L24.5545 11.4755C29.6952 14.2634 33.0617 19.4778 33.4864 25.3104V25.3104C33.5468 26.1399 33.5468 26.9728 33.4864 27.8023V27.8023C33.0617 33.6349 29.6952 38.8493 24.5545 41.6372L23.6777 42.1127"
          strokeLinecap="square"
          strokeWidth="1.6"
        />
        <path
          className={styles.brandPath_stroke_colorInverseOnSurfaceDark}
          d="M32.375 20.8994L31.6922 22.495C31.3419 23.3133 31.099 24.1736 30.9695 25.0543V25.0543C30.8231 26.0502 30.8231 27.0622 30.9695 28.058V28.058C31.099 28.9386 31.3419 29.7989 31.692 30.6172L32.3749 32.2131"
          strokeLinecap="round"
          strokeWidth="1.2"
        />
        <path
          className={styles.brandPath_stroke_colorInverseOnSurfaceDark}
          d="M27.9199 18.7783L26.4948 21.2723C25.5752 22.8816 25.0915 24.703 25.0915 26.5565V26.5565V26.5565C25.0915 28.41 25.5752 30.2314 26.4948 31.8407L27.9199 34.3347"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
        <path
          className={styles.brandPath_fill_colorInverseOnSurfaceDark}
          d="M5.17651 25.2463C4.39805 25.5296 4.13566 26.3206 4.59046 27.013C5.04526 27.7054 6.04502 28.0371 6.82349 27.7537L5.17651 25.2463ZM37.9337 16.4306L39.3432 15.9176L37.6963 13.4101L36.2867 13.9231L37.9337 16.4306ZM6.82349 27.7537L37.9337 16.4306L36.2867 13.9231L5.17651 25.2463L6.82349 27.7537Z"
        />
        <path
          className={styles.brandPath_fill_colorInverseOnSurfaceDark}
          d="M6.82345 25.2463C6.04498 24.963 5.04522 25.2946 4.59042 25.987C4.13562 26.6795 4.39801 27.4705 5.17648 27.7538L6.82345 25.2463ZM36.29 39.0781L37.6995 39.5912L39.3465 37.0837L37.937 36.5706L36.29 39.0781ZM5.17648 27.7538L36.29 39.0781L37.937 36.5706L6.82345 25.2463L5.17648 27.7538Z"
        />
      </svg>
      <h1 className={styles.brandTitle}>Visually</h1>
    </a>
  );
}

export default BrandLogo;
