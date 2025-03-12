import type { JSX, PropsWithChildren } from 'react';
import styles from './icon-button.module.css';

type IconButtonProps = PropsWithChildren<
  | {
      inputID: string;
      isCheckboxControlled: true;
      onChangeIconButton?: () => void;
      sxInput?: string;
      sxLabel?: string;
    }
  | {
      inputID?: never;
      isCheckboxControlled: false;
      onChangeIconButton?: () => void;
      sxInput?: never;
      sxLabel?: never;
    }
>;

function IconButton({
  children,
  inputID,
  isCheckboxControlled,
  onChangeIconButton,
  sxInput = '',
  sxLabel = '',
}: IconButtonProps): JSX.Element {
  return (
    <>
      {isCheckboxControlled ? (
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
      ) : (
        <div className={styles.iconButtonContainer}>{children}</div>
      )}
    </>
  );
}

export default IconButton;
