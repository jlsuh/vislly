import Link from 'next/link';
import type { JSX } from 'react';

export default function Home(): JSX.Element {
  return (
    <>
      <h1>Hello world!</h1>
      <h1>Hello world!</h1>
      <h1>g f</h1>
      <p>Hello world!</p>
      <br />
      <p>Hello world Mona!</p>
      <br />
      <i>Hello world!</i>
      <br />
      <b>Hello world!</b>
      <br />
      <p>Hello world!</p>
      <Link prefetch={false} href="/brownian-motion">
        Brownian Motion
      </Link>
    </>
  );
}
