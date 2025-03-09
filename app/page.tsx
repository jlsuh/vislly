import Link from 'next/link';
import type { JSX } from 'react';

export default function Home(): JSX.Element {
  return (
    <>
      <h1>Gallery</h1>
      <Link prefetch={false} href="/brownian-motion">
        Brownian Motion
      </Link>
    </>
  );
}
