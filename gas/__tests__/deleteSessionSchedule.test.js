/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for deleteSessionSchedule_ (OQM-0042).
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

const TARGET_ID = '1718294400000';

function makeExistingRow(id = TARGET_ID) {
  return [
    id, 'Advanced', 'Edistynyt', '2026-01-01', '2026-12-31',
    '0,2,4', '18:00', '19:30', 'Dojo A', 'Sali A', true,
    '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z',
  ];
}

// ─── Validation ───────────────────────────────────────────────────────────────

test('deleteSessionSchedule_ returns validationFailed for missing id', () => {
  const sb = createSandbox();
  const result = sb.deleteSessionSchedule_({});
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

test('deleteSessionSchedule_ returns validationFailed for null payload', () => {
  const sb = createSandbox();
  const result = sb.deleteSessionSchedule_(null);
  assert.deepEqual(toPlain(result), { validationFailed: true });
});

// ─── Not found ────────────────────────────────────────────────────────────────

test('deleteSessionSchedule_ returns noMatchFound when id not in sheet', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [makeExistingRow()];
  sb.getSheetByName = (_name) => ({ deleteRow() {} });

  const result = sb.deleteSessionSchedule_({ id: 'nonexistent' });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

test('deleteSessionSchedule_ returns noMatchFound for empty sheet', () => {
  const sb = createSandbox();
  sb.getSheetData = (_name) => [];
  sb.getSheetByName = (_name) => ({ deleteRow() {} });

  const result = sb.deleteSessionSchedule_({ id: TARGET_ID });
  assert.deepEqual(toPlain(result), { noMatchFound: true });
});

// ─── Concurrency ─────────────────────────────────────────────────────────────

test('deleteSessionSchedule_ returns concurrentRequest when lock fails', () => {
  const sb = createSandbox(false);
  const result = sb.deleteSessionSchedule_({ id: TARGET_ID });
  assert.deepEqual(toPlain(result), { concurrentRequest: true });
});

// ─── Successful delete ────────────────────────────────────────────────────────

test('deleteSessionSchedule_ calls deleteRow with correct 1-based sheet row index', () => {
  const sb = createSandbox();
  const deletedRows = [];
  sb.getSheetData = (_name) => [makeExistingRow()]; // data index 0 → sheet row 2
  sb.getSheetByName = (_name) => ({ deleteRow(row) { deletedRows.push(row); } });

  const result = sb.deleteSessionSchedule_({ id: TARGET_ID });
  assert.deepEqual(toPlain(result), { deletedId: TARGET_ID });
  assert.equal(deletedRows.length, 1);
  assert.equal(deletedRows[0], 2); // dataIndex(0) + 2 = sheet row 2
});

test('deleteSessionSchedule_ deletes correct row when target is second data row', () => {
  const sb = createSandbox();
  const deletedRows = [];
  sb.getSheetData = (_name) => [
    makeExistingRow('OTHER_ID'),   // data index 0 → sheet row 2
    makeExistingRow(TARGET_ID),    // data index 1 → sheet row 3
  ];
  sb.getSheetByName = (_name) => ({ deleteRow(row) { deletedRows.push(row); } });

  const result = sb.deleteSessionSchedule_({ id: TARGET_ID });
  assert.deepEqual(toPlain(result), { deletedId: TARGET_ID });
  assert.equal(deletedRows[0], 3); // dataIndex(1) + 2 = sheet row 3
});
