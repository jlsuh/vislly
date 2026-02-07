import type { JSX } from 'react';
import BarcodeSymbologies from '@/entities/barcode-symbologies/ui/BarcodeSymbologies';
import styles from './page.module.css';

function BarcodeSymbologiesPage(): JSX.Element {
  return (
    <article className={styles.barcodeSymbologiesArticle}>
      <h1>Barcode Symbologies</h1>
      <BarcodeSymbologies />
    </article>
  );
}

export default BarcodeSymbologiesPage;
