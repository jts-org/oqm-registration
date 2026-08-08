/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for admin account write routes and guards (Task 2.1).
 * @see .github/skills/wire-react-to-gas/SKILL.md
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSandbox(options = {}) {
  const lockAcquired = options.lockAcquired !== false;
  const cacheGetValue = options.cacheGetValue || JSON.stringify({ role: 'admin', subject: 'admin' });

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
  sandbox.logToSheet = () => {};
  return sandbox;
}

function createSheetHarness(seed = {}) {
  const rowsBySheet = {
    coach_login: seed.coach_login || [],
    trainee_login: seed.trainee_login || [],
    coach_registrations: seed.coach_registrations || [],
    trainee_registrations: seed.trainee_registrations || [],
  };

  const getSheetData = (sheetName) => {
    const rows = rowsBySheet[sheetName] || [];
    return rows.map(row => row.slice());
  };

  const getSheetByName = (sheetName) => {
    if (!rowsBySheet[sheetName]) rowsBySheet[sheetName] = [];
    const rows = rowsBySheet[sheetName];

    return {
      appendRow(row) {
        rows.push(row.slice());
      },
      deleteRow(rowNumber) {
        const dataIndex = rowNumber - 2;
        rows.splice(dataIndex, 1);
      },
      getRange(rowNumber, colNumber, _rowCount, colCount) {
        return {
          setValues(values) {
            const dataIndex = rowNumber - 2;
            const sourceRow = rows[dataIndex].slice();
            const valuesRow = values[0] || [];
            for (let i = 0; i < colCount; i++) {
              sourceRow[colNumber - 1 + i] = valuesRow[i];
            }
            rows[dataIndex] = sourceRow;
          },
          setValue(value) {
            const dataIndex = rowNumber - 2;
            const sourceRow = rows[dataIndex].slice();
            sourceRow[colNumber - 1] = value;
            rows[dataIndex] = sourceRow;
          },
        };
      },
    };
  };

  return { rowsBySheet, getSheetData, getSheetByName };
}

function makeDoPostRequest(route, payload, sessionToken) {
  return {
    postData: {
      contents: JSON.stringify({ route, payload, sessionToken }),
    },
    parameter: {},
  };
}

test('new admin account write routes are included in isAdminRoute_', () => {
  const sb = createSandbox();

  assert.equal(sb.isAdminRoute_('createCoachAccount'), true);
  assert.equal(sb.isAdminRoute_('createTraineeAccount'), true);
  assert.equal(sb.isAdminRoute_('updateCoachAccount'), true);
  assert.equal(sb.isAdminRoute_('updateTraineeAccount'), true);
  assert.equal(sb.isAdminRoute_('deleteCoachAccount'), true);
  assert.equal(sb.isAdminRoute_('deleteTraineeAccount'), true);
});

