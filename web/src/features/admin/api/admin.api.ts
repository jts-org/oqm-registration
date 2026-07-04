/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description API functions for admin authentication.
 *   Calls GAS route adminLogin and returns a short-lived session token.
 *   @see .github/skills/wire-react-to-gas/SKILL.md
 */
import type {
  BatchTraineeRegistrationRequest,
  BatchTraineeRegistrationResponse,
  CustomerEventWithScheduleRequest,
  CustomerEventWithScheduleResponse,
  ListSessionsScheduleResponse,
  SessionSchedulePayload,
  SessionScheduleRecord,
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

/**
 * Submit one customer event and related schedule rows in one request.
 * Throws backend error code string as Error.message when request fails.
 */
export async function registerCustomerEventWithSchedule(
  sessionToken: string,
  payload: CustomerEventWithScheduleRequest
): Promise<CustomerEventWithScheduleResponse> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerCustomerEventWithSchedule', payload, sessionToken }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Customer event submission failed');
  return json.data as CustomerEventWithScheduleResponse;
}

// ─── Sessions Schedule (OQM-0042) ────────────────────────────────────────────

/**
 * Fetch all rows from sessions_schedule.
 * GET route — passes sessionToken as a query parameter.
 * Throws backend error code string as Error.message when request fails.
 */
export async function listSessionsSchedule(
  sessionToken: string
): Promise<ListSessionsScheduleResponse> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const url = `${base}?route=listSessionsSchedule&sessionToken=${encodeURIComponent(sessionToken)}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to load schedules');
  return json.data as ListSessionsScheduleResponse;
}

/**
 * Add one row to sessions_schedule.
 * Throws backend error code string as Error.message when request fails.
 */
export async function addSessionSchedule(
  sessionToken: string,
  payload: SessionSchedulePayload
): Promise<{ schedule: SessionScheduleRecord }> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'addSessionSchedule', payload, sessionToken }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to add schedule');
  return json.data as { schedule: SessionScheduleRecord };
}

/**
 * Update an existing row in sessions_schedule by id.
 * Throws backend error code string as Error.message when request fails.
 */
export async function updateSessionSchedule(
  sessionToken: string,
  payload: SessionSchedulePayload
): Promise<{ schedule: SessionScheduleRecord }> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'updateSessionSchedule', payload, sessionToken }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to update schedule');
  return json.data as { schedule: SessionScheduleRecord };
}

/**
 * Delete a row from sessions_schedule by id.
 * Throws backend error code string as Error.message when request fails.
 */
export async function deleteSessionSchedule(
  sessionToken: string,
  id: string
): Promise<{ id: string }> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'deleteSessionSchedule', payload: { id }, sessionToken }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to delete schedule');
  return json.data as { id: string };
}
