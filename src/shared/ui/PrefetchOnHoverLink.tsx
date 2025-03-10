'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentPropsWithoutRef, JSX } from 'react';

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
      {...props}
      prefetch={false}
      onFocus={(e): void => {
        conditionalPrefetch();
        if (props.onFocus) {
          props.onFocus(e);
        }
      }}
      onPointerEnter={(e): void => {
        conditionalPrefetch();
        if (props.onPointerEnter) {
          props.onPointerEnter(e);
        }
      }}
      onTouchStart={(e): void => {
        conditionalPrefetch();
        if (props.onTouchStart) {
          props.onTouchStart(e);
        }
      }}
    />
  );
}

export default PrefetchOnHoverLink;
