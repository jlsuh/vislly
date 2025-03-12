import type { JSX, PropsWithChildren } from 'react';
import styles from './icon-button.module.css';

type IconButtonProps = PropsWithChildren<{
  inputID: string;
  onChangeIconButton?: () => void;
  sxInput?: string;
  sxLabel?: string;
}>;

function IconButton({
  children,
  inputID,
  onChangeIconButton,
  sxInput = '',
  sxLabel = '',
}: IconButtonProps): JSX.Element {
  return (
    <label
      className={`${styles.iconButtonContainer} ${sxLabel}`}
      htmlFor={inputID}
      onChange={onChangeIconButton}
    >
      <input
        className={`${styles.iconButtonInput} ${sxInput}`}
        id={inputID}
        type="checkbox"
      />
      {children}
    </label>
  );
}

export default IconButton;
