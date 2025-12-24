import { type RefObject, useEffect, useRef, useState } from 'react';

interface ResizeDimensions {
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

function composeResizeDimensions({
  height,
  width,
}: ResizeDimensions): ResizeDimensions {
  return {
    height: Math.max(height, 0),
    width: Math.max(width, 0),
  };
}

function useResizeDimensions<T extends HTMLElement>(
  initialDimensions: ResizeDimensions,
): {
  dimensions: ResizeDimensions;
  resizeRef: RefObject<T | null>;
} {
  const [currentHeight, setCurrentHeight] = useState(initialDimensions.height);
  const [currentWidth, setCurrentWidth] = useState(initialDimensions.width);
  const resizeRef = useRef<T>(null);

  useEffect(() => {
    const element = resizeRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const { contentRect } = entries[0];
        setCurrentHeight((prev) =>
          prev !== contentRect.height ? contentRect.height : prev,
        );
        setCurrentWidth((prev) =>
          prev !== contentRect.width ? contentRect.width : prev,
        );
      });
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const dimensions = composeResizeDimensions({
    width: initialDimensions.width || currentWidth,
    height: initialDimensions.height || currentHeight,
  });

  return { dimensions, resizeRef };
}

export { useResizeDimensions, type ResizeDimensions };
