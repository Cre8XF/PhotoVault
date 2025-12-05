// ============================================================================
// main.jsx - Entry point with i18n support (Vite)
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles-enhanced.css';
import App from './App.js';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('ENV:', import.meta.env);
