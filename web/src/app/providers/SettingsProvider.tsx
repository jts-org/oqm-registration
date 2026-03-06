/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description SettingsProvider — fetches application settings on startup and
 *   makes them available to all child components via React context.
 *   Also persists settings in sessionStorage for the duration of the session.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getSettings } from '../../features/settings/api/settings.api';
import type { Setting, SettingsContextValue } from '../../features/settings/types';

const SESSION_KEY = 'oqm_settings';

export const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Hook to access settings from any component in the tree. */
export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}

/**
 * Wraps the application and fetches settings from the GAS backend on startup.
 * Settings are kept in sessionStorage for the duration of the browser session.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Setting[]>(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      return cached ? (JSON.parse(cached) as Setting[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, reload: load }}>
      {children}
    </SettingsContext.Provider>
  );
}
