import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import type { Dimensions } from './types';

function composeChartDimensions(dimensions: Dimensions) {
  const { height, width, marginTop, marginRight, marginBottom, marginLeft } =
    dimensions;
  return {
    ...dimensions,
    boundedHeight: Math.max(height - marginTop - marginBottom, 0),
    boundedWidth: Math.max(width - marginLeft - marginRight, 0),
  };
}

function useChartDimensions(initialDimensions: Dimensions): {
  dimensions: Dimensions;
  ref: MutableRefObject<null>;
} {
  const [currentHeight, setCurrentHeight] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const ref = useRef(null);

  const initialChartDimensions = composeChartDimensions(initialDimensions);

  useEffect(() => {
    const element = ref.current ?? new Element();
    const resizeObserver = new ResizeObserver((entries) => {
      const { contentRect } = entries[0];
      if (currentHeight !== contentRect.height)
        setCurrentHeight(contentRect.height);
      if (currentWidth !== contentRect.width)
        setCurrentWidth(contentRect.width);
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [currentHeight, currentWidth]);

  const dimensions = composeChartDimensions({
    ...initialChartDimensions,
    width: initialChartDimensions.width || currentWidth,
    height: initialChartDimensions.height || currentHeight,
  });

  return { dimensions, ref };
}

export default useChartDimensions;