test('createCoachAccount_ returns validationFailed when required fields are missing', () => {
  const sb = createSandbox();
  const result = sb.createCoachAccount_({ firstname: 'John' });
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('createCoachAccount_ returns concurrentRequest when lock is not acquired', () => {
  const sb = createSandbox({ lockAcquired: false });
  const result = sb.createCoachAccount_({ firstname: 'John', lastname: 'Doe', pin: '1234' });
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

test('createCoachAccount_ enforces global pin uniqueness against trainee_login', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '1234', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.createCoachAccount_({ firstname: 'John', lastname: 'Doe', pin: '1234' });
  assert.deepEqual(toPlain(result), { pinReserved: true });
});

test('createCoachAccount_ returns account payload and appends coach row on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness();
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.createCoachAccount_({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });
  assert.deepEqual(toPlain(result), {
    account: {
      id: 'uuid-fixed',
      firstname: 'John',
      lastname: 'Doe',
      alias: 'JD',
      pin: '1234',
      created_at: result.account.created_at,
      last_activity: '',
    },
  });
  assert.equal(harness.rowsBySheet.coach_login.length, 1);
});

test('createTraineeAccount_ returns concurrentRequest when lock is not acquired', () => {
  const sb = createSandbox({ lockAcquired: false });
  const result = sb.createTraineeAccount_({ firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '4321' });
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

test('createTraineeAccount_ enforces global pin uniqueness against coach_login', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '4321', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.createTraineeAccount_({ firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '4321' });
  assert.deepEqual(toPlain(result), { pinReserved: true });
});

test('createTraineeAccount_ returns account payload and appends trainee row on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness();
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.createTraineeAccount_({ firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '4321' });
  assert.deepEqual(toPlain(result), {
    account: {
      id: 'uuid-fixed',
      firstname: 'Jane',
      lastname: 'Doe',
      age: 'adult',
      pin: '4321',
      created_at: result.account.created_at,
      last_activity: '',
    },
  });
  assert.equal(harness.rowsBySheet.trainee_login.length, 1);
});

test('updateCoachAccount_ blocks first/last-name edit when related registrations exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '1111', '2026-01-01T00:00:00.000Z', '',
    ]],
    coach_registrations: [[
      'reg-1', 'John', 'Doe', 'basic', '2026-07-10', true, '', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateCoachAccount_({
    id: 'c-1',
    firstname: 'Jonathan',
    lastname: 'Doe',
    alias: 'JD',
    pin: '1111',
  });
  assert.deepEqual(toPlain(result), { forbidden: true });
});

test('updateCoachAccount_ enforces global pin uniqueness while excluding current coach row', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '1111', '2026-01-01T00:00:00.000Z', '',
    ]],
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '9999', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateCoachAccount_({
    id: 'c-1',
    firstname: 'John',
    lastname: 'Doe',
    alias: 'JD',
    pin: '9999',
  });
  assert.deepEqual(toPlain(result), { pinReserved: true });
});

test('updateCoachAccount_ returns noMatchFound when account id does not exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({ coach_login: [] });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateCoachAccount_({
    id: 'missing',
    firstname: 'John',
    lastname: 'Doe',
    alias: 'JD',
    pin: '1111',
  });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

test('updateCoachAccount_ returns updated account payload on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '1111', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateCoachAccount_({
    id: 'c-1',
    firstname: 'John',
    lastname: 'Doe',
    alias: 'Coach JD',
    pin: '1111',
  });

  assert.deepEqual(toPlain(result), {
    account: {
      id: 'c-1',
      firstname: 'John',
      lastname: 'Doe',
      alias: 'Coach JD',
      pin: '1111',
      created_at: '2026-01-01T00:00:00.000Z',
      last_activity: '',
    },
  });
});

test('deleteCoachAccount_ blocks delete when related registrations exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '1111', '2026-01-01T00:00:00.000Z', '',
    ]],
    coach_registrations: [[
      'reg-1', 'John', 'Doe', 'basic', '2026-07-10', true, '', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteCoachAccount_({ id: 'c-1' });
  assert.deepEqual(toPlain(result), { forbidden: true });
});

test('deleteCoachAccount_ returns noMatchFound when account id does not exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({ coach_login: [] });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteCoachAccount_({ id: 'missing' });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

test('deleteCoachAccount_ deletes matching account row on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '1111', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteCoachAccount_({ id: 'c-1' });
  assert.deepEqual(toPlain(result), { id: 'c-1' });
  assert.equal(harness.rowsBySheet.coach_login.length, 0);
});

test('updateTraineeAccount_ blocks first/last-name edit when related registrations exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '2222', '2026-01-01T00:00:00.000Z', '',
    ]],
    trainee_registrations: [[
      'reg-1', 'Jane', 'Doe', 'adult', '', 'basic', '', '2026-07-10', '18:00', '19:00', true, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateTraineeAccount_({
    id: 't-1',
    firstname: 'Janet',
    lastname: 'Doe',
    age: 'adult',
    pin: '2222',
  });
  assert.deepEqual(toPlain(result), { forbidden: true });
});

test('updateTraineeAccount_ enforces global pin uniqueness against coach_login on update', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '2222', '2026-01-01T00:00:00.000Z', '',
    ]],
    coach_login: [[
      'c-1', 'John', 'Doe', 'JD', '9999', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateTraineeAccount_({
    id: 't-1',
    firstname: 'Jane',
    lastname: 'Doe',
    age: 'adult',
    pin: '9999',
  });
  assert.deepEqual(toPlain(result), { pinReserved: true });
});

