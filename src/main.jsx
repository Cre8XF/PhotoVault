// ============================================================================
// main.jsx - Entry point with i18n support (Vite)
// ============================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles-enhanced.css'
import App from './App.jsx'
import './i18n'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister())
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
if (import.meta.env.DEV) console.log('ENV:', import.meta.env)
