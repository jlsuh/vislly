import { type RefObject, useEffect } from 'react';

function isDomNode(target: EventTarget | null): target is Node {
  return target instanceof Node;
}

function useOnClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClickOutsideContinuation: (e: Event) => void,
): void {
  useEffect(() => {
    const listener = (e: Event): void => {
      const { target } = e;
      for (const ref of refs) {
        if (!isDomNode(target)) {
          return;
        }
        if (ref.current?.contains(target)) {
          return;
        }
      }
      onClickOutsideContinuation(e);
    };
    document.addEventListener('click', listener, {
      capture: true,
    });
    document.addEventListener('touchstart', listener, {
      capture: true,
    });
    return () => {
      document.removeEventListener('click', listener, {
        capture: true,
      });
      document.removeEventListener('touchstart', listener, {
        capture: true,
      });
    };
  }, [onClickOutsideContinuation, refs]);
}

export default useOnClickOutside;
