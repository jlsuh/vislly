import type { CSSProperties } from 'react';

interface CssCustomProperty extends CSSProperties {
  [key: `--${string}`]: string | number;
}

function composeCssCustomProperty(
  identifier: string,
  value: string | number,
): CssCustomProperty {
  return {
    [`--${identifier}`]: value,
  };
}

function getRootFontSize(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function pxToRem(px: number): number {
  const rootFontSize = getRootFontSize();
  return px / rootFontSize;
}

export {
  composeCssCustomProperty,
  getRootFontSize,
  pxToRem,
  type CssCustomProperty,
};
