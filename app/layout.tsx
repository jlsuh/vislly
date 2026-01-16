import App from '@/app/layout/App.tsx';
import ThemeProvider from '@/app/providers/ThemeProvider.tsx';
import '@/app/styles/entry.css';
import type { Metadata } from 'next';
import type { JSX, PropsWithChildren } from 'react';

const metadata: Metadata = {
  title: 'Vislly',
  icons: {
    icon: [
      {
        href: '/vislly/favicon-dark.svg',
        media: '(prefers-color-scheme: dark)',
        url: '/vislly/favicon-dark.svg',
      },
      {
        href: '/vislly/favicon-light.svg',
        media: '(prefers-color-scheme: light)',
        url: '/vislly/favicon-light.svg',
      },
    ],
  },
};

function RootLayout({ children }: PropsWithChildren): JSX.Element {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <App>{children}</App>
        </ThemeProvider>
      </body>
    </html>
  );
}

export { RootLayout as default, metadata };
