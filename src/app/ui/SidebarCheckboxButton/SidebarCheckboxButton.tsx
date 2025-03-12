import type { JSX } from 'react';
import BurgerIcon from '../BurgerIcon/BurgerIcon.tsx';
import CheckboxButton from '../CheckboxButton/CheckboxButton.tsx';
import CloseIcon from '../CloseIcon/CloseIcon.tsx';
import styles from './sidebar-checkbox-button.module.css';

type SidebarCheckboxButtonProps = {
  sxInput: string;
};

function SidebarCheckboxButton({
  sxInput,
}: SidebarCheckboxButtonProps): JSX.Element {
  return (
    <CheckboxButton
      inputID="sidebar-toggle-icon-button"
      sxInput={`${styles.input} ${sxInput}`}
      sxLabel={styles.label}
    >
      <BurgerIcon sx={styles.burgerIcon} />
      <CloseIcon sx={styles.closeIcon} />
    </CheckboxButton>
  );
}

export default SidebarCheckboxButton;
