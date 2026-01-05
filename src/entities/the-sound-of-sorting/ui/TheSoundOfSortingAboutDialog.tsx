import type { JSX, RefObject } from 'react';
import Button from '@/shared/ui/Button/Button.tsx';
import CrossIcon from '@/shared/ui/CrossIcon/CrossIcon';
import { Dialog } from '@/shared/ui/Dialog/Dialog.tsx';
import { Divider } from '@/shared/ui/Divider/Divider.tsx';
import styles from './the-sound-of-sorting-about-dialog.module.css';

type TheSoundOfSortingAboutDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
};

export function TheSoundOfSortingAboutDialog({
  dialogRef,
}: TheSoundOfSortingAboutDialogProps): JSX.Element {
  const handleOnClickCloseButton = () => {
    if (dialogRef.current !== null) {
      dialogRef.current.close();
    }
  };

  return (
    <Dialog
      dialogRef={dialogRef}
      footer={
        <Button
          icon={<CrossIcon />}
          label="Close"
          onClick={handleOnClickCloseButton}
          variant="secondary"
        />
      }
      header={<h2 className={styles.aboutTitle}>About The Sound of Sorting</h2>}
    >
      <p className={styles.aboutParagraph}>
        This application is a modern web implementation of{' '}
        <strong>The Sound of Sorting</strong>, a visualization and
        &quot;audibilization&quot; of internal sorting algorithm behaviors.
      </p>
      <p className={styles.aboutParagraph}>
        It is designed to make these educational visualizations accessible
        directly in the browser, faithfully recreating the mechanics of the
        original software.
      </p>
      <Divider paddingVertical="sm" />
      <div className={styles.legalNotice}>
        <span className={styles.legalNoticeTitle}>Original Attribution</span>
        <p>
          The original concept and software were created by{' '}
          <strong>Timo Bingmann</strong> (2013).
        </p>
        <p>
          The original source code is open-source and licensed under the{' '}
          <strong>GNU General Public License v3.0 (GPLv3)</strong>.
        </p>
        <ul>
          <li>
            <a
              className={styles.aboutLink}
              href="https://panthema.net/2013/sound-of-sorting/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Official Project Website
            </a>
          </li>
          <li>
            <a
              className={styles.aboutLink}
              href="https://github.com/bingmann/sound-of-sorting"
              rel="noopener noreferrer"
              target="_blank"
            >
              Original Repository (GitHub)
            </a>
          </li>
        </ul>
      </div>
    </Dialog>
  );
}
