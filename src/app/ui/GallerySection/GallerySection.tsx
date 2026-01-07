import Image from 'next/image';
import type { JSX } from 'react';
import brownianMotion from '@/../public/images/brownian-motion.webp';
import pathfinding from '@/../public/images/pathfinding.webp';
import theSoundOfSorting from '@/../public/images/the-sound-of-sorting.webp';
import PrefetchOnHoverLink from '@/shared/ui/PrefetchOnHoverLink/PrefetchOnHoverLink.tsx';
import styles from './gallery-section.module.css';

function GallerySection(): JSX.Element {
  return (
    <section className={styles.gallerySection}>
      <PrefetchOnHoverLink href="/the-sound-of-sorting">
        <figure className={styles.figure}>
          <Image
            alt="The Sound of Sorting"
            className={styles.figureImage}
            placeholder="blur"
            priority={true}
            src={theSoundOfSorting}
          />
          <figcaption className={styles.figureCaption}>
            The Sound of Sorting
          </figcaption>
        </figure>
      </PrefetchOnHoverLink>
      <PrefetchOnHoverLink href="/pathfinding">
        <figure className={styles.figure}>
          <Image
            alt="Pathfinding"
            className={styles.figureImage}
            placeholder="blur"
            priority={true}
            src={pathfinding}
          />
          <figcaption className={styles.figureCaption}>Pathfinding</figcaption>
        </figure>
      </PrefetchOnHoverLink>
      <PrefetchOnHoverLink href="/brownian-motion">
        <figure className={styles.figure}>
          <Image
            alt="Brownian Motion"
            className={styles.figureImage}
            placeholder="blur"
            priority={true}
            src={brownianMotion}
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
