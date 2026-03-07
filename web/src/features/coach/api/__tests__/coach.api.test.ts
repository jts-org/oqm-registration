/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
* @description Tests for coach API — registerCoachPin function.
 *   Written before implementation (TDD).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCoachPin } from '../coach.api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const BASE = 'https://script.google.com/test';
const TOKEN = 'test-token';

describe('registerCoachPin', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(
      registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' })
    ).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a POST request with correct shape', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: {} }),
    });
    await registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          route: 'registerCoachPin',
          payload: { firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' },
          token: TOKEN,
        }),
      })
    );
  });

  it('resolves when backend returns ok: true', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: 'abc' } }),
    });
    await expect(
      registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' })
    ).resolves.toBeUndefined();
  });

  it('throws "pin_reserved" when backend returns error "pin_reserved"', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'pin_reserved' }),
    });
    await expect(
      registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' })
    ).rejects.toThrow('pin_reserved');
  });

  it('throws with backend error message on other errors', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'Unauthorized' }),
    });
    await expect(
      registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' })
    ).rejects.toThrow('Unauthorized');
  });
});

import { verifyCoachPin } from '../coach.api';

describe('verifyCoachPin', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(verifyCoachPin('1234')).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a POST request with correct shape', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234', created_at: '2026-01-01T00:00:00Z', last_activity: '' } }),
    });
    await verifyCoachPin('1234');
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ route: 'verifyCoachPin', payload: { pin: '1234' }, token: TOKEN }),
      })
    );
  });

  it('returns coach data when backend returns ok: true', async () => {
    const coachData = { id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234', created_at: '2026-01-01T00:00:00Z', last_activity: '' };
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: coachData }) });
    await expect(verifyCoachPin('1234')).resolves.toEqual(coachData);
  });

  it('throws "no_match_found" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'no_match_found' }) });
    await expect(verifyCoachPin('9999')).rejects.toThrow('no_match_found');
  });

  it('throws with backend error message on other errors', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'Unauthorized' }) });
    await expect(verifyCoachPin('1234')).rejects.toThrow('Unauthorized');
  });
});
