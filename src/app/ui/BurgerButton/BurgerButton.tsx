import type { JSX } from 'react';
import BurgerIcon from '../BurgerIcon/BurgerIcon.tsx';
import CloseIcon from '../CloseIcon/CloseIcon.tsx';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './burger-button.module.css';

function BurgerButton(): JSX.Element {
  return (
    <IconButton inputID="burger-icon-button" sxInput={styles.burgerInput}>
      <BurgerIcon sx={styles.burgerIcon} />
      <CloseIcon sx={styles.closeIcon} />
    </IconButton>
  );
}

export default BurgerButton;
