import App from '@/app/App.tsx';
import ThemeProvider from '@/app/providers/ThemeProvider';
import '@/app/styles/entry.css';
import type { Metadata } from 'next';
import type { JSX, PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Visually',
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
