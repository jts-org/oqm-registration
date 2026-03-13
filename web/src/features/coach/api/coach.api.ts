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
import type { CoachData, SessionItem, RegisterCoachForSessionPayload, RemoveCoachFromSessionPayload } from '../types';

/**
 * Register a new coach PIN code by posting to the GAS backend.
 * POST { route: "registerCoachPin", payload: RegisterPinData, token }
 * Returns the newly created CoachData on success (OQM-0010: used to pre-fill ConfirmCoachRegistrationDialog).
 * Throws Error('pin_reserved') if the PIN already exists in coach_login or trainee_login.
 * Throws other Errors for network/service failures.
 */
export async function registerCoachPin(data: RegisterPinData): Promise<CoachData> {
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
  return json.data as CoachData;
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

/**
 * Register a coach for a specific session.
 * POST { route: "registerCoachForSession", payload: RegisterCoachForSessionPayload, token }
 * Returns the new registration id on success.
 * Throws Error('already_taken') if a coach is already registered for that session and date.
 * Throws Error('unknown_coach') if the coach is not found in coach_login.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function registerCoachForSession(payload: RegisterCoachForSessionPayload): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerCoachForSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data.id as string;
}

/**
 * Remove a coach from a specific session (OQM-0009).
 * POST { route: "removeCoachFromSession", payload: RemoveCoachFromSessionPayload, token }
 * Returns the updated registration id on success.
 * Throws Error('concurrent_operation') if a concurrent script lock is held.
 * Throws Error('registration_not_found') if no realized registration matches.
 * Throws Error('session_available') if the matching registration is already realized=false.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function removeCoachFromSession(payload: RemoveCoachFromSessionPayload): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'removeCoachFromSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Removal failed');
  return json.data.id as string;
}
