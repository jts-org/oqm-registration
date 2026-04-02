/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for admin batch trainee registration feed (OQM-0034).
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

function createSandbox(lockAcquired = true) {
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
            return JSON.stringify({ role: 'admin', subject: 'admin' });
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
            return lockAcquired;
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

function makeRow(overrides = {}) {
  return {
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    underage_age: '',
    session_type: 'basic',
    camp_session_id: '',
    dates: ['2026-04-01'],
    start_time: '18:00',
    end_time: '19:00',
    ...overrides,
  };
}

test('registerTraineeBatchForSessions_ appends valid rows and returns summary counts', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_registrations') return [];
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  let uuidCounter = 0;
  sandbox.Utilities.getUuid = () => `uuid-${++uuidCounter}`;

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow({ first_name: 'Jane', last_name: 'Doe' }),
      makeRow({ first_name: 'John', last_name: 'Doe', dates: ['2026-04-02'] }),
    ],
  });

  assert.deepEqual(toPlain(result), {
    totalRows: 2,
    addedCount: 2,
    rejectedCount: 0,
    results: [
      { rowIndex: 0, status: 'added', id: 'uuid-1' },
      { rowIndex: 1, status: 'added', id: 'uuid-2' },
    ],
  });
  assert.equal(appended.length, 2);
  assert.equal(appended[0][1], 'Jane');
  assert.equal(appended[1][1], 'John');
});

test('registerTraineeBatchForSessions_ rejects duplicate existing and intra-batch rows', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_registrations') {
      return [[
        'existing-1',
        'Jane',
        'Doe',
        'adult',
        '',
        'basic',
        '',
        '2026-04-01',
        '18:00',
        '19:00',
        true,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ]];
    }
    return [];
  };
  sandbox.getSheetByName = () => ({
    appendRow(row) {
      appended.push(row);
    },
  });

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow(),
      makeRow({ first_name: 'Mary', last_name: 'Smith', dates: ['2026-04-03'] }),
      makeRow({ first_name: 'Mary', last_name: 'Smith', dates: ['2026-04-03'] }),
    ],
  });

  assert.equal(result.totalRows, 3);
  assert.equal(result.addedCount, 1);
  assert.equal(result.rejectedCount, 2);
  assert.deepEqual(toPlain(result.results), [
    { rowIndex: 0, status: 'rejected', reason: 'already_registered' },
    { rowIndex: 1, status: 'added', id: 'uuid-fixed' },
    { rowIndex: 2, status: 'rejected', reason: 'already_registered' },
  ]);
  assert.equal(appended.length, 1);
});

test('registerTraineeBatchForSessions_ enforces free/sparring start/end pair validation', () => {
  const sandbox = createSandbox(true);
  sandbox.getSheetData = () => [];
  sandbox.getSheetByName = () => ({ appendRow() {} });

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow({ session_type: 'free/sparring', start_time: '18:00', end_time: '' }),
      makeRow({ session_type: 'free/sparring', start_time: '', end_time: '' }),
    ],
  });

  assert.deepEqual(toPlain(result.results), [
    { rowIndex: 0, status: 'rejected', reason: 'validation_failed_time_pair' },
    { rowIndex: 1, status: 'added', id: 'uuid-fixed' },
  ]);
});

test('registerTraineeBatchForSessions_ requires camp_session_id for camp rows', () => {
  const sandbox = createSandbox(true);
  sandbox.getSheetData = () => [];
  sandbox.getSheetByName = () => ({ appendRow() {} });

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow({ session_type: 'camp', camp_session_id: '' }),
      makeRow({ session_type: 'camp', camp_session_id: 'camp-1' }),
    ],
  });

  assert.deepEqual(toPlain(result.results), [
    { rowIndex: 0, status: 'rejected', reason: 'validation_failed_camp_session_id' },
    { rowIndex: 1, status: 'added', id: 'uuid-fixed' },
  ]);
});

test('registerTraineeBatchForSessions_ requires underage_age for underage rows', () => {
  const sandbox = createSandbox(true);
  sandbox.getSheetData = () => [];
  sandbox.getSheetByName = () => ({ appendRow() {} });

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow({ age_group: 'underage', underage_age: '' }),
      makeRow({ age_group: 'underage', underage_age: 13, first_name: 'Kid', last_name: 'One' }),
    ],
  });

  assert.deepEqual(toPlain(result.results), [
    { rowIndex: 0, status: 'rejected', reason: 'validation_failed_age' },
    { rowIndex: 1, status: 'added', id: 'uuid-fixed' },
  ]);
});

test('registerTraineeBatchForSessions_ returns concurrentRequest when lock cannot be acquired', () => {
  const sandbox = createSandbox(false);

  const result = sandbox.registerTraineeBatchForSessions_({ rows: [makeRow()] });

  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

test('doPost maps registerTraineeBatchForSessions route results to API errors and success shape', () => {
  const sandbox = createSandbox(true);

  sandbox.authorize_ = () => null;

  sandbox.registerTraineeBatchForSessions_ = () => ({ concurrentRequest: true });
  let response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerTraineeBatchForSessions',
        payload: { rows: [makeRow()] },
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sandbox.registerTraineeBatchForSessions_ = () => ({
    totalRows: 1,
    addedCount: 1,
    rejectedCount: 0,
    results: [{ rowIndex: 0, status: 'added', id: 'uuid-1' }],
  });
  response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerTraineeBatchForSessions',
        payload: { rows: [makeRow()] },
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), {
    ok: true,
    data: {
      totalRows: 1,
      addedCount: 1,
      rejectedCount: 0,
      results: [{ rowIndex: 0, status: 'added', id: 'uuid-1' }],
    },
  });
});

test('registerTraineeBatchForSessions_ expands rows with multiple dates into separate entries', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'trainee_registrations') return [];
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  let uuidCounter = 0;
  sandbox.Utilities.getUuid = () => `uuid-${++uuidCounter}`;

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [
      makeRow({
        first_name: 'Jane',
        last_name: 'Doe',
        dates: ['2026-04-01', '2026-04-02', '2026-04-03'],
      }),
    ],
  });

  assert.deepEqual(toPlain(result), {
    totalRows: 1,
    addedCount: 3,
    rejectedCount: 0,
    results: [
      { rowIndex: 0, status: 'added', id: 'uuid-1' },
    ],
  });
  assert.equal(appended.length, 3);
  assert.equal(appended[0][1], 'Jane');
  assert.equal(appended[0][7], '2026-04-01');
  assert.equal(appended[1][7], '2026-04-02');
  assert.equal(appended[2][7], '2026-04-03');
});

test('registerTraineeBatchForSessions_ requires at least one date per row', () => {
  const sandbox = createSandbox(true);
  sandbox.getSheetData = () => [];
  sandbox.getSheetByName = () => ({ appendRow() {} });

  const result = sandbox.registerTraineeBatchForSessions_({
    rows: [makeRow({ dates: [] })],
  });

  assert.deepEqual(toPlain(result), { validationFailed: true });
});
