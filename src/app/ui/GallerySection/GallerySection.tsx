import brownianMotionImage from '@/../public/images/brownian-motion.jpg';
import PrefetchOnHoverLink from '@/shared/ui/PrefetchOnHoverLink/PrefetchOnHoverLink';
import Image from 'next/image';
import type { JSX } from 'react';
import styles from './gallery-section.module.css';

function GallerySection(): JSX.Element {
  return (
    <section className={styles.gallerySection}>
      <PrefetchOnHoverLink href="/brownian-motion">
        <figure className={styles.figure}>
          <Image
            alt="Brownian Motion"
            className={styles.figureImage}
            placeholder="blur"
            priority={true}
            src={brownianMotionImage}
          />
          <figcaption className={styles.figureCaption}>
            Brownian Motion
          </figcaption>
        </figure>
      </PrefetchOnHoverLink>
    </section>
  );
}

export default GallerySection;
