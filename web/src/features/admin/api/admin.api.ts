/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description API functions for admin authentication.
 *   Calls GAS route adminLogin and returns a short-lived session token.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import type {
  BatchTraineeRegistrationRequest,
  BatchTraineeRegistrationResponse,
} from '../types';

export interface AdminSession {
  sessionToken: string;
  role: string;
  expiresInSeconds: number;
}

export async function adminLogin(password: string): Promise<AdminSession> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'adminLogin', payload: { password } }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Login failed');
  return (json.data && json.data.session) as AdminSession;
}

/**
 * Submit admin batch trainee registrations in one request.
 * Throws backend error code string as Error.message when request fails.
 */
export async function registerTraineeBatchForSessions(
  sessionToken: string,
  payload: BatchTraineeRegistrationRequest
): Promise<BatchTraineeRegistrationResponse> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerTraineeBatchForSessions', payload, sessionToken }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Batch registration failed');
  return json.data as BatchTraineeRegistrationResponse;
}
