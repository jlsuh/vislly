import type { JSX } from 'react';
import { BrowserRouter } from 'react-router';
import type { ReadonlyDeep } from 'type-fest';
import ThemeProvider from './ThemeProvider';

const PROVIDERS: ReadonlyDeep<
  Array<
    (props: {
      children: React.ReactNode;
    }) => JSX.Element
  >
> = [BrowserRouter, ThemeProvider];

export { PROVIDERS };
