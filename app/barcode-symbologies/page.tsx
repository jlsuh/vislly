import type { JSX } from 'react';
import styles from './page.module.css';

function BarcodeSymbologiesPage(): JSX.Element {
  return (
    <article className={styles.barcodeSymbologiesArticle}>
      <h1>Barcode Symbologies</h1>
    </article>
  );
}

export default BarcodeSymbologiesPage;
