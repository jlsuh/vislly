import { type RefObject, useCallback, useRef } from 'react';

function useIsHoldingClickOnElement<T extends HTMLElement>(): {
  isPressedRef: RefObject<boolean>;
  pressTargetRef: (node: T | null) => void;
} {
  const isPressedRef = useRef(false);

  const pressTargetRef = useCallback((node: T | null) => {
    if (!node) {
      return;
    }
    const setTrue = () => {
      isPressedRef.current = true;
    };
    const setFalse = () => {
      isPressedRef.current = false;
    };
    node.addEventListener('mousedown', setTrue);
    node.addEventListener('mouseleave', setFalse);
    node.addEventListener('mouseup', setFalse);
    node.addEventListener('touchend', setFalse);
    node.addEventListener('touchstart', setTrue);
    return () => {
      node.removeEventListener('mousedown', setTrue);
      node.removeEventListener('mouseleave', setFalse);
      node.removeEventListener('mouseup', setFalse);
      node.removeEventListener('touchend', setFalse);
      node.removeEventListener('touchstart', setTrue);
    };
  }, []);

  return { isPressedRef, pressTargetRef };
}

export default useIsHoldingClickOnElement;
