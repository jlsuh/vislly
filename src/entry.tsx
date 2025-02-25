import AppWithProviders from '@/app/providers/AppWithProviders.tsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/entry.css';

document.fonts.ready.then(() => {
  createRoot(document.getElementById('genesis') as HTMLElement).render(
    <React.StrictMode>
      <AppWithProviders />
    </React.StrictMode>,
  );
});
