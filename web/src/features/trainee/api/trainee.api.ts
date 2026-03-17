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
import type { RegisterTraineeForSessionPayload } from '../types';

/**
 * Register a trainee for a specific session by posting to the GAS backend.
 * POST { route: "registerTraineeForSession", payload: RegisterTraineeForSessionPayload, token }
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
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerTraineeForSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data.id as string;
}
