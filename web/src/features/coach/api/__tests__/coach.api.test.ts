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
    const coachData = { id: 'abc', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234', created_at: '2026-01-01T00:00:00Z', last_activity: '' };
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: coachData }),
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

  it('returns CoachData when backend returns ok: true', async () => {
    const coachData = { id: 'abc', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234', created_at: '2026-01-01T00:00:00Z', last_activity: '' };
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: coachData }),
    });
    await expect(
      registerCoachPin({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' })
    ).resolves.toEqual(coachData);
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

import { getCoachSessions } from '../coach.api';

const mockSessionItem = {
  id: 'ws-1_2026-03-09',
  session_type: 'Kickboxing',
  session_type_alias: 'Nyrkkeilyharjoitus',
  date: '2026-03-09',
  start_time: '18:00',
  end_time: '19:30',
  location: 'Gym A',
  coach_firstname: '',
  coach_lastname: '',
  coach_alias: '',
  registration_id: '',
  is_free_sparring: false,
};

describe('getCoachSessions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(getCoachSessions()).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a GET request with route=getCoachSessions and token', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: [] }),
    });
    await getCoachSessions();
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}?route=getCoachSessions&token=${encodeURIComponent(TOKEN)}`,
      expect.objectContaining({ method: 'GET', redirect: 'follow' })
    );
  });

  it('returns array of SessionItem on success', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: [mockSessionItem] }),
    });
    const result = await getCoachSessions();
    expect(result).toEqual([mockSessionItem]);
  });

  it('throws error message from backend on failure', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'Unauthorized' }),
    });
    await expect(getCoachSessions()).rejects.toThrow('Unauthorized');
  });

  it('throws generic error when backend returns ok: false with no error message', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false }),
    });
    await expect(getCoachSessions()).rejects.toThrow('Failed to fetch sessions');
  });
});

import { registerCoachForSession } from '../coach.api';

describe('registerCoachForSession', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(
      registerCoachForSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a POST request with correct shape', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: { id: 'new-uuid' } }) });
    const payload = { firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' };
    await registerCoachForSession(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ route: 'registerCoachForSession', payload, token: TOKEN }),
      })
    );
  });

  it('sends optional start_time and end_time for free/sparring sessions', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: { id: 'new-uuid' } }) });
    const payload = { firstname: 'John', lastname: 'Doe', session_type: 'free/sparring', date: '2026-03-09', start_time: '10:00', end_time: '11:30' };
    await registerCoachForSession(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        body: JSON.stringify({ route: 'registerCoachForSession', payload, token: TOKEN }),
      })
    );
  });

  it('returns registration id when backend returns ok: true', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: { id: 'reg-123' } }) });
    const result = await registerCoachForSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' });
    expect(result).toBe('reg-123');
  });

  it('throws "already_taken" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'already_taken' }) });
    await expect(
      registerCoachForSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('already_taken');
  });

  it('throws "unknown_coach" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'unknown_coach' }) });
    await expect(
      registerCoachForSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('unknown_coach');
  });

  it('throws with backend error message on other errors', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'Unauthorized' }) });
    await expect(
      registerCoachForSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('Unauthorized');
  });
});

import { removeCoachFromSession } from '../coach.api';

describe('removeCoachFromSession', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(
      removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a POST request with correct shape', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: { id: 'reg-1' } }) });
    const payload = { firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' };
    await removeCoachFromSession(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ route: 'removeCoachFromSession', payload, token: TOKEN }),
      })
    );
  });

  it('returns registration id when backend returns ok: true', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: true, data: { id: 'reg-1' } }) });
    const result = await removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' });
    expect(result).toBe('reg-1');
  });

  it('throws "concurrent_operation" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'concurrent_operation' }) });
    await expect(
      removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('concurrent_operation');
  });

  it('throws "registration_not_found" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'registration_not_found' }) });
    await expect(
      removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('registration_not_found');
  });

  it('throws "session_available" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'session_available' }) });
    await expect(
      removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('session_available');
  });

  it('throws with backend error message on other errors', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ ok: false, error: 'Unauthorized' }) });
    await expect(
      removeCoachFromSession({ firstname: 'John', lastname: 'Doe', session_type: 'Kickboxing', date: '2026-03-09' })
    ).rejects.toThrow('Unauthorized');
  });
});
