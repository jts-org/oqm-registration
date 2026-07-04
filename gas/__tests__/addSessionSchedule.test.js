/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for addSessionSchedule_ (OQM-0042).
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
        return { payload, setMimeType() { return this; } };
      },
    },
    SpreadsheetApp: {
      openById() {
        return { getSheetByName() { return null; } };
      },
    },
    CacheService: {
      getScriptCache() {
        return {
          get() { return JSON.stringify({ role: 'admin', subject: 'admin' }); },
          put() {},
        };
      },
    },
    Session: { getScriptTimeZone() { return 'UTC'; } },
    Utilities: {
      getUuid() { return 'uuid-fixed'; },
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
        return { tryLock() { return lockAcquired; }, releaseLock() {} };
      },
    },
    Date, JSON, String, Number, Boolean, Object, Array, Math, Error,
  };

  vm.createContext(sandbox);
  const codePath = path.join(__dirname, '..', 'Code.gs');
  const code = fs.readFileSync(codePath, 'utf8');
  vm.runInContext(code, sandbox, { filename: 'Code.gs' });
  return sandbox;
}

function makePayload(overrides = {}) {
  return {
    session_type: 'Advanced',
    session_type_alias: 'Edistynyt',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    weekdays_available: '0,2,4',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Dojo A',
    location_alias: 'Sali A',
    active: true,
    ...overrides,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

test('addSessionSchedule_ returns validationFailed for missing session_type', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ session_type: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for missing session_type_alias', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ session_type_alias: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for missing start_date', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ start_date: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed when end_date before start_date', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ start_date: '2026-06-01', end_date: '2026-01-01' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for empty weekdays_available', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ weekdays_available: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for weekday out of range', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ weekdays_available: '0,7' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for duplicate weekday values', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ weekdays_available: '0,0,2' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed for active not boolean', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ active: 'true' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed when only start_time provided', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ start_time: '18:00', end_time: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('addSessionSchedule_ returns validationFailed when end_time before start_time', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow() {} });
  const result = sb.addSessionSchedule_(makePayload({ start_time: '19:00', end_time: '18:00' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

// ─── Duplicate detection ──────────────────────────────────────────────────────

test('addSessionSchedule_ returns scheduleAlreadyExists for duplicate active row', () => {
  const sb = createSandbox();
  const existingRow = [
    '1718294400000', 'Advanced', 'Edistynyt', '2026-01-01', '2026-12-31',
    '0,2,4', '18:00', '19:30', 'Dojo A', 'Sali A', true,
    '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
  ];
  sb.getSheetData = (_name) => [existingRow];
  sb.getSheetByName = (_name) => ({ appendRow() {} });

  const result = sb.addSessionSchedule_(makePayload());
  assert.deepEqual(toPlain(result), { scheduleAlreadyExists: true });
});

test('addSessionSchedule_ does not flag inactive rows as duplicates', () => {
  const sb = createSandbox();
  const inactiveRow = [
    '1718294400000', 'Advanced', 'Edistynyt', '2026-01-01', '2026-12-31',
    '0,2,4', '18:00', '19:30', 'Dojo A', 'Sali A', false,
    '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
  ];
  const appended = [];
  sb.getSheetData = (_name) => [inactiveRow];
  sb.getSheetByName = (_name) => ({ appendRow(row) { appended.push(row); } });

  const result = sb.addSessionSchedule_(makePayload());
  assert.equal(result.scheduleAlreadyExists, undefined);
  assert.equal(appended.length, 1);
});

test('addSessionSchedule_ does not flag non-overlapping date ranges as duplicates', () => {
  const sb = createSandbox();
  const priorRow = [
    '1718294400000', 'Advanced', 'Edistynyt', '2024-01-01', '2024-12-31',
    '0,2,4', '18:00', '19:30', 'Dojo A', 'Sali A', true,
    '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z',
  ];
  const appended = [];
  sb.getSheetData = (_name) => [priorRow];
  sb.getSheetByName = (_name) => ({ appendRow(row) { appended.push(row); } });

  const result = sb.addSessionSchedule_(makePayload());
  assert.equal(result.scheduleAlreadyExists, undefined);
  assert.equal(appended.length, 1);
});

// ─── Concurrency ─────────────────────────────────────────────────────────────

test('addSessionSchedule_ returns concurrentRequest when lock fails', () => {
  const sb = createSandbox(false);
  const result = sb.addSessionSchedule_(makePayload());
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

// ─── Successful insert ────────────────────────────────────────────────────────

test('addSessionSchedule_ appends full 13-column row and returns schedule record', () => {
  const sb = createSandbox();
  const appended = [];
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow(row) { appended.push(row); } });

  const result = sb.addSessionSchedule_(makePayload());

  assert.equal(appended.length, 1);
  const row = appended[0];
  assert.equal(row.length, 13);
  assert.equal(row[1], 'Advanced');        // session_type
  assert.equal(row[2], 'Edistynyt');       // session_type_alias
  assert.equal(row[3], '2026-01-01');      // start_date
  assert.equal(row[4], '2026-12-31');      // end_date
  assert.equal(row[5], '0,2,4');           // weekdays_available
  assert.equal(row[6], '18:00');           // start_time
  assert.equal(row[7], '19:30');           // end_time
  assert.equal(row[8], 'Dojo A');          // location
  assert.equal(row[9], 'Sali A');          // location_alias
  assert.equal(row[10], true);             // active
  assert.ok(row[11]);                       // created_at
  assert.ok(row[12]);                       // updated_at

  assert.equal(result.schedule.session_type, 'Advanced');
  assert.equal(result.schedule.active, true);
  assert.ok(result.schedule.id);
});

test('addSessionSchedule_ accepts payload without optional time/location fields', () => {
  const sb = createSandbox();
  const appended = [];
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ appendRow(row) { appended.push(row); } });

  const result = sb.addSessionSchedule_(makePayload({ start_time: '', end_time: '', location: '', location_alias: '' }));
  assert.equal(appended.length, 1);
  assert.equal(result.schedule.start_time, '');
  assert.equal(result.schedule.location, '');
});
