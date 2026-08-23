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

  it('reads a valid stored identity with only allowed fields', () => {
    const fixture: StoredTraineeIdentity = {
      pin: '1234',
      name: 'Jane Doe',
      age: 28,
    };

    window.localStorage.setItem('oqm_trainee_identity', JSON.stringify(fixture));

    expect(readStoredTraineeIdentity()).toEqual(fixture);
  });

  it('ignores invalid persisted data and clears it', () => {
    window.localStorage.setItem('oqm_trainee_identity', JSON.stringify({
      pin: '1234',
      name: 'Jane',
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
    saveStoredTraineeIdentity({ pin: '1234', name: 'Jane Doe', age: 28 });

    clearStoredTraineeIdentity();

    expect(readStoredTraineeIdentity()).toBeNull();
  });
});
