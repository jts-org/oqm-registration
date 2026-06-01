/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for admin customer event + schedule creation (OQM-0035).
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

function makePayload(overrides = {}) {
  return {
    event: 'Customer Camp',
    event_alias: 'Asiakasleiri',
    instructor: 'Sensei Doe',
    start_date: '2026-06-01',
    end_date: '2026-06-03',
    schedules: [
      {
        session_name: 'Day 1 Morning',
        session_name_alias: 'Paiva 1 Aamu',
        date: '2026-06-01',
        start_time: '09:00',
        end_time: '10:30',
      },
      {
        session_name: 'Day 2 Evening',
        session_name_alias: 'Paiva 2 Ilta',
        date: '2026-06-02',
        start_time: '18:00',
        end_time: '19:30',
      },
    ],
    ...overrides,
  };
}

test('registerCustomerEventWithSchedule_ inserts event and valid schedules with summary', () => {
  const sandbox = createSandbox(true);
  const eventAppends = [];
  const scheduleAppends = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') return [];
    if (sheetName === 'customer_event_schedules') return [];
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName === 'customer_events') {
      return { appendRow(row) { eventAppends.push(row); } };
    }
    if (sheetName === 'customer_event_schedules') {
      return { appendRow(row) { scheduleAppends.push(row); } };
    }
    return null;
  };

  let uuidCounter = 0;
  sandbox.Utilities.getUuid = () => `uuid-${++uuidCounter}`;

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload());

  assert.deepEqual(toPlain(result), {
    customerEventInsertedCount: 1,
    totalScheduleRows: 2,
    scheduleInsertedCount: 2,
    scheduleRejectedCount: 0,
    results: [
      { rowIndex: 0, status: 'added', id: 'uuid-2' },
      { rowIndex: 1, status: 'added', id: 'uuid-3' },
    ],
  });

  assert.equal(eventAppends.length, 1);
  assert.equal(scheduleAppends.length, 2);
  assert.equal(scheduleAppends[0][1], 'uuid-1');
  assert.equal(scheduleAppends[1][1], 'uuid-1');
});

test('registerCustomerEventWithSchedule_ rejects invalid top-level payload before writes', () => {
  const sandbox = createSandbox(true);
  const eventAppends = [];
  const scheduleAppends = [];

  sandbox.getSheetData = () => [];
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName === 'customer_events') return { appendRow(row) { eventAppends.push(row); } };
    if (sheetName === 'customer_event_schedules') return { appendRow(row) { scheduleAppends.push(row); } };
    return null;
  };

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload({ event: '' }));

  assert.deepEqual(toPlain(result), { validationFailed: true });
  assert.equal(eventAppends.length, 0);
  assert.equal(scheduleAppends.length, 0);
});

test('registerCustomerEventWithSchedule_ rejects duplicate event against existing rows', () => {
  const sandbox = createSandbox(true);
  const eventAppends = [];
  const scheduleAppends = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [[
        'existing-event-1',
        'Customer Camp',
        'Asiakasleiri',
        'Existing Instructor',
        '2026-05-01',
        '2026-05-02',
        true,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ]];
    }
    if (sheetName === 'customer_event_schedules') return [];
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName === 'customer_events') return { appendRow(row) { eventAppends.push(row); } };
    if (sheetName === 'customer_event_schedules') return { appendRow(row) { scheduleAppends.push(row); } };
    return null;
  };

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload());

  assert.deepEqual(toPlain(result), { duplicateEvent: true });
  assert.equal(eventAppends.length, 0);
  assert.equal(scheduleAppends.length, 0);
});

