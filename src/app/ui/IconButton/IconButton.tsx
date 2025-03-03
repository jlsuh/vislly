import type { JSX, PropsWithChildren, RefObject } from 'react';
import styles from './icon-button.module.css';

type IconButton = PropsWithChildren<{
  inputID: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  sxInput?: string;
  sxLabel?: string;
}>;

function IconButton({
  children,
  inputID,
  inputRef,
  sxInput = '',
  sxLabel = '',
}: IconButton): JSX.Element {
  return (
    <label
      className={`${styles.iconButtonContainer} ${sxLabel}`}
      htmlFor={inputID}
    >
      <input
        className={`${styles.iconButtonInput} ${sxInput}`}
        id={inputID}
        ref={inputRef}
        type="checkbox"
      />
      {children}
    </label>
  );
}

export default IconButton;
