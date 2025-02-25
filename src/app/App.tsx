import type { JSX } from 'react';
import { RouterProvider } from 'react-router';
import ThemeProvider from './providers/ThemeProvider.tsx';
import ROUTER from './routes/router.tsx';

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <RouterProvider router={ROUTER} />
    </ThemeProvider>
  );
}

export default App;
