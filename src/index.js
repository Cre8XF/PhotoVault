// ============================================================================
// index.js - Entry point with i18n support
// FASE 3.5: Flerspråklig støtte
// ============================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import i18n configuration (must be before App)
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
