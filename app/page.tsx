import type { JSX } from 'react';
import GallerySection from '@/app/ui/GallerySection/GallerySection.tsx';
import styles from './page.module.css';

export default function Home(): JSX.Element {
  return (
    <div className={styles.home}>
      <h1>Gallery</h1>
      <GallerySection />
    </div>
  );
}
