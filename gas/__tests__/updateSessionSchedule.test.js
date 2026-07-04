/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for updateSessionSchedule_ (OQM-0042).
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

const EXISTING_ID = '1718294400000';
const EXISTING_CREATED_AT = '2026-01-01T00:00:00.000Z';

function makeExistingRow(overrides = {}) {
  const defaults = [
    EXISTING_ID, 'Advanced', 'Edistynyt', '2026-01-01', '2026-12-31',
    '0,2,4', '18:00', '19:30', 'Dojo A', 'Sali A', true,
    EXISTING_CREATED_AT, EXISTING_CREATED_AT,
  ];
  return defaults.map((v, i) => i in overrides ? overrides[i] : v);
}

function makePayload(overrides = {}) {
  return {
    id: EXISTING_ID,
    session_type: 'Advanced',
    session_type_alias: 'Edistynyt',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    weekdays_available: '0,2,4',
    start_time: '18:00',
    end_time: '20:00',
    location: 'Dojo B',
    location_alias: 'Sali B',
    active: true,
    ...overrides,
  };
}

function makeMockSheet() {
  const rangeUpdates = [];
  const cellUpdates = [];
  return {
    sheet: {
      getRange(row, col, numRows, numCols) {
        return {
          setValues(vals) { rangeUpdates.push({ row, col, numRows, numCols, vals }); },
          setValue(val) { cellUpdates.push({ row, col, val }); },
        };
      },
    },
    rangeUpdates,
    cellUpdates,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

test('updateSessionSchedule_ returns validationFailed for missing id', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload({ id: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('updateSessionSchedule_ returns validationFailed for invalid field', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload({ session_type: '' }));
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

// ─── Not found ────────────────────────────────────────────────────────────────

test('updateSessionSchedule_ returns noMatchFound when id does not exist', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload({ id: 'nonexistent' }));
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

// ─── Duplicate detection ──────────────────────────────────────────────────────

test('updateSessionSchedule_ returns scheduleAlreadyExists for duplicate on another row', () => {
  const sb = createSandbox();
  const otherRow = [
    '9999999999999', 'Advanced', 'Edistynyt', '2026-01-01', '2026-12-31',
    '0,2,4', '18:00', '20:00', 'Dojo B', 'Sali B', true,
    '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
  ];
  sb.getSheetData = (_name) => [makeExistingRow(), otherRow];
  const { sheet } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload());
  assert.deepEqual(toPlain(result), { scheduleAlreadyExists: true });
});

test('updateSessionSchedule_ does not flag self as duplicate', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet, rangeUpdates } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  // Update with same values — should succeed
  const result = sb.updateSessionSchedule_(makePayload({ end_time: '19:30', location: 'Dojo A' }));
  assert.equal(result.scheduleAlreadyExists, undefined);
  assert.ok(result.schedule);
  assert.equal(rangeUpdates.length, 1);
});

// ─── Concurrency ─────────────────────────────────────────────────────────────

test('updateSessionSchedule_ returns concurrentRequest when lock fails', () => {
  const sb = createSandbox(false);
  const result = sb.updateSessionSchedule_(makePayload());
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

// ─── Successful update ────────────────────────────────────────────────────────

test('updateSessionSchedule_ updates B-K and M, never touches A or L', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet, rangeUpdates, cellUpdates } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload());

  // B-K range: col=2, numCols=10
  assert.equal(rangeUpdates.length, 1);
  assert.equal(rangeUpdates[0].col, 2);
  assert.equal(rangeUpdates[0].numCols, 10);

  // M column: col=13
  assert.equal(cellUpdates.length, 1);
  assert.equal(cellUpdates[0].col, 13);

  // id and created_at are preserved from the existing row
  assert.equal(result.schedule.id, EXISTING_ID);
  assert.equal(result.schedule.created_at, EXISTING_CREATED_AT);

  // updated_at is a new ISO timestamp
  assert.ok(result.schedule.updated_at);
  assert.notEqual(result.schedule.updated_at, EXISTING_CREATED_AT);
});

test('updateSessionSchedule_ returns updated schedule record', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  const { sheet } = makeMockSheet();
  sb.getSheetByName = (_name) => sheet;

  const result = sb.updateSessionSchedule_(makePayload({ location: 'Dojo B', end_time: '20:00' }));

  assert.equal(result.schedule.location, 'Dojo B');
  assert.equal(result.schedule.end_time, '20:00');
  assert.equal(result.schedule.id, EXISTING_ID);
  assert.equal(result.schedule.created_at, EXISTING_CREATED_AT);
});
