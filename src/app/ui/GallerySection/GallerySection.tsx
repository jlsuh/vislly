import brownianMotionImage from '@/../public/images/brownian-motion.jpg';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import styles from './gallery-section.module.css';

function GallerySection(): JSX.Element {
  return (
    <section className={styles.gallerySection}>
      <Link href="/brownian-motion">
        <figure
          style={{
            margin: 0,
          }}
        >
          <Image
            alt="Brownian Motion"
            src={brownianMotionImage}
            placeholder="blur"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          <figcaption>Brownian Motion 1</figcaption>
        </figure>
      </Link>
    </section>
  );
}

export default GallerySection;
