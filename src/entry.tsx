import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './app/styles/entry.css';

document.fonts.ready.then(() => {
  createRoot(document.getElementById('genesis') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
