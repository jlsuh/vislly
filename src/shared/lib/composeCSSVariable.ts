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

export default composeCssCustomProperty;
