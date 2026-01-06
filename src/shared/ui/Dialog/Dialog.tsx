import type { JSX, MouseEvent, ReactNode } from 'react';
import styles from './dialog.module.css';

type DialogProps = {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  id: string;
  onClose?: () => void;
};

export function Dialog({
  children,
  footer,
  header,
  id,
  onClose,
}: DialogProps): JSX.Element {
  const handleOnClickBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    const dialog = e.currentTarget;
    const { top, height, left, width } = dialog.getBoundingClientRect();
    const { clientX, clientY } = e;
    const hasClickedWithinDialog =
      clientY >= top &&
      clientY <= top + height &&
      clientX >= left &&
      clientX <= left + width;
    if (!hasClickedWithinDialog) {
      dialog.close();
      if (onClose !== undefined) {
        onClose();
      }
    }
  };

  return (
    <dialog className={styles.dialog} id={id} onClick={handleOnClickBackdrop}>
      <div className={styles.container}>
        {header && <header className={styles.header}>{header}</header>}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
