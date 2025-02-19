import { useEffect, useRef } from 'react';

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(() => {
    return;
  });

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick(): void {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return (): void => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
