import { useEffect, useRef, useState } from 'react';

export type Dimensions = {
  height: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  width: number;
};

function combineChartDimensions(dimensions: Dimensions) {
  const parsedDimensions = {
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 30,
    ...dimensions,
  };

  return {
    ...parsedDimensions,
    boundedHeight: Math.max(
      parsedDimensions.height -
        parsedDimensions.marginTop -
        parsedDimensions.marginBottom,
      0,
    ),
    boundedWidth: Math.max(
      parsedDimensions.width -
        parsedDimensions.marginLeft -
        parsedDimensions.marginRight,
      0,
    ),
  };
}

function useChartDimensions(dimensions: Dimensions) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  const combinedDimensions = combineChartDimensions(dimensions);

  useEffect(() => {
    if (combinedDimensions.width && combinedDimensions.height) return;
    const element = ref.current ?? new HTMLDivElement();
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }
      if (!entries.length) {
        return;
      }
      const entry = entries[0];
      if (width !== entry.contentRect.width) {
        setWidth(entry.contentRect.width);
      }
      if (height !== entry.contentRect.height) {
        setHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [combinedDimensions.height, combinedDimensions.width, height, width]);

  const newDimensions = combineChartDimensions({
    ...combinedDimensions,
    width: combinedDimensions.width || width,
    height: combinedDimensions.height || height,
  });

  return { newDimensions, ref };
}

export default useChartDimensions;
