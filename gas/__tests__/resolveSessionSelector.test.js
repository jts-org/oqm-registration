const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDate(date, pattern) {
  const utc = new Date(date);
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc.getUTCDate()).padStart(2, '0');
  const hh = String(utc.getUTCHours()).padStart(2, '0');
  const mm = String(utc.getUTCMinutes()).padStart(2, '0');
  if (pattern === 'yyyy-MM-dd') return `${y}-${m}-${d}`;
  if (pattern === 'HH:mm') return `${hh}:${mm}`;
  return utc.toISOString();
}

function makeTodayYmd() {
  return formatDate(new Date(), 'yyyy-MM-dd');
}

function createSandbox() {
  const sandbox = {
    console,
    CacheService: {
      getScriptCache() {
        return {
          get() { return null; },
          put() { return null; },
        };
      },
    },
    PropertiesService: {
      getScriptProperties() {
        return { getProperty() { return 'test'; } };
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput(payload) {
        return {
          payload,
          setMimeType() { return this; },
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
        return formatDate(date, pattern);
      },
    },
    LockService: {
      getScriptLock() {
        return {
          tryLock() { return true; },
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

function buildReader({ sessionsSchedule = [], coachRegistrations = [] } = {}) {
  return {
    getSheetData(sheetName) {
      if (sheetName === 'sessions_schedule') return sessionsSchedule;
      if (sheetName === 'coach_registrations') return coachRegistrations;
      if (sheetName === 'camps') return [];
      if (sheetName === 'camp_schedules') return [];
      if (sheetName === 'trainee_registrations') return [];
      return [];
    },
  };
}

function makeSessionRow({ sessionType, alias, date = makeTodayYmd(), start = '18:00', end = '19:00', active = true }) {
  return [
    `session-${sessionType}`,
    sessionType,
    alias || sessionType,
    date,
    date,
    '0,1,2,3,4,5,6',
    start,
    end,
    'Main Hall',
    '',
    active,
    '2026-01-01T00:00:00.000Z',
    '2026-01-01T00:00:00.000Z',
  ];
}

test('resolveSessionSelector_ resolves a supported standard selector against today', () => {
  const sandbox = createSandbox();
  const today = makeTodayYmd();
  const result = sandbox.resolveSessionSelector_({ selector: 'advanced' }, buildReader({
    sessionsSchedule: [makeSessionRow({ sessionType: 'Advanced', alias: 'Advanced', date: today })],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.data.selector, 'advanced');
  assert.equal(result.data.session.session_type, 'Advanced');
  assert.equal(result.data.session.date, today);
});

test('resolveSessionSelector_ returns deterministic failure for missing selector', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveSessionSelector_({}, buildReader());

  assert.equal(result.ok, false);
  assert.equal(result.error, 'missing_selector');
});

test('resolveSessionSelector_ returns deterministic failure for unsupported selector', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveSessionSelector_({ selector: 'unknown' }, buildReader());

  assert.equal(result.ok, false);
  assert.equal(result.error, 'unsupported_selector');
});

test('resolveSessionSelector_ fails when no eligible same-day session exists', () => {
  const sandbox = createSandbox();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowYmd = formatDate(tomorrow, 'yyyy-MM-dd');
  const result = sandbox.resolveSessionSelector_({ selector: 'fitness' }, buildReader({
    sessionsSchedule: [makeSessionRow({ sessionType: 'Fitness', alias: 'Fitness', date: tomorrowYmd })],
  }));

  assert.equal(result.ok, false);
  assert.equal(result.error, 'no_session_today');
});

test('resolveSessionSelector_ resolves sparring only when same-day coach registration exists', () => {
  const sandbox = createSandbox();
  const today = makeTodayYmd();
  const result = sandbox.resolveSessionSelector_({ selector: 'sparring' }, buildReader({
    coachRegistrations: [
      ['sparring-1', 'John', 'Doe', 'free/sparring', today, true, '17:00', '18:00', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.data.selector, 'sparring');
  assert.equal(result.data.session.session_type, 'free/sparring');
  assert.equal(result.data.session.is_free_sparring, true);
});

test('resolveSessionSelector_ resolves basic to the active same-day basic_* course', () => {
  const sandbox = createSandbox();
  const today = makeTodayYmd();
  const result = sandbox.resolveSessionSelector_({ selector: 'basic' }, buildReader({
    sessionsSchedule: [
      makeSessionRow({ sessionType: 'basic_adults', alias: 'Basic Adults', date: today }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.data.selector, 'basic');
  assert.equal(result.data.session.session_type, 'basic_adults');
  assert.equal(result.data.session.date, today);
});
