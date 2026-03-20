/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for verifyTraineePin_ fallback behavior (OQM-0023).
 * @see skills/SKILL.wire-react-to-gas.md
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSandbox() {
  const sandbox = {
    console,
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperty() {
            return 'test';
          },
        };
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput(payload) {
        return {
          payload,
          setMimeType() {
            return this;
          },
        };
      },
    },
    SpreadsheetApp: {
      openById() {
        return {
          getSheetByName() {
            return null;
          },
        };
      },
    },
    Session: {
      getScriptTimeZone() {
        return 'UTC';
      },
    },
    Utilities: {
      getUuid() {
        return 'uuid';
      },
      formatDate(date) {
        if (!(date instanceof Date)) return String(date || '');
        return date.toISOString();
      },
    },
    LockService: {
      getScriptLock() {
        return {
          tryLock() {
            return true;
          },
          releaseLock() {},
        };
      },
    },
    Date,
    JSON,
    String,
    Number,
    Boolean,
    Object,
    Array,
    Math,
    Error,
  };

  vm.createContext(sandbox);
  const codePath = path.join(__dirname, '..', 'Code.gs');
  const code = fs.readFileSync(codePath, 'utf8');
  vm.runInContext(code, sandbox, { filename: 'Code.gs' });
  return sandbox;
}

test('verifyTraineePin_ returns trainee row when pin exists in trainee_login', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_login') {
      return [[
        'trainee-1',
        'Trainee',
        'User',
        '14',
        '1111',
        '2026-01-01T00:00:00.000Z',
        '2026-02-01T00:00:00.000Z',
      ]];
    }
    if (sheetName === 'coach_login') {
      return [[
        'coach-1',
        'Coach',
        'User',
        'Alias',
        '1111',
        '2026-01-01T00:00:00.000Z',
        '2026-02-01T00:00:00.000Z',
      ]];
    }
    return [];
  };

  const result = sandbox.verifyTraineePin_({ pin: '1111' });

  assert.deepEqual(toPlain(result), {
    id: 'trainee-1',
    firstname: 'Trainee',
    lastname: 'User',
    age: '14',
    pin: '1111',
    created_at: '2026-01-01T00:00:00.000Z',
    last_activity: '2026-02-01T00:00:00.000Z',
  });
});

test('verifyTraineePin_ falls back to coach_login and maps coach to trainee shape', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_login') return [];
    if (sheetName === 'coach_login') {
      return [[
        'coach-9',
        'Mika',
        'Virtanen',
        'Mikke',
        '2222',
        '2026-01-10T08:00:00.000Z',
        '2026-02-11T09:30:00.000Z',
      ]];
    }
    return [];
  };

  const result = sandbox.verifyTraineePin_({ pin: '2222' });

  assert.deepEqual(toPlain(result), {
    id: 'coach-9',
    firstname: 'Mika',
    lastname: 'Virtanen',
    age: '',
    pin: '2222',
    created_at: '2026-01-10T08:00:00.000Z',
    last_activity: '2026-02-11T09:30:00.000Z',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(result, 'alias'), false);
});

test('verifyTraineePin_ returns null when pin is in neither trainee_login nor coach_login', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = () => [];

  const result = sandbox.verifyTraineePin_({ pin: '9999' });

  assert.equal(result, null);
});

test('verifyTraineePin_ keeps validation behavior for missing pin', () => {
  const sandbox = createSandbox();

  assert.throws(
    () => sandbox.verifyTraineePin_({}),
    /Missing required fields: pin/
  );
});

test('verifyCoachPin_ behavior remains unchanged', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'coach_login') {
      return [[
        'coach-2',
        'Anna',
        'Korhonen',
        'AK',
        '3333',
        '2026-01-01T00:00:00.000Z',
        '2026-03-01T00:00:00.000Z',
      ]];
    }
    return [];
  };

  const result = sandbox.verifyCoachPin_({ pin: '3333' });

  assert.deepEqual(toPlain(result), {
    id: 'coach-2',
    firstname: 'Anna',
    lastname: 'Korhonen',
    alias: 'AK',
    pin: '3333',
    created_at: '2026-01-01T00:00:00.000Z',
    last_activity: '2026-03-01T00:00:00.000Z',
  });
});
