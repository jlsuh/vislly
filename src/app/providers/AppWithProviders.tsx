import type { JSX } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import ROUTES from '../routes/Routes.tsx';
import ThemeProvider from './ThemeProvider.tsx';

function AppWithProviders(): JSX.Element {
  return (
    <ThemeProvider>
      <RouterProvider router={createBrowserRouter(ROUTES)} />
    </ThemeProvider>
  );
}

export default AppWithProviders;
