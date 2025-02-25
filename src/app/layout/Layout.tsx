import type { JSX } from 'react';
import { Outlet } from 'react-router';
import Header from './Header.tsx';

export default function Layout(): JSX.Element {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
