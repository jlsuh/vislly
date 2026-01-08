import type { JSX } from 'react';
import GallerySection from '@/app/ui/GallerySection/GallerySection.tsx';
import styles from './page.module.css';

function HomePage(): JSX.Element {
  return (
    <div className={styles.home}>
      <GallerySection />
    </div>
  );
}

export default HomePage;
