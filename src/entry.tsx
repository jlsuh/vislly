import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithProviders from './AppWithProviders.tsx';
import './app/styles/entry.css';

document.fonts.ready.then(() => {
  ReactDOM.createRoot(document.getElementById('genesis') as HTMLElement).render(
    <React.StrictMode>
      <AppWithProviders />
    </React.StrictMode>,
  );
});
