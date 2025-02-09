import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithProviders from './AppWithProviders';
import './app/styles/entry.css';

ReactDOM.createRoot(document.getElementById('genesis') as HTMLElement).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>,
);
