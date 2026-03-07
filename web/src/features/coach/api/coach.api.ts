/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description API functions for coach registration.
 *   Calls the GAS backend route `registerCoachPin` as defined in SKILL.wire-react-to-gas.md.
 *   Env vars are read inside each function so vi.stubEnv works correctly in tests.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import type { RegisterPinData } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';

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
