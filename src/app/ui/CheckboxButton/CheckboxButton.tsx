import type { JSX, PropsWithChildren } from 'react';
import styles from './checkbox-button.module.css';

type CheckboxButtonProps = PropsWithChildren<{
  inputID: string;
  onChangeCheckboxButton?: () => void;
  sxInput?: string;
  sxLabel?: string;
}>;

function CheckboxButton({
  children,
  inputID,
  onChangeCheckboxButton,
  sxInput = '',
  sxLabel = '',
}: CheckboxButtonProps): JSX.Element {
  return (
    <label
      className={`${styles.checkboxButtonContainer} ${sxLabel}`}
      htmlFor={inputID}
      onChange={onChangeCheckboxButton}
    >
      <input
        className={`${styles.checkboxButtonInput} ${sxInput}`}
        id={inputID}
        type="checkbox"
      />
      {children}
    </label>
  );
}

export default CheckboxButton;
