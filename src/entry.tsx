import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/styles/entry.css';

ReactDOM.createRoot(document.getElementById('genesis') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
