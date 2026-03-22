/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description API functions for the settings feature.
 *   Calls the GAS backend route `getSettings` as defined in SKILL.wire-react-to-gas.md.
 *   Env vars are read inside each function so vi.stubEnv works correctly in tests.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import type { Setting } from '../types';

/**
 * Fetch all rows from the `settings` sheet.
 * GET ?route=getSettings&sessionToken=…
 */
export async function getSettings(sessionToken: string): Promise<Setting[]> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  if (!sessionToken) throw new Error('Unauthorized');
  const url = `${base}?route=getSettings&sessionToken=${encodeURIComponent(sessionToken)}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.data as Setting[];
}
