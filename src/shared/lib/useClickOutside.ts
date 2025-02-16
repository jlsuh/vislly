import { type RefObject, useEffect, useRef } from 'react';

function isNode(e: EventTarget | null): e is Node {
  if (!e || !('nodeType' in e)) return false;
  return true;
}

function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  addEventListener: boolean,
): void {
  const documentRef = useRef(document);

  const handleClick = (event: MouseEvent) => {
    const { target } = event;
    const shouldInvokeCallback =
      ref.current && isNode(target) && !ref.current.contains(target);
    if (shouldInvokeCallback) callback();
  };

  useEffect(() => {
    if (addEventListener)
      documentRef.current.addEventListener('click', handleClick);
    return () => documentRef.current.removeEventListener('click', handleClick);
  });
}

export default useClickOutside;
