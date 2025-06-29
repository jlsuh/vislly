import type { JSX } from 'react';
import BurgerIcon from '../BurgerIcon/BurgerIcon.tsx';
import CloseIcon from '../CloseIcon/CloseIcon.tsx';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './sidebar-icon-button.module.css';

type SidebarIconButtonProps = {
  sxInput: string;
};

function SidebarIconButton({ sxInput }: SidebarIconButtonProps): JSX.Element {
  return (
    <IconButton
      inputId="sidebar-toggle-icon-button"
      isCheckboxControlled={true}
      sxInput={`${styles.input} ${sxInput}`}
      sxLabel={styles.label}
    >
      <BurgerIcon sx={styles.burgerIcon} />
      <CloseIcon sx={styles.closeIcon} />
    </IconButton>
  );
}

export default SidebarIconButton;
