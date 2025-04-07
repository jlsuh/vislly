import type { CSSProperties } from 'react';

interface CSSCustomProperty extends CSSProperties {
  [key: `--${string}`]: string | number;
}

function composeCSSCustomProperty(
  identifier: string,
  value: string | number,
): CSSCustomProperty {
  return {
    [`--${identifier}`]: value,
  };
}

export default composeCSSCustomProperty;
