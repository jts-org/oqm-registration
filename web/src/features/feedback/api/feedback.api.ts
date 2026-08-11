/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

import type { SendFeedbackPayload } from '../types';

export async function sendFeedback(payload: SendFeedbackPayload): Promise<void> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');

  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'sendFeedback', payload }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Feedback submission failed');
}
