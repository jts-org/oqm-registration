/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for trainee API functions.
 *   Written before implementation (TDD).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTraineeSessions, registerTraineeForSession, registerTraineePin } from '../trainee.api';
import type { RegisterTraineeForSessionPayload } from '../../types';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const BASE = 'https://script.google.com/test';
const TOKEN = 'test-token';

const validAdultPayload: RegisterTraineeForSessionPayload = {
  first_name: 'Jane',
  last_name: 'Doe',
  age_group: 'adult',
  session_type: 'BJJ',
  date: '2026-03-17',
  start_time: '10:00',
  end_time: '11:00',
};

const validUnderagePayload: RegisterTraineeForSessionPayload = {
  first_name: 'Junior',
  last_name: 'Doe',
  age_group: 'underage',
  underage_age: 12,
  session_type: 'BJJ',
  date: '2026-03-17',
  start_time: '10:00',
  end_time: '11:00',
};

describe('registerTraineePin', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a POST request with correct shape', async () => {
    const traineeData = {
      id: 'trainee-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '12',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    };
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: traineeData }),
    });

    await registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' });

    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          route: 'registerTraineePin',
          payload: { firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' },
          token: TOKEN,
        }),
      })
    );
  });

  it('returns trainee data when backend returns ok: true', async () => {
    const traineeData = {
      id: 'trainee-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '12',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    };
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: traineeData }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).resolves.toEqual(traineeData);
  });

  it('throws "pin_reserved" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'pin_reserved' }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('pin_reserved');
  });

  it('throws "name_already_exists" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'name_already_exists' }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('name_already_exists');
  });

  it('throws "concurrent_request" when backend returns that error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'concurrent_request' }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('concurrent_request');
  });

  it('throws backend error message on unauthorized responses', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'Unauthorized' }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('Unauthorized');
  });

  it('throws fallback error when backend returns ok false without error string', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false }),
    });

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('Registration failed');
  });

  it('propagates network failures', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));

    await expect(
      registerTraineePin({ firstname: 'Jane', lastname: 'Doe', age: '12', pin: '1234' })
    ).rejects.toThrow('network down');
  });
});

describe('registerTraineeForSession', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  // Test case: VITE_GAS_BASE_URL not configured
  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(
      registerTraineeForSession(validAdultPayload)
    ).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  // Test case: Correct POST request shape
  it('sends a POST request with correct shape for adult registration', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: 'row-uuid-123' } }),
    });
    await registerTraineeForSession(validAdultPayload);
    expect(mockFetch).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          route: 'registerTraineeForSession',
          payload: validAdultPayload,
          token: TOKEN,
        }),
      })
    );
  });

  // Test case: Successful adult registration returns row id
  it('returns row id when backend returns ok: true for adult', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: 'row-uuid-123' } }),
    });
    const result = await registerTraineeForSession(validAdultPayload);
    expect(result).toBe('row-uuid-123');
  });

  // Test case: Successful underage registration returns row id
  it('returns row id when backend returns ok: true for underage', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: 'row-uuid-456' } }),
    });
    const result = await registerTraineeForSession(validUnderagePayload);
    expect(result).toBe('row-uuid-456');
  });

  // Test case: Duplicate registration — already_registered
  it('throws Error("already_registered") when backend returns already_registered error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'already_registered' }),
    });
    await expect(
      registerTraineeForSession(validAdultPayload)
    ).rejects.toThrow('already_registered');
  });

  // Test case: Concurrent request
  it('throws Error("concurrent_request") when backend returns concurrent_request error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'concurrent_request' }),
    });
    await expect(
      registerTraineeForSession(validAdultPayload)
    ).rejects.toThrow('concurrent_request');
  });

  // Test case: Validation failed
  it('throws Error("validation_failed") when backend returns validation_failed error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'validation_failed' }),
    });
    await expect(
      registerTraineeForSession(validAdultPayload)
    ).rejects.toThrow('validation_failed');
  });

  // Test case: Underage age validation failed
  it('throws Error("validation_failed_age") when backend returns validation_failed_age error', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'validation_failed_age' }),
    });
    await expect(
      registerTraineeForSession(validUnderagePayload)
    ).rejects.toThrow('validation_failed_age');
  });

  // Test case: Generic backend error falls back to 'Registration failed'
  it('throws with fallback message when backend returns ok: false with no error string', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false }),
    });
    await expect(
      registerTraineeForSession(validAdultPayload)
    ).rejects.toThrow('Registration failed');
  });

  // Test case: Optional fields — camp_session_id is included in request body when provided
  it('includes optional camp_session_id in request body when provided', async () => {
    const payload: RegisterTraineeForSessionPayload = {
      ...validAdultPayload,
      camp_session_id: 'camp-session-abc',
    };
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: { id: 'row-uuid-789' } }),
    });
    await registerTraineeForSession(payload);
    const bodyArg = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodyArg.payload.camp_session_id).toBe('camp-session-abc');
  });
});

describe('getTraineeSessions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GAS_BASE_URL', BASE);
    vi.stubEnv('VITE_API_TOKEN', TOKEN);
    mockFetch.mockReset();
  });

  it('throws when VITE_GAS_BASE_URL is not configured', async () => {
    vi.stubEnv('VITE_GAS_BASE_URL', '');
    await expect(getTraineeSessions()).rejects.toThrow('VITE_GAS_BASE_URL is not configured');
  });

  it('sends a GET request with route=getTraineeSessions and token', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: [] }),
    });

    await getTraineeSessions();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}?route=getTraineeSessions&token=${encodeURIComponent(TOKEN)}`,
      expect.objectContaining({ method: 'GET', redirect: 'follow' })
    );
  });

  it('returns session list when backend returns ok true', async () => {
    const sessions = [
      {
        id: 'session-1',
        session_type: 'basic',
        session_type_alias: 'Basic',
        date: '2026-03-18',
        start_time: '18:00',
        end_time: '19:00',
        location: '',
        coach_firstname: '',
        coach_lastname: '',
        camp_instructor_name: '',
        is_free_sparring: false,
      },
    ];
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true, data: sessions }),
    });

    await expect(getTraineeSessions()).resolves.toEqual(sessions);
  });

  it('throws backend error code when backend returns ok false', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: 'Unauthorized' }),
    });

    await expect(getTraineeSessions()).rejects.toThrow('Unauthorized');
  });
});
