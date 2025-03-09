import type { CSSProperties as ReactCSSProperties } from 'react';

declare interface CSSProperties extends ReactCSSProperties {
  [key: `--${string}`]: string | number | undefined;
}
