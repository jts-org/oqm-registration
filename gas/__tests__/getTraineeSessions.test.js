/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for identity-aware trainee session flags (OQM-0033).
 * @see skills/SKILL.wire-react-to-gas.md
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDate(date, format) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  if (format === 'yyyy-MM-dd') return `${y}-${m}-${d}`;
  if (format === 'HH:mm') return `${hh}:${mm}`;
  return date.toISOString();
}

function todayYmd() {
  return formatDate(new Date(), 'yyyy-MM-dd');
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
      formatDate(date, _tz, pattern) {
        if (!(date instanceof Date)) return String(date || '');
        return formatDate(date, pattern);
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

function buildSheetData(registrationRows) {
  const today = todayYmd();
  return {
    sessions: [
      ['session-basic', 'Basic', 'Basic', '2020-01-01', '2099-12-31'],
    ],
    weekly_schedule: [
      ['weekly-basic', 'Basic', '0,1,2,3,4,5,6', '18:00', '19:00', 'Main Hall', true],
    ],
    coach_registrations: [],
    camps: [],
    camp_schedules: [],
    trainee_registrations: registrationRows.map(row => [
      row.id,
      row.first_name,
      row.last_name,
      row.age_group,
      row.underage_age,
      row.session_type,
      row.camp_session_id,
      row.date || today,
      row.start_time,
      row.end_time,
      true,
      '2026-01-01T00:00:00.000Z',
      '2026-01-01T00:00:00.000Z',
    ]),
  };
}

function pickTodayBasicSession(sessions) {
  return sessions.find(session => session.session_type === 'Basic' && session.date === todayYmd());
}

test('getTraineeSessions_ marks matching adult registration as trainee_registered', () => {
  const sandbox = createSandbox();
  const data = buildSheetData([
    {
      id: 'reg-1',
      first_name: 'Jane',
      last_name: 'Doe',
      age_group: 'adult',
      underage_age: '',
      session_type: 'basic',
      camp_session_id: '',
      start_time: '18:00',
      end_time: '19:00',
    },
  ]);

  sandbox.getSheetData = (sheetName) => data[sheetName] || [];

  const sessions = sandbox.getTraineeSessions_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
  });

  const todaySession = pickTodayBasicSession(sessions);
  assert.ok(todaySession, 'Expected a Basic session in the current 21-day window');
  assert.equal(todaySession.trainee_registered, true);
});

test('getTraineeSessions_ requires matching underage_age for underage identity', () => {
  const sandbox = createSandbox();
  const data = buildSheetData([
    {
      id: 'reg-2',
      first_name: 'Junior',
      last_name: 'Doe',
      age_group: 'underage',
      underage_age: '12',
      session_type: 'basic',
      camp_session_id: '',
      start_time: '18:00',
      end_time: '19:00',
    },
  ]);

  sandbox.getSheetData = (sheetName) => data[sheetName] || [];

  const sessions = sandbox.getTraineeSessions_({
    first_name: 'Junior',
    last_name: 'Doe',
    age_group: 'underage',
    underage_age: 13,
  });

  const todaySession = pickTodayBasicSession(sessions);
  assert.ok(todaySession, 'Expected a Basic session in the current 21-day window');
  assert.notEqual(todaySession.trainee_registered, true);
});
