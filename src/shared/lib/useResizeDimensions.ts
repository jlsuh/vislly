import { type RefObject, useEffect, useRef, useState } from 'react';

interface InitialResizeDimensions {
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  /**
   * Will be set to the current height of the ref element if set to 0.
   * Otherwise, height will be fixed to the provided height.
   * @see {@link useResizeDimensions}
   */
  height: number;
  /**
   * Will be set to the current width of the ref element if set to 0.
   * Otherwise, width will be fixed to the provided width.
   * @see {@link useResizeDimensions}
   */
  width: number;
}

interface BoundedResizeDimensions extends InitialResizeDimensions {
  boundedHeight: number;
  boundedWidth: number;
}

function composeResizeDimensions(
  dimensions: InitialResizeDimensions,
): BoundedResizeDimensions {
  const { height, width, marginTop, marginRight, marginBottom, marginLeft } =
    dimensions;
  return {
    ...dimensions,
    boundedHeight: Math.max(height - marginTop - marginBottom, 0),
    boundedWidth: Math.max(width - marginLeft - marginRight, 0),
  };
}

function useResizeDimensions<T = Element>(
  initialDimensions: InitialResizeDimensions,
): {
  dimensions: BoundedResizeDimensions;
  resizeRef: RefObject<T | null>;
} {
  const [currentHeight, setCurrentHeight] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const resizeRef = useRef(null);

  useEffect(() => {
    const element = resizeRef.current ?? new Element();
    const resizeObserver = new ResizeObserver((entries) => {
      const { contentRect } = entries[0];
      if (currentHeight !== contentRect.height) {
        setCurrentHeight(contentRect.height);
      }
      if (currentWidth !== contentRect.width) {
        setCurrentWidth(contentRect.width);
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [currentHeight, currentWidth]);

  const initialResizeDimensions = composeResizeDimensions(initialDimensions);

  const dimensions = composeResizeDimensions({
    ...initialResizeDimensions,
    width: initialResizeDimensions.width || currentWidth,
    height: initialResizeDimensions.height || currentHeight,
  });

  return { dimensions, resizeRef };
}

export { useResizeDimensions, type InitialResizeDimensions };
