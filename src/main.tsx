import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './app/styles/globals.css';

ReactDOM.createRoot(document.getElementById('genesis') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
