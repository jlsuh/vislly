import { type RefObject, useEffect, useRef } from 'react';

function useIsHoldingClickOnElement(ref: RefObject<EventTarget | null>): {
  isHoldingClickRef: RefObject<boolean>;
} {
  const isHoldingClickRef = useRef(false);

  useEffect(() => {
    const setIsHoldingClickToTrue = () => {
      isHoldingClickRef.current = true;
    };
    const setIsHoldingClickToFalse = () => {
      isHoldingClickRef.current = false;
    };
    const element = ref.current ?? new Element();
    if (!element) {
      return;
    }
    element.addEventListener('mousedown', setIsHoldingClickToTrue);
    element.addEventListener('mouseleave', setIsHoldingClickToFalse);
    element.addEventListener('mouseup', setIsHoldingClickToFalse);
    element.addEventListener('touchend', setIsHoldingClickToFalse);
    element.addEventListener('touchstart', setIsHoldingClickToTrue);
    return () => {
      element.removeEventListener('mousedown', setIsHoldingClickToTrue);
      element.removeEventListener('mouseleave', setIsHoldingClickToFalse);
      element.removeEventListener('mouseup', setIsHoldingClickToFalse);
      element.removeEventListener('touchend', setIsHoldingClickToFalse);
      element.removeEventListener('touchstart', setIsHoldingClickToTrue);
    };
  }, [ref]);

  return { isHoldingClickRef };
}

export default useIsHoldingClickOnElement;
