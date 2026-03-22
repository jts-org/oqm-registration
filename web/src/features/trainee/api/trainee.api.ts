/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description API functions for trainee registration (OQM-0014).
 *   Calls the GAS backend routes as defined in SKILL.wire-react-to-gas.md.
 *   Env vars are read inside each function so vi.stubEnv works correctly in tests.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import type {
  RegisterTraineeForSessionPayload,
  RegisterTraineePinData,
  TraineeData,
  TraineeSessionItem,
} from '../types';

/**
 * Register a new trainee PIN code by posting to the GAS backend.
 * POST { route: "registerTraineePin", payload: RegisterTraineePinData }
 * Returns the newly created TraineeData on success.
 * Throws Error('pin_reserved') if the PIN already exists in coach_login or trainee_login.
 * Throws Error('name_already_exists') if a trainee with the same name already exists.
 * Throws Error('concurrent_request') if the backend script lock cannot be acquired.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function registerTraineePin(data: RegisterTraineePinData): Promise<TraineeData> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerTraineePin', payload: data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data as TraineeData;
}

/**
 * Verify a trainee PIN code against the GAS backend.
 * POST { route: "verifyTraineePin", payload: { pin } }
 * Returns trainee-shaped data on success.
 * Backend checks trainee_login first and then coach_login as fallback (OQM-0023).
 * Throws Error('no_match_found') if the PIN does not match any trainee or coach.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function verifyTraineePin(pin: string): Promise<TraineeData> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'verifyTraineePin', payload: { pin } }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Verification failed');
  return json.data as TraineeData;
}

/**
 * Fetch all trainee sessions for the active 21-day registration window.
 * GET ?route=getTraineeSessions
 * Returns array of TraineeSessionItem sorted by date and start_time.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function getTraineeSessions(): Promise<TraineeSessionItem[]> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getTraineeSessions`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to fetch sessions');
  return json.data as TraineeSessionItem[];
}

/**
 * Register a trainee for a specific session by posting to the GAS backend.
 * POST { route: "registerTraineeForSession", payload: RegisterTraineeForSessionPayload }
 * Returns the new row id (string) on success.
 * Throws Error('already_registered') if the trainee is already registered for the same session and date.
 * Throws Error('concurrent_request') if the script lock could not be acquired.
 * Throws Error('validation_failed') if required fields are missing or invalid.
 * Throws Error('validation_failed_age') if age_group is 'underage' but underage_age is missing.
 * Throws other Errors for network/service failures.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export async function registerTraineeForSession(
  payload: RegisterTraineeForSessionPayload
): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerTraineeForSession', payload }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data.id as string;
}
