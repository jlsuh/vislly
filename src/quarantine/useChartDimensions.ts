import { type MutableRefObject, useEffect, useRef, useState } from 'react';

interface Dimensions {
  boundedHeight: number;
  boundedWidth: number;
  height: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  width: number;
}

function composeChartDimensions(dimensions: Dimensions) {
  return {
    ...dimensions,
    boundedHeight: Math.max(
      dimensions.height - dimensions.marginTop - dimensions.marginBottom,
      0,
    ),
    boundedWidth: Math.max(
      dimensions.width - dimensions.marginLeft - dimensions.marginRight,
      0,
    ),
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
