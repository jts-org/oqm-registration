/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description API functions for coach registration and PIN verification.
 *   Calls the GAS backend routes as defined in SKILL.wire-react-to-gas.md.
 *   Env vars are read inside each function so vi.stubEnv works correctly in tests.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import type { RegisterPinData } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import type { CoachData, SessionItem } from '../types';

/**
 * Register a new coach PIN code by posting to the GAS backend.
 * POST { route: "registerCoachPin", payload: RegisterPinData, token }
 * Throws Error('pin_reserved') if the PIN already exists in coach_login or trainee_login.
 * Throws other Errors for network/service failures.
 */
export async function registerCoachPin(data: RegisterPinData): Promise<void> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerCoachPin', payload: data, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
}

/**
 * Verify a coach PIN code against the GAS backend.
 * POST { route: "verifyCoachPin", payload: { pin }, token }
 * Returns the coach's data on success.
 * Throws Error('no_match_found') if the PIN does not match any coach.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function verifyCoachPin(pin: string): Promise<CoachData> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'verifyCoachPin', payload: { pin }, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Verification failed');
  return json.data as CoachData;
}

/**
 * Fetch all coach sessions for the 21-day window (7 days prior to this week's Monday, 14 days forward).
 * GET ?route=getCoachSessions&token=...
 * Returns array of SessionItem objects sorted by date and start_time.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function getCoachSessions(): Promise<SessionItem[]> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getCoachSessions&token=${encodeURIComponent(token || '')}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to fetch sessions');
  return json.data as SessionItem[];
}