test('registerCustomerEventWithSchedule_ inserts event but rejects invalid and duplicate schedule rows', () => {
  const sandbox = createSandbox(true);
  const eventAppends = [];
  const scheduleAppends = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') return [];
    if (sheetName === 'customer_event_schedules') {
      return [[
        'existing-sch-1',
        'existing-event-id',
        'Day 1 Morning',
        'Paiva 1 Aamu',
        '2026-06-01',
        '09:00',
        '10:30',
        true,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ]];
    }
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName === 'customer_events') return { appendRow(row) { eventAppends.push(row); } };
    if (sheetName === 'customer_event_schedules') return { appendRow(row) { scheduleAppends.push(row); } };
    return null;
  };

  let uuidCounter = 0;
  sandbox.Utilities.getUuid = () => `uuid-${++uuidCounter}`;

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload({
    schedules: [
      {
        session_name: 'Day 1 Morning',
        session_name_alias: 'Paiva 1 Aamu',
        date: '2026-06-01',
        start_time: '09:00',
        end_time: '10:30',
      },
      {
        session_name: 'Outside Date',
        session_name_alias: 'Ulkopuolella',
        date: '2026-06-15',
        start_time: '09:00',
        end_time: '10:00',
      },
      {
        session_name: 'Valid New',
        session_name_alias: 'Kelvollinen Uusi',
        date: '2026-06-02',
        start_time: '18:00',
        end_time: '19:00',
      },
    ],
  }));

  assert.deepEqual(toPlain(result), {
    customerEventInsertedCount: 1,
    totalScheduleRows: 3,
    scheduleInsertedCount: 1,
    scheduleRejectedCount: 2,
    results: [
      { rowIndex: 0, status: 'rejected', reason: 'already_registered' },
      { rowIndex: 1, status: 'rejected', reason: 'validation_failed_date_range' },
      { rowIndex: 2, status: 'added', id: 'uuid-2' },
    ],
  });

  assert.equal(eventAppends.length, 1);
  assert.equal(scheduleAppends.length, 1);
});

test('registerCustomerEventWithSchedule_ rejects duplicate schedule rows within request', () => {
  const sandbox = createSandbox(true);
  const scheduleAppends = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') return [];
    if (sheetName === 'customer_event_schedules') return [];
    return [];
  };
  sandbox.getSheetByName = (sheetName) => {
    if (sheetName === 'customer_events') return { appendRow() {} };
    if (sheetName === 'customer_event_schedules') return { appendRow(row) { scheduleAppends.push(row); } };
    return null;
  };

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload({
    schedules: [
      {
        session_name: 'Same',
        session_name_alias: 'Sama',
        date: '2026-06-01',
        start_time: '09:00',
        end_time: '10:00',
      },
      {
        session_name: 'Same',
        session_name_alias: 'Sama',
        date: '2026-06-01',
        start_time: '09:00',
        end_time: '10:00',
      },
    ],
  }));

  assert.deepEqual(toPlain(result), {
    customerEventInsertedCount: 1,
    totalScheduleRows: 2,
    scheduleInsertedCount: 1,
    scheduleRejectedCount: 1,
    results: [
      { rowIndex: 0, status: 'added', id: 'uuid-fixed' },
      { rowIndex: 1, status: 'rejected', reason: 'already_registered' },
    ],
  });
  assert.equal(scheduleAppends.length, 1);
});

test('registerCustomerEventWithSchedule_ returns concurrentRequest when lock cannot be acquired', () => {
  const sandbox = createSandbox(false);

  const result = sandbox.registerCustomerEventWithSchedule_(makePayload());

  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

test('doPost maps registerCustomerEventWithSchedule results to API errors and success shape', () => {
  const sandbox = createSandbox(true);
  sandbox.authorize_ = () => null;

  sandbox.registerCustomerEventWithSchedule_ = () => ({ concurrentRequest: true });
  let response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerCustomerEventWithSchedule',
        payload: makePayload(),
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'concurrent_request' });

  sandbox.registerCustomerEventWithSchedule_ = () => ({ validationFailed: true });
  response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerCustomerEventWithSchedule',
        payload: makePayload(),
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'validation_failed' });

  sandbox.registerCustomerEventWithSchedule_ = () => ({ duplicateEvent: true });
  response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerCustomerEventWithSchedule',
        payload: makePayload(),
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), { ok: false, error: 'already_registered' });

  sandbox.registerCustomerEventWithSchedule_ = () => ({
    customerEventInsertedCount: 1,
    totalScheduleRows: 1,
    scheduleInsertedCount: 1,
    scheduleRejectedCount: 0,
    results: [{ rowIndex: 0, status: 'added', id: 'uuid-1' }],
  });
  response = sandbox.doPost({
    postData: {
      contents: JSON.stringify({
        route: 'registerCustomerEventWithSchedule',
        payload: makePayload(),
      }),
    },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(response.payload), {
    ok: true,
    data: {
      customerEventInsertedCount: 1,
      totalScheduleRows: 1,
      scheduleInsertedCount: 1,
      scheduleRejectedCount: 0,
      results: [{ rowIndex: 0, status: 'added', id: 'uuid-1' }],
    },
  });
});
