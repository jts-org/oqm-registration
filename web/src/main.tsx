/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Application entry point. Initialises i18n and wraps the
 *   component tree with the SettingsProvider so settings are fetched on startup.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import { SettingsProvider } from './app/providers/SettingsProvider'
import App from './App'
import './styles.css'
import { ThemeContext } from './app/providers/themeContext'
import { getTheme } from './theme.config'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeContext.Provider value={getTheme('kickboxing')}>
        <App />
      </ThemeContext.Provider>
    </SettingsProvider>
  </React.StrictMode>
)
