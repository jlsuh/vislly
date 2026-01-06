import type { JSX } from 'react';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import styles from './page.module.css';

function BrownianMotionPage(): JSX.Element {
  return (
    <article className={styles.brownianMotionArticle}>
      <h1>Brownian Motion</h1>
      <BrownianMotion />
    </article>
  );
}

export default BrownianMotionPage;
