import Link from 'next/link';
import type { JSX } from 'react';

function NotFound(): JSX.Element {
  return (
    <div>
      <h1>Not Found</h1>
      <Link href="/">Return Home</Link>
    </div>
  );
}

export default NotFound;
