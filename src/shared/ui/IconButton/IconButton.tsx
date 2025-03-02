import type { JSX, PropsWithChildren, RefObject } from 'react';
import styles from './icon-button.module.css';

type IconButton = PropsWithChildren<{
  inputID: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  inputStyles?: string;
  labelStyles?: string;
}>;

function IconButton({
  children,
  inputID,
  inputRef,
  inputStyles = '',
  labelStyles = '',
}: IconButton): JSX.Element {
  return (
    <label
      className={`${styles.iconButtonContainer} ${labelStyles}`}
      htmlFor={inputID}
    >
      <input
        className={`${styles.iconButtonInput} ${inputStyles}`}
        id={inputID}
        ref={inputRef}
        type="checkbox"
      />
      {children}
    </label>
  );
}

export default IconButton;
