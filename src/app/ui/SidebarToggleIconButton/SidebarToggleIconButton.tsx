import type { JSX } from 'react';
import BurgerIcon from '../BurgerIcon/BurgerIcon.tsx';
import CloseIcon from '../CloseIcon/CloseIcon.tsx';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './sidebar-toggle-icon-button.module.css';

function SidebarToggleButton(): JSX.Element {
  return (
    <IconButton inputID="sidebar-toggle-icon-button" sxInput={styles.input}>
      <BurgerIcon sx={styles.burgerIcon} />
      <CloseIcon sx={styles.closeIcon} />
    </IconButton>
  );
}

export default SidebarToggleButton;
