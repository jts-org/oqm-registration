import { describe, it, expect, beforeEach } from 'vitest';
import {
  readStoredTraineeIdentity,
  saveStoredTraineeIdentity,
  clearStoredTraineeIdentity,
  type StoredTraineeIdentity,
} from './identityStorage';

describe('trainee identity storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads and sanitizes a legacy stored identity containing a PIN', () => {
    const legacyIdentity = {
      pin: '1234',
      name: 'Jane Doe',
      age: 28,
    };

    window.localStorage.setItem('oqm_trainee_identity', JSON.stringify(legacyIdentity));

    expect(readStoredTraineeIdentity()).toEqual({ name: 'Jane Doe', age: 28 });
    expect(JSON.parse(window.localStorage.getItem('oqm_trainee_identity') ?? '{}')).toEqual({
      name: 'Jane Doe',
      age: 28,
    });
  });

  it('ignores invalid persisted data and clears it', () => {
    window.localStorage.setItem('oqm_trainee_identity', JSON.stringify({
      pin: '1234',
      name: 'Jane',
      age: 28,
      extra: 'bad',
    }));

    expect(readStoredTraineeIdentity()).toBeNull();
    expect(window.localStorage.getItem('oqm_trainee_identity')).toBeNull();
  });

  it('stores the exact allowed schema and rejects extra keys', () => {
    const next: StoredTraineeIdentity = {
      name: 'Jane Doe',
      age: 28,
    };

    saveStoredTraineeIdentity(next);

    expect(JSON.parse(window.localStorage.getItem('oqm_trainee_identity') ?? '{}')).toEqual(next);
  });

  it('clears a stored identity', () => {
    saveStoredTraineeIdentity({ name: 'Jane Doe', age: 28 });

    clearStoredTraineeIdentity();

    expect(readStoredTraineeIdentity()).toBeNull();
  });
});