test('updateTraineeAccount_ returns noMatchFound when account id does not exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({ trainee_login: [] });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateTraineeAccount_({
    id: 'missing',
    firstname: 'Jane',
    lastname: 'Doe',
    age: 'adult',
    pin: '2222',
  });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

test('updateTraineeAccount_ returns updated account payload on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '2222', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.updateTraineeAccount_({
    id: 't-1',
    firstname: 'Jane',
    lastname: 'Doe',
    age: 'underage',
    pin: '3333',
  });

  assert.deepEqual(toPlain(result), {
    account: {
      id: 't-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: 'underage',
      pin: '3333',
      created_at: '2026-01-01T00:00:00.000Z',
      last_activity: '',
    },
  });
});

test('deleteTraineeAccount_ blocks delete when related registrations exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '2222', '2026-01-01T00:00:00.000Z', '',
    ]],
    trainee_registrations: [[
      'reg-1', 'Jane', 'Doe', 'adult', '', 'basic', '', '2026-07-10', '18:00', '19:00', true, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteTraineeAccount_({ id: 't-1' });
  assert.deepEqual(toPlain(result), { forbidden: true });
});

test('deleteTraineeAccount_ returns concurrentRequest when lock is not acquired', () => {
  const sb = createSandbox({ lockAcquired: false });
  const result = sb.deleteTraineeAccount_({ id: 't-1' });
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

test('deleteTraineeAccount_ returns noMatchFound when account id does not exist', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({ trainee_login: [] });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteTraineeAccount_({ id: 'missing' });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

test('deleteTraineeAccount_ deletes matching account row on success', () => {
  const sb = createSandbox();
  const harness = createSheetHarness({
    trainee_login: [[
      't-1', 'Jane', 'Doe', 'adult', '2222', '2026-01-01T00:00:00.000Z', '',
    ]],
  });
  sb.getSheetData = harness.getSheetData;
  sb.getSheetByName = harness.getSheetByName;

  const result = sb.deleteTraineeAccount_({ id: 't-1' });
  assert.deepEqual(toPlain(result), { id: 't-1' });
  assert.equal(harness.rowsBySheet.trainee_login.length, 0);
});

test('doPost createCoachAccount maps pinReserved to strict error envelope', () => {
  const sb = createSandbox();
  sb.createCoachAccount_ = () => ({ pinReserved: true });

  const response = sb.doPost(makeDoPostRequest(
    'createCoachAccount',
    { firstname: 'John', lastname: 'Doe', pin: '1234' },
    'admin-token'
  ));

  const body = JSON.parse(response.payload);
  assert.deepEqual(body, { ok: false, error: 'pin_reserved' });
});

test('doPost deleteCoachAccount maps forbidden to strict error envelope', () => {
  const sb = createSandbox();
  sb.deleteCoachAccount_ = () => ({ forbidden: true });

  const response = sb.doPost(makeDoPostRequest('deleteCoachAccount', { id: 'c-1' }, 'admin-token'));

  const body = JSON.parse(response.payload);
  assert.deepEqual(body, { ok: false, error: 'forbidden' });
});

test('doPost account CRUD routes return Unauthorized when session token is missing', () => {
  const sb = createSandbox();
  const routes = [
    ['createCoachAccount', { firstname: 'John', lastname: 'Doe', pin: '1234' }],
    ['createTraineeAccount', { firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '2222' }],
    ['updateCoachAccount', { id: 'c-1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1111' }],
    ['updateTraineeAccount', { id: 't-1', firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '2222' }],
    ['deleteCoachAccount', { id: 'c-1' }],
    ['deleteTraineeAccount', { id: 't-1' }],
  ];

  routes.forEach(([route, payload]) => {
    const response = sb.doPost(makeDoPostRequest(route, payload, ''));
    const body = JSON.parse(response.payload);
    assert.deepEqual(body, { ok: false, error: 'Error: Unauthorized' });
  });
});

test('doPost account CRUD routes reject coach role sessions with Forbidden', () => {
  const coachSession = JSON.stringify({ role: 'coach', subject: 'coach-1' });
  const sb = createSandbox({ cacheGetValue: coachSession });
  const routes = [
    ['createCoachAccount', { firstname: 'John', lastname: 'Doe', pin: '1234' }],
    ['createTraineeAccount', { firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '2222' }],
    ['updateCoachAccount', { id: 'c-1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1111' }],
    ['updateTraineeAccount', { id: 't-1', firstname: 'Jane', lastname: 'Doe', age: 'adult', pin: '2222' }],
    ['deleteCoachAccount', { id: 'c-1' }],
    ['deleteTraineeAccount', { id: 't-1' }],
  ];

  routes.forEach(([route, payload]) => {
    const response = sb.doPost(makeDoPostRequest(route, payload, 'coach-token'));
    const body = JSON.parse(response.payload);
    assert.deepEqual(body, { ok: false, error: 'Error: Forbidden' });
  });
});

test('doPost create/update account routes map all error outcomes and success envelopes', () => {
  const sb = createSandbox();

  sb.createCoachAccount_ = () => ({ validationFailed: true });
  let response = sb.doPost(makeDoPostRequest('createCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.createCoachAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('createCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.createCoachAccount_ = () => ({ account: { id: 'c-1' } });
  response = sb.doPost(makeDoPostRequest('createCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { account: { id: 'c-1' } } });

  sb.createTraineeAccount_ = () => ({ validationFailed: true });
  response = sb.doPost(makeDoPostRequest('createTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.createTraineeAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('createTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.createTraineeAccount_ = () => ({ pinReserved: true });
  response = sb.doPost(makeDoPostRequest('createTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'pin_reserved' });

  sb.createTraineeAccount_ = () => ({ account: { id: 't-1' } });
  response = sb.doPost(makeDoPostRequest('createTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { account: { id: 't-1' } } });

  sb.updateCoachAccount_ = () => ({ validationFailed: true });
  response = sb.doPost(makeDoPostRequest('updateCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.updateCoachAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('updateCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.updateCoachAccount_ = () => ({ noMatchFound: true });
  response = sb.doPost(makeDoPostRequest('updateCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'no_match_found' });

  sb.updateCoachAccount_ = () => ({ account: { id: 'c-1' } });
  response = sb.doPost(makeDoPostRequest('updateCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { account: { id: 'c-1' } } });

  sb.updateTraineeAccount_ = () => ({ validationFailed: true });
  response = sb.doPost(makeDoPostRequest('updateTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.updateTraineeAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('updateTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.updateTraineeAccount_ = () => ({ noMatchFound: true });
  response = sb.doPost(makeDoPostRequest('updateTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'no_match_found' });

  sb.updateTraineeAccount_ = () => ({ forbidden: true });
  response = sb.doPost(makeDoPostRequest('updateTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'forbidden' });

  sb.updateTraineeAccount_ = () => ({ account: { id: 't-1' } });
  response = sb.doPost(makeDoPostRequest('updateTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { account: { id: 't-1' } } });
});

test('doPost delete account routes map all error outcomes and success envelopes', () => {
  const sb = createSandbox();

  sb.deleteCoachAccount_ = () => ({ validationFailed: true });
  let response = sb.doPost(makeDoPostRequest('deleteCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.deleteCoachAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('deleteCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.deleteCoachAccount_ = () => ({ noMatchFound: true });
  response = sb.doPost(makeDoPostRequest('deleteCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'no_match_found' });

  sb.deleteCoachAccount_ = () => ({ id: 'c-1' });
  response = sb.doPost(makeDoPostRequest('deleteCoachAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { id: 'c-1' } });

  sb.deleteTraineeAccount_ = () => ({ validationFailed: true });
  response = sb.doPost(makeDoPostRequest('deleteTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sb.deleteTraineeAccount_ = () => ({ concurrentRequest: true });
  response = sb.doPost(makeDoPostRequest('deleteTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sb.deleteTraineeAccount_ = () => ({ noMatchFound: true });
  response = sb.doPost(makeDoPostRequest('deleteTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'no_match_found' });

  sb.deleteTraineeAccount_ = () => ({ forbidden: true });
  response = sb.doPost(makeDoPostRequest('deleteTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'forbidden' });

  sb.deleteTraineeAccount_ = () => ({ id: 't-1' });
  response = sb.doPost(makeDoPostRequest('deleteTraineeAccount', {}, 'admin-token'));
  assert.deepEqual(JSON.parse(response.payload), { ok: true, data: { id: 't-1' } });
});
