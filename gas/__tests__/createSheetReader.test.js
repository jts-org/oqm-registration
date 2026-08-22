/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests proving createSheetReader_() memoizes SpreadsheetApp.openById()
 * per-instance only, with no global/shared state leaking across separate reader instances.
 * @see .github/skills/wire-react-to-gas/SKILL.md
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createSandbox(openByIdCounter) {
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
        openByIdCounter.count += 1;
        return {
          getSheetByName(name) {
            return {
              getDataRange() {
                return {
                  getValues() {
                    return [['header'], [name]];
                  },
                };
              },
            };
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
  sandbox.logToSheet = () => {};
  return sandbox;
}

test('createSheetReader_ memoizes SpreadsheetApp.openById across multiple getSheetData calls on the same instance', () => {
  const counter = { count: 0 };
  const sandbox = createSandbox(counter);

  const reader = sandbox.createSheetReader_();
  const sheetNames = ['sessions_schedule', 'coach_registrations', 'coach_login', 'camps', 'camp_schedules'];
  sheetNames.forEach((name) => reader.getSheetData(name));

  assert.equal(counter.count, 1, 'Expected SpreadsheetApp.openById to be called exactly once across 5 getSheetData calls on the same reader instance');
});

test('createSheetReader_ memoization is per-instance, not global — a new instance triggers a fresh openById call', () => {
  const counter = { count: 0 };
  const sandbox = createSandbox(counter);

  const firstReader = sandbox.createSheetReader_();
  firstReader.getSheetData('sessions_schedule');
  firstReader.getSheetData('coach_registrations');
  assert.equal(counter.count, 1, 'Expected first reader instance to open the spreadsheet once');

  const secondReader = sandbox.createSheetReader_();
  secondReader.getSheetData('coach_login');
  assert.equal(counter.count, 2, 'Expected a new reader instance (simulating a new request) to trigger a fresh openById call, proving no global/shared memoization');
});
