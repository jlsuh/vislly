import Link from 'next/link';
import type { JSX } from 'react';

function NotFound(): JSX.Element {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}

export default NotFound;
