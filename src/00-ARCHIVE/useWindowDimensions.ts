import { useEffect, useState } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions(): {
  width: number;
  height: number;
} {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    globalThis.addEventListener('resize', handleResize, { capture: true });
    return () =>
      globalThis.removeEventListener('resize', handleResize, { capture: true });
  }, []);

  return windowDimensions;
}

export default useWindowDimensions;
