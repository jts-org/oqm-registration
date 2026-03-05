/**
 * @copyright 2026 OQM Registration
 * @description Application entry point. Initialises i18n and wraps the
 *   component tree with the SettingsProvider so settings are fetched on startup.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import { SettingsProvider } from './app/providers/SettingsProvider'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
)
