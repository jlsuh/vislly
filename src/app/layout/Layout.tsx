import type { JSX, PropsWithChildren } from 'react';
import Header from './Header.tsx';

export default function Layout({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
