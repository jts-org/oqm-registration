/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for SettingsProvider — written before full implementation (TDD).
 *   Verifies startup fetch, context availability, loading state, and error handling.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsProvider, useSettingsContext } from '../SettingsProvider';
import type { Setting } from '../../../features/settings/types';

// Mock the settings API module
vi.mock('../../../features/settings/api/settings.api', () => ({
  getSettings: vi.fn(),
}));

import { getSettings } from '../../../features/settings/api/settings.api';

const mockSettings: Setting[] = [
  {
    id: '1',
    parameter: 'theme',
    value: 'light',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    purpose: 'UI theme',
  },
];

/** Helper component that reads from context */
function Consumer() {
  const { settings, loading, error, reload } = useSettingsContext();
  return (
    <div>
      {loading && <p>loading</p>}
      {error && <p>error: {error}</p>}
      {!loading && !error && <p>count: {settings.length}</p>}
      <button onClick={reload}>reload</button>
    </div>
  );
}

describe('SettingsProvider', () => {
  beforeEach(() => {
    vi.mocked(getSettings).mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children and shows loading state initially', async () => {
    sessionStorage.setItem('oqm_admin_session_token', 'admin-session-token');
    vi.mocked(getSettings).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSettings), 100))
    );

    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('provides settings to consumers after successful fetch', async () => {
    sessionStorage.setItem('oqm_admin_session_token', 'admin-session-token');
    vi.mocked(getSettings).mockResolvedValueOnce(mockSettings);

    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());
  });

  it('surfaces error message when fetch fails', async () => {
    sessionStorage.setItem('oqm_admin_session_token', 'admin-session-token');
    vi.mocked(getSettings).mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByText('count: 0')).toBeInTheDocument());
  });

  it('re-fetches settings when reload is called', async () => {
    sessionStorage.setItem('oqm_admin_session_token', 'admin-session-token');
    vi.mocked(getSettings)
      .mockResolvedValueOnce(mockSettings)
      .mockResolvedValueOnce([...mockSettings, { ...mockSettings[0], id: '2', parameter: 'lang', value: 'en' }]);

    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /reload/i }));

    await waitFor(() => expect(screen.getByText('count: 2')).toBeInTheDocument());
  });

  it('stores settings in sessionStorage for the duration of the session', async () => {
    sessionStorage.setItem('oqm_admin_session_token', 'admin-session-token');
    vi.mocked(getSettings).mockResolvedValueOnce(mockSettings);

    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());

    const stored = sessionStorage.getItem('oqm_settings');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(mockSettings);
  });

  it('throws when useSettingsContext is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('useSettingsContext must be used within SettingsProvider');
    consoleSpy.mockRestore();
  });

  it('does not fetch settings when admin session token is missing', async () => {
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByText('count: 0')).toBeInTheDocument());
    expect(getSettings).not.toHaveBeenCalled();
  });
});
