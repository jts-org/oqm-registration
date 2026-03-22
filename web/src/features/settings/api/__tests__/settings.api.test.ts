/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for settings.api — written before implementation (TDD).
 *   Verifies route URL construction, response parsing, and error handling.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSettings } from '../settings.api';
import type { Setting } from '../../types';

const BASE = 'https://script.google.com/macros/s/TEST/exec';
const SESSION_TOKEN = 'admin-session-token';

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

describe('getSettings', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('calls the correct URL with route=getSettings and sessionToken', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: mockSettings }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await getSettings(SESSION_TOKEN);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('route=getSettings');
    expect(calledUrl).toContain(`sessionToken=${encodeURIComponent(SESSION_TOKEN)}`);
    expect(calledUrl).toContain(BASE);
  });

  it('uses GET with redirect follow', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: mockSettings }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await getSettings(SESSION_TOKEN);

    const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(options?.method).toBe('GET');
    expect(options?.redirect).toBe('follow');
  });

  it('returns parsed settings on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: mockSettings }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await getSettings(SESSION_TOKEN);
    expect(result).toEqual(mockSettings);
  });

  it('throws when backend returns ok: false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(getSettings(SESSION_TOKEN)).rejects.toThrow('Unauthorized');
  });

  it('throws when VITE_GAS_BASE_URL is not set', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(getSettings(SESSION_TOKEN)).rejects.toThrow('VITE_GAS_BASE_URL');
  });

  it('throws when sessionToken is missing', async () => {
    await expect(getSettings('')).rejects.toThrow('Unauthorized');
  });
});
