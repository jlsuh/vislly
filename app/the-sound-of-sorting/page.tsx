import type { JSX } from 'react';
import TheSoundOfSorting from '@/entities/the-sound-of-sorting/ui/TheSoundOfSorting';
import styles from './page.module.css';

function TheSoundOfSortingPage(): JSX.Element {
  return (
    <article className={styles.theSoundOfSortingArticle}>
      <h1>The Sound of Sorting</h1>
      <TheSoundOfSorting />
    </article>
  );
}

export default TheSoundOfSortingPage;
