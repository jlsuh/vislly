import { useEffect, useRef, useState } from 'react';

export type Dimensions = {
  height: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  width: number;
};

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

function useChartDimensions(dimensions: Dimensions) {
  const [currentHeight, setCurrentHeight] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const ref = useRef(null);

  const chartDimensions = composeChartDimensions(dimensions);

  useEffect(() => {
    const element = ref.current ?? new HTMLDivElement();
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

  const newDimensions = composeChartDimensions({
    ...chartDimensions,
    width: chartDimensions.width || currentWidth,
    height: chartDimensions.height || currentHeight,
  });

  return { newDimensions, ref };
}

export default useChartDimensions;
