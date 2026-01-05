import type { JSX, MouseEvent, ReactNode, RefObject } from 'react';
import styles from './dialog.module.css';

type DialogProps = {
  children: ReactNode;
  dialogRef: RefObject<HTMLDialogElement | null>;
  footer?: ReactNode;
  header?: ReactNode;
  onClose?: () => void;
};

export function Dialog({
  children,
  dialogRef,
  footer,
  header,
  onClose,
}: DialogProps): JSX.Element {
  const handleDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
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
    <dialog
      className={styles.dialog}
      onClick={handleDialogClick}
      ref={dialogRef}
    >
      <div className={styles.container}>
        {header && <header className={styles.header}>{header}</header>}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
