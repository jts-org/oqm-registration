/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for admin account list routes (Task 1.1).
 * @see .github/skills/wire-react-to-gas/SKILL.md
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createSandbox(cacheGetValue) {
  const sandbox = {
    console,
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperty(name) {
            if (name === 'SHEET_ID') return 'sheet-id';
            if (name === 'COACH_PASSWORD') return 'coach-pass';
            if (name === 'ADMIN_PASSWORD') return 'admin-pass';
            return '';
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
    CacheService: {
      getScriptCache() {
        return {
          get() {
            return cacheGetValue;
          },
          put() {},
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
        return 'uuid-fixed';
      },
      formatDate(date, _tz, pattern) {
        if (!(date instanceof Date)) return String(date || '');
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const mm = String(date.getUTCMinutes()).padStart(2, '0');
        if (pattern === 'yyyy-MM-dd') return `${y}-${m}-${d}`;
        if (pattern === 'HH:mm') return `${hh}:${mm}`;
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
  sandbox.logToSheet = () => {};
  return sandbox;
}

test('doGet listCoachAccounts returns strict success envelope for admin session', () => {
  const adminSession = JSON.stringify({ role: 'admin', subject: 'admin' });
  const sandbox = createSandbox(adminSession);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'coach_login') {
      return [[
        'coach-1',
        'John',
        'Doe',
        'JD',
        '1234',
        '2026-01-01T00:00:00.000Z',
        '2026-01-02T00:00:00.000Z',
      ]];
    }
    return [];
  };

  const response = sandbox.doGet({
    parameter: {
      route: 'listCoachAccounts',
      sessionToken: 'admin-token',
    },
  });

  const body = JSON.parse(response.payload);
  assert.deepEqual(Object.keys(body), ['ok', 'data']);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data, {
    accounts: [{
      id: 'coach-1',
      firstname: 'John',
      lastname: 'Doe',
      alias: 'JD',
      pin: '1234',
      created_at: '2026-01-01T00:00:00.000Z',
      last_activity: '2026-01-02T00:00:00.000Z',
    }],
  });
});

test('doGet listTraineeAccounts returns strict success envelope for admin session', () => {
  const adminSession = JSON.stringify({ role: 'admin', subject: 'admin' });
  const sandbox = createSandbox(adminSession);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_login') {
      return [[
        'trainee-1',
        'Jane',
        'Doe',
        'adult',
        '7777',
        '2026-01-01T00:00:00.000Z',
        '2026-01-03T00:00:00.000Z',
      ]];
    }
    return [];
  };

  const response = sandbox.doGet({
    parameter: {
      route: 'listTraineeAccounts',
      sessionToken: 'admin-token',
    },
  });

  const body = JSON.parse(response.payload);
  assert.deepEqual(Object.keys(body), ['ok', 'data']);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data, {
    accounts: [{
      id: 'trainee-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: 'adult',
      pin: '7777',
      created_at: '2026-01-01T00:00:00.000Z',
      last_activity: '2026-01-03T00:00:00.000Z',
    }],
  });
});

test('doGet listCoachAccounts returns existing unauthorized semantics when token is missing', () => {
  const adminSession = JSON.stringify({ role: 'admin', subject: 'admin' });
  const sandbox = createSandbox(adminSession);

  const response = sandbox.doGet({
    parameter: {
      route: 'listCoachAccounts',
    },
  });

  const body = JSON.parse(response.payload);
  assert.deepEqual(Object.keys(body), ['ok', 'error']);
  assert.deepEqual(body, { ok: false, error: 'Error: Unauthorized' });
});

test('doGet listTraineeAccounts returns existing unauthorized semantics for invalid session token', () => {
  const sandbox = createSandbox(null);

  const response = sandbox.doGet({
    parameter: {
      route: 'listTraineeAccounts',
      sessionToken: 'invalid-token',
    },
  });

  const body = JSON.parse(response.payload);
  assert.deepEqual(Object.keys(body), ['ok', 'error']);
  assert.deepEqual(body, { ok: false, error: 'Error: Unauthorized' });
});

test('list routes are included in admin route guard', () => {
  const adminSession = JSON.stringify({ role: 'admin', subject: 'admin' });
  const sandbox = createSandbox(adminSession);

  assert.equal(sandbox.isAdminRoute_('listCoachAccounts'), true);
  assert.equal(sandbox.isAdminRoute_('listTraineeAccounts'), true);
});
