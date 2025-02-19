import { useEffect, useState } from 'react';

function getWindowDimensions(): {
  width: number;
  height: number;
} {
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
    function handleResize(): void {
      setWindowDimensions(getWindowDimensions());
    }
    globalThis.addEventListener('resize', handleResize, { capture: true });
    return (): void =>
      globalThis.removeEventListener('resize', handleResize, { capture: true });
  }, []);

  return windowDimensions;
}

export default useWindowDimensions;
