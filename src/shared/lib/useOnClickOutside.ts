import { type RefObject, useEffect, useRef } from 'react';

function isDOMNode(target: EventTarget | null): target is Node {
  return target instanceof Node;
}

function useOnClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClickOutsideContinuation: (e: Event) => void,
): void {
  const documentRef = useRef(document);

  useEffect(() => {
    const listener = (e: Event) => {
      const { target } = e;
      for (const ref of refs) {
        if (!ref.current) return;
        if (!isDOMNode(target)) return;
        if (ref.current.contains(target)) return;
      }
      onClickOutsideContinuation(e);
    };
    documentRef.current.addEventListener('click', listener, {
      capture: true,
    });
    documentRef.current.addEventListener('touchstart', listener, {
      capture: true,
    });
    return () => {
      documentRef.current.removeEventListener('click', listener, {
        capture: true,
      });
      documentRef.current.removeEventListener('touchstart', listener, {
        capture: true,
      });
    };
  }, [onClickOutsideContinuation, refs]);
}

export default useOnClickOutside;
