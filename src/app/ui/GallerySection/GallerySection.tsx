import brownianMotionImage from '@/../public/images/brownian-motion.jpg';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import styles from './gallery-section.module.css';

function GallerySection(): JSX.Element {
  return (
    <section className={styles.gallerySection}>
      <Link href="/brownian-motion">
        <figure className={styles.figure}>
          <Image
            alt="Brownian Motion"
            className={styles.figureImage}
            placeholder="blur"
            priority={true}
            src={brownianMotionImage}
          />
          <figcaption>Brownian Motion 1</figcaption>
        </figure>
      </Link>
    </section>
  );
}

export default GallerySection;
