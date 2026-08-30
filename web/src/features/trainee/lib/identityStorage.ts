/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

import type { PendingTraineeData } from '../types';

export const TRAINEE_IDENTITY_STORAGE_KEY = 'oqm_trainee_identity';

export interface StoredTraineeIdentity {
  name: string;
  age: number;
}

function isValidStoredTraineeIdentity(value: unknown): value is StoredTraineeIdentity {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  const allowedKeys = new Set(['name', 'age']);
  const keys = Object.keys(record);

  if (keys.some(key => !allowedKeys.has(key))) return false;
  if (typeof record.name !== 'string' || record.name.trim().length === 0) return false;
  if (typeof record.age !== 'number' || !Number.isFinite(record.age) || record.age < 0 || record.age > 120) return false;

  return true;
}

export function readStoredTraineeIdentity(): StoredTraineeIdentity | null {
  const raw = window.localStorage.getItem(TRAINEE_IDENTITY_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && 'pin' in parsed) {
      const { pin: _legacyPin, ...identity } = parsed as Record<string, unknown>;
      if (!isValidStoredTraineeIdentity(identity)) {
        clearStoredTraineeIdentity();
        return null;
      }
      saveStoredTraineeIdentity(identity);
      return identity;
    }
    if (!isValidStoredTraineeIdentity(parsed)) {
      clearStoredTraineeIdentity();
      return null;
    }
    return parsed;
  } catch {
    clearStoredTraineeIdentity();
    return null;
  }
}

export function saveStoredTraineeIdentity(identity: StoredTraineeIdentity): void {
  if (!isValidStoredTraineeIdentity(identity)) {
    throw new Error('Invalid trainee identity payload');
  }

  const payload: StoredTraineeIdentity = {
    name: identity.name,
    age: identity.age,
  };

  window.localStorage.setItem(TRAINEE_IDENTITY_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredTraineeIdentity(): void {
  window.localStorage.removeItem(TRAINEE_IDENTITY_STORAGE_KEY);
}

export function storedIdentityToPendingTraineeData(identity: StoredTraineeIdentity): PendingTraineeData {
  const parts = identity.name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  const isUnderage = identity.age < 18;

  return {
    first_name: firstName,
    last_name: lastName,
    age_group: isUnderage ? 'underage' : 'adult',
    ...(isUnderage ? { underage_age: identity.age } : {}),
  };
}
