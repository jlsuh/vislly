import type { JSX } from 'react';
import SortingAlgorithms from '@/entities/sorting-algorithms/ui/SortingAlgorithms.tsx';
import styles from './page.module.css';

function SortingAlgorithmsPage(): JSX.Element {
  return (
    <article className={styles.sortingAlgorithmsArticle}>
      <h1>Sorting Algorithms</h1>
      <SortingAlgorithms />
    </article>
  );
}

export default SortingAlgorithmsPage;
