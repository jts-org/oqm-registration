/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for listSessionsSchedule_ (OQM-0042).
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

function createSandbox() {
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
        return { tryLock() { return true; }, releaseLock() {} };
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

function makeSheetRow(overrides = {}) {
  const defaults = [
    '1718294400000', // 0 id
    'Advanced',      // 1 session_type
    'Edistynyt',     // 2 session_type_alias
    '2026-01-01',    // 3 start_date
    '2026-12-31',    // 4 end_date
    '0,2,4',         // 5 weekdays_available
    '18:00',         // 6 start_time
    '19:30',         // 7 end_time
    'Dojo A',        // 8 location
    'Sali A',        // 9 location_alias
    true,            // 10 active
    '2026-01-01T00:00:00.000Z', // 11 created_at
    '2026-01-01T00:00:00.000Z', // 12 updated_at
  ];
  return defaults.map((v, i) => i in overrides ? overrides[i] : v);
}

test('listSessionsSchedule_ returns empty array when sheet is empty', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];

  const result = sb.listSessionsSchedule_();
  assert.deepEqual(toPlain(result), { schedules: [] });
});

test('listSessionsSchedule_ maps all rows to SessionScheduleRecord objects', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeSheetRow(), makeSheetRow({ 0: '1718294400001', 1: 'Basic', 2: 'Perus' })];

  const result = sb.listSessionsSchedule_();
  assert.equal(result.schedules.length, 2);

  const first = result.schedules[0];
  assert.equal(first.id, '1718294400000');
  assert.equal(first.session_type, 'Advanced');
  assert.equal(first.session_type_alias, 'Edistynyt');
  assert.equal(first.start_date, '2026-01-01');
  assert.equal(first.end_date, '2026-12-31');
  assert.equal(first.weekdays_available, '0,2,4');
  assert.equal(first.start_time, '18:00');
  assert.equal(first.end_time, '19:30');
  assert.equal(first.location, 'Dojo A');
  assert.equal(first.location_alias, 'Sali A');
  assert.equal(first.active, true);
  assert.equal(first.created_at, '2026-01-01T00:00:00.000Z');
  assert.equal(first.updated_at, '2026-01-01T00:00:00.000Z');

  assert.equal(result.schedules[1].id, '1718294400001');
  assert.equal(result.schedules[1].session_type, 'Basic');
});

test('listSessionsSchedule_ coerces TRUE string to boolean true for active field', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeSheetRow({ 10: 'TRUE' })];

  const result = sb.listSessionsSchedule_();
  assert.equal(result.schedules[0].active, true);
});

test('listSessionsSchedule_ sets active to false for FALSE value', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeSheetRow({ 10: false })];

  const result = sb.listSessionsSchedule_();
  assert.equal(result.schedules[0].active, false);
});
