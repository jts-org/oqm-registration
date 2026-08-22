/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for getCoachSessions_ sessions_schedule migration (OQM-0044).
 * @see .github/skills/wire-react-to-gas/SKILL.md
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

function createInMemoryCacheService() {
  const store = new Map();
  return {
    getScriptCache() {
      return {
        get(key) {
          return store.has(key) ? store.get(key) : null;
        },
        put(key, value) {
          store.set(key, value);
        },
      };
    },
  };
}

function createThrowingCacheService() {
  return {
    getScriptCache() {
      return {
        get() {
          throw new Error('cache get failure');
        },
        put() {
          throw new Error('cache put failure');
        },
      };
    },
  };
}

function createSandbox(cacheService) {
  const sandbox = {
    console,
    CacheService: cacheService || createInMemoryCacheService(),
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
  sandbox.logToSheet = () => {};
  return sandbox;
}

test('getCoachSessions_ builds regular and free/sparring sessions from sessions_schedule', () => {
  const sandbox = createSandbox();
  const today = todayYmd();

  const data = {
    sessions_schedule: [
      ['schedule-basic', 'Basic', 'Perus', '2020-01-01', '2099-12-31', '0,1,2,3,4,5,6', '18:00', '19:00', 'Main Hall', '', true, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
      ['schedule-sparring', 'FREE/SPARRING', 'VAPAASPARI', '2020-01-01', '2099-12-31', '0,1,2,3,4,5,6', '00:00', '00:00', '', '', true, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    coach_registrations: [
      ['reg-basic', 'John', 'Doe', 'basic', today, true, '', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
      ['reg-spar', 'John', 'Doe', 'free/sparring', today, true, '16:00', '17:00', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    coach_login: [
      ['coach-1', 'John', 'Doe', 'JD', '1234', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    camps: [],
    camp_schedules: [],
  };

  const reader = { getSheetData: (sheetName) => data[sheetName] || [] };

  const sessions = sandbox.getCoachSessions_(reader);

  const regular = sessions.find(s => s.session_type === 'BASIC' && s.date === today && s.is_free_sparring === false);
  assert.ok(regular, 'Expected regular BASIC session for today');
  assert.equal(regular.session_type_alias, 'PERUS');
  assert.equal(regular.coach_firstname, 'John');
  assert.equal(regular.coach_lastname, 'Doe');
  assert.equal(regular.coach_alias, 'JD');
  assert.equal(regular.registration_id, 'reg-basic');

  const sparring = sessions.find(s => s.session_type === 'FREE/SPARRING' && s.date === today && s.is_free_sparring === true);
  assert.ok(sparring, 'Expected free/sparring session for today');
  assert.equal(sparring.session_type_alias, 'VAPAASPARI');
  assert.equal(sparring.start_time, '16:00');
  assert.equal(sparring.end_time, '17:00');
  assert.equal(sparring.coach_alias, 'JD');
  assert.equal(sparring.registration_id, 'reg-spar');
});

function buildCoachSessionData(today) {
  return {
    sessions_schedule: [
      ['schedule-basic', 'Basic', 'Perus', '2020-01-01', '2099-12-31', '0,1,2,3,4,5,6', '18:00', '19:00', 'Main Hall', '', true, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    coach_registrations: [
      ['reg-basic', 'John', 'Doe', 'basic', today, true, '', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    coach_login: [
      ['coach-1', 'John', 'Doe', 'JD', '1234', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
    camps: [],
    camp_schedules: [],
  };
}

test('getCoachSessions_ caches computed sessions and avoids re-reading sheets within TTL', () => {
  const sandbox = createSandbox();
  const today = todayYmd();
  const data = buildCoachSessionData(today);
  let callCount = 0;
  const reader = {
    getSheetData: (sheetName) => {
      callCount += 1;
      return data[sheetName] || [];
    },
  };

  const first = sandbox.getCoachSessions_(reader);
  const callsAfterFirstInvocation = callCount;
  assert.ok(callsAfterFirstInvocation > 0, 'Expected first call to read sheets');

  const second = sandbox.getCoachSessions_(reader);
  assert.equal(callCount, callsAfterFirstInvocation, 'Expected cache hit to avoid re-reading sheets');
  assert.equal(second.length, first.length);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test('getCoachSessions_ fails open and still returns correct sessions when CacheService throws', () => {
  const sandbox = createSandbox(createThrowingCacheService());
  const today = todayYmd();
  const data = buildCoachSessionData(today);
  const reader = { getSheetData: (sheetName) => data[sheetName] || [] };

  const sessions = sandbox.getCoachSessions_(reader);

  const regular = sessions.find(s => s.session_type === 'BASIC' && s.date === today);
  assert.ok(regular, 'Expected regular BASIC session for today despite CacheService failure');
  assert.equal(regular.coach_firstname, 'John');
});

test('getCoachSessions_ with a real createSheetReader_() opens the spreadsheet exactly once despite reading multiple sheets', () => {
  const sandbox = createSandbox();
  const today = todayYmd();
  const data = buildCoachSessionData(today);

  let openByIdCallCount = 0;
  sandbox.SpreadsheetApp = {
    openById() {
      openByIdCallCount += 1;
      return {
        getSheetByName(name) {
          return {
            getDataRange() {
              return {
                getValues() {
                  return [['header'], ...(data[name] || [])];
                },
              };
            },
          };
        },
      };
    },
  };

  const reader = sandbox.createSheetReader_();
  const sessions = sandbox.getCoachSessions_(reader);

  const regular = sessions.find(s => s.session_type === 'BASIC' && s.date === today);
  assert.ok(regular, 'Expected regular BASIC session for today via real createSheetReader_()');
  assert.equal(openByIdCallCount, 1, 'Expected SpreadsheetApp.openById to be called exactly once for a single getCoachSessions_ invocation despite reading multiple sheets');
});
