import { type RefObject, useEffect, useRef, useState } from 'react';

type ResizeDimensions = {
  boundedHeight: number;
  boundedWidth: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  /**
   * Will be set to the current height of the ref element if set to 0.
   * Otherwise, height will be fixed to the provided height.
   *
   * @see {@link useResizeDimensions}
   */
  height: number;
  /**
   * Will be set to the current width of the ref element if set to 0.
   * Otherwise, width will be fixed to the provided width.
   *
   * @see {@link useResizeDimensions}
   */
  width: number;
};

function composeResizeDimensions(
  dimensions: ResizeDimensions,
): ResizeDimensions {
  const { height, width, marginTop, marginRight, marginBottom, marginLeft } =
    dimensions;
  return {
    ...dimensions,
    boundedHeight: Math.max(height - marginTop - marginBottom, 0),
    boundedWidth: Math.max(width - marginLeft - marginRight, 0),
  };
}

function useResizeDimensions(initialDimensions: ResizeDimensions): {
  dimensions: ResizeDimensions;
  ref: RefObject<null>;
} {
  const [currentHeight, setCurrentHeight] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const ref = useRef(null);

  const initialResizeDimensions = composeResizeDimensions(initialDimensions);

  useEffect(() => {
    const element = ref.current ?? new Element();
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
    return (): void => resizeObserver.unobserve(element);
  }, [currentHeight, currentWidth]);

  const dimensions = composeResizeDimensions({
    ...initialResizeDimensions,
    width: initialResizeDimensions.width || currentWidth,
    height: initialResizeDimensions.height || currentHeight,
  });

  return { dimensions, ref };
}

export default useResizeDimensions;
