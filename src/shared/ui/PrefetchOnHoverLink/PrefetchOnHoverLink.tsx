'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  ComponentPropsWithoutRef,
  FocusEvent,
  JSX,
  PointerEvent,
  TouchEvent,
} from 'react';
import styles from './prefetch-on-hover-link.module.css';

type PrefetchOnHoverLinkProps = ComponentPropsWithoutRef<typeof Link>;

function PrefetchOnHoverLink(props: PrefetchOnHoverLinkProps): JSX.Element {
  const router = useRouter();
  const strHref = typeof props.href === 'string' ? props.href : props.href.href;

  const conditionalPrefetch = (): void => {
    if (strHref) {
      router.prefetch(strHref);
    }
  };

  return (
    <Link
      className={styles.prefetchOnHoverLink}
      {...props}
      prefetch={false}
      onFocus={(e: FocusEvent<HTMLAnchorElement, Element>): void => {
        conditionalPrefetch();
        if (props.onFocus) {
          props.onFocus(e);
        }
      }}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>): void => {
        conditionalPrefetch();
        if (props.onPointerEnter) {
          props.onPointerEnter(e);
        }
      }}
      onTouchStart={(e: TouchEvent<HTMLAnchorElement>): void => {
        conditionalPrefetch();
        if (props.onTouchStart) {
          props.onTouchStart(e);
        }
      }}
    />
  );
}

export default PrefetchOnHoverLink;
