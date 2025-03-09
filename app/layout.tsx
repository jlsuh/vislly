import App from '@/app/layout/App.tsx';
import ThemeProvider from '@/app/providers/ThemeProvider';
import '@/app/styles/entry.css';
import type { Metadata } from 'next';
import type { JSX, PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Vislly',
};

export default function RootLayout({
  children,
}: Readonly<PropsWithChildren>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta content="dark light" name="color-scheme" />
      </head>
      <body>
        <ThemeProvider>
          <App>{children}</App>
        </ThemeProvider>
      </body>
    </html>
  );
}
