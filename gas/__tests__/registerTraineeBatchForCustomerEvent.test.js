/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for multi-session trainee registration (OQM-0050, Phase 2).
 * Tests atomic multi-session write with eligibility filtering and duplicate prevention.
 * @see .github/skills/wire-react-to-gas/SKILL.md
 * @see .github/skills/gas-locking-and-concurrency/SKILL.md
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
            return null;
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

function makeScheduleRow(overrides = {}) {
  return {
    id: 'schedule-1',
    event_id: 'event-1',
    session_name: 'Basic Session',
    session_name_alias: 'basic',
    date: '2026-04-01',
    start_time: '18:00',
    end_time: '19:00',
    realized: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeEventRow(overrides = {}) {
  const defaults = {
    id: 'event-1',
    event: 'Spring Training',
    event_alias: 'spring-training',
    instructor: 'John Instructor',
    start_date: '2026-04-01',
    end_date: '2026-04-05',
    realized: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
  const merged = { ...defaults, ...overrides };
  return [
    merged.id,
    merged.event,
    merged.event_alias,
    merged.instructor,
    merged.start_date,
    merged.end_date,
    merged.realized,
    merged.created_at,
    merged.updated_at,
  ];
}

function makeScheduleSheetRow(overrides = {}) {
  const defaults = {
    id: 'schedule-1',
    event_id: 'event-1',
    session_name: 'Basic Session',
    session_name_alias: 'basic',
    date: '2026-04-01',
    start_time: '18:00',
    end_time: '19:00',
    realized: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
  const merged = { ...defaults, ...overrides };
  return [
    merged.id,
    merged.event_id,
    merged.session_name,
    merged.session_name_alias,
    merged.date,
    merged.start_time,
    merged.end_time,
    merged.realized,
    merged.created_at,
    merged.updated_at,
  ];
}

test('registerTraineeBatchForCustomerEvent_ registers trainee for single session', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow()];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), {
    ok: true,
    data: {
      registrations: [
        { schedule_id: 'schedule-1', registration_id: 'uuid-fixed' },
      ],
    },
  });
  assert.equal(appended.length, 1);
  assert.equal(appended[0][1], 'Jane');
  assert.equal(appended[0][2], 'Doe');
  assert.equal(appended[0][6], 'schedule-1');  // camp_session_id
});

test('registerTraineeBatchForCustomerEvent_ registers trainee for multiple sessions', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  const scheduleRow2 = makeScheduleSheetRow({ id: 'schedule-2', date: '2026-04-02' });

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [
        makeScheduleSheetRow(),
        scheduleRow2,
      ];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  let uuidCounter = 0;
  sandbox.Utilities.getUuid = () => `uuid-${++uuidCounter}`;

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1', 'schedule-2'],
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.registrations.length, 2);
  assert.equal(appended.length, 2);
  assert.equal(appended[0][6], 'schedule-1');
  assert.equal(appended[1][6], 'schedule-2');
});

test('registerTraineeBatchForCustomerEvent_ rejects empty schedule_ids', () => {
  const sandbox = createSandbox(true);

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: [],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'validation_failed' });
});

test('registerTraineeBatchForCustomerEvent_ rejects missing required fields', () => {
  const sandbox = createSandbox(true);

  const result1 = sandbox.registerTraineeBatchForCustomerEvent_({
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });
  assert.deepEqual(toPlain(result1), { ok: false, error: 'validation_failed' });

  const result2 = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });
  assert.deepEqual(toPlain(result2), { ok: false, error: 'validation_failed' });

  const result3 = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    schedule_ids: ['schedule-1'],
  });
  assert.deepEqual(toPlain(result3), { ok: false, error: 'validation_failed' });
});

test('registerTraineeBatchForCustomerEvent_ validates underage_age requirement', () => {
  const sandbox = createSandbox(true);

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Kid',
    last_name: 'Trainee',
    age_group: 'underage',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'validation_failed_age' });
});

test('registerTraineeBatchForCustomerEvent_ rejects unknown schedule_id', () => {
  const sandbox = createSandbox(true);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_event_schedules') {
      return [];
    }
    return [];
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['unknown-schedule'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'invalid_schedule' });
});

test('registerTraineeBatchForCustomerEvent_ rejects if parent event not found', () => {
  const sandbox = createSandbox(true);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow({ event_id: 'unknown-event' })];
    }
    if (sheetName === 'customer_events') {
      return [];
    }
    return [];
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'invalid_customer_event' });
});

test('registerTraineeBatchForCustomerEvent_ rejects if event is inactive', () => {
  const sandbox = createSandbox(true);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow({ realized: false })];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow()];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'inactive_customer_event' });
});

test('registerTraineeBatchForCustomerEvent_ rejects if schedule is inactive', () => {
  const sandbox = createSandbox(true);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow({ realized: false })];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'invalid_session_eligibility' });
});

test('registerTraineeBatchForCustomerEvent_ rejects if schedule date outside event range', () => {
  const sandbox = createSandbox(true);

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];  // event: 2026-04-01 to 2026-04-05
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow({ date: '2026-03-31' })];  // before event start
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'invalid_session_eligibility' });
});

test('registerTraineeBatchForCustomerEvent_ rejects duplicate for single session in batch', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow()];
    }
    if (sheetName === 'trainee_registrations') {
      return [[
        'existing-reg-1',
        'Jane',
        'Doe',
        'adult',
        '',
        'Basic Session',
        'schedule-1',
        '2026-04-01',
        '18:00',
        '19:00',
        true,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ]];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'duplicate_registration' });
  assert.equal(appended.length, 0);  // All-or-nothing: no write on error
});

test('registerTraineeBatchForCustomerEvent_ rejects duplicate across sessions in batch', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  const scheduleRow2 = makeScheduleSheetRow({ id: 'schedule-2', date: '2026-04-02' });

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [
        makeScheduleSheetRow(),
        scheduleRow2,
        makeScheduleSheetRow({ id: 'schedule-1', date: '2026-04-01' }),  // duplicate within batch
      ];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1', 'schedule-1'],  // duplicate in same request
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'duplicate_registration' });
  assert.equal(appended.length, 0);
});

test('registerTraineeBatchForCustomerEvent_ rejects if lock cannot be acquired', () => {
  const sandbox = createSandbox(false);

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.deepEqual(toPlain(result), { ok: false, error: 'concurrent_request' });
});

test('registerTraineeBatchForCustomerEvent_ respects timezone boundaries for date comparison', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  // Test at midnight boundary: schedule date = 2026-04-01 00:00 UTC
  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];  // event: 2026-04-01 to 2026-04-05
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow({ date: '2026-04-01' })];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.equal(result.ok, true);
  assert.equal(appended.length, 1);
});

test('registerTraineeBatchForCustomerEvent_ handles underage trainee correctly', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow()];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Young',
    last_name: 'Kid',
    age_group: 'underage',
    underage_age: 12,
    schedule_ids: ['schedule-1'],
  });

  assert.equal(result.ok, true);
  assert.equal(appended[0][3], 'underage');
  assert.equal(appended[0][4], '12');
});

test('registerTraineeBatchForCustomerEvent_ appends registrations with correct field mapping', () => {
  const sandbox = createSandbox(true);
  const appended = [];

  sandbox.getSheetData = (sheetName) => {
    if (sheetName === 'customer_events') {
      return [makeEventRow()];
    }
    if (sheetName === 'customer_event_schedules') {
      return [makeScheduleSheetRow()];
    }
    if (sheetName === 'trainee_registrations') {
      return [];
    }
    return [];
  };

  sandbox.getSheetByName = (sheetName) => {
    if (sheetName !== 'trainee_registrations') return null;
    return {
      appendRow(row) {
        appended.push(row);
      },
    };
  };

  const result = sandbox.registerTraineeBatchForCustomerEvent_({
    first_name: 'Jane',
    last_name: 'Doe',
    age_group: 'adult',
    schedule_ids: ['schedule-1'],
  });

  assert.equal(result.ok, true);
  const row = appended[0];
  assert.equal(row[1], 'Jane');           // first_name
  assert.equal(row[2], 'Doe');            // last_name
  assert.equal(row[3], 'adult');          // age_group
  assert.equal(row[4], '');               // underage_age (empty for adult)
  assert.equal(row[5], 'Spring Training - Basic Session');  // session_type (event - session_name)
  assert.equal(row[6], 'schedule-1');     // camp_session_id (schedule id)
  assert.equal(row[7], '2026-04-01');     // date
  assert.equal(row[8], '18:00');          // start_time
  assert.equal(row[9], '19:00');          // end_time
  assert.equal(row[10], true);            // realized
  assert(row[11]);                        // created_at (ISO string)
  assert(row[12]);                        // updated_at (ISO string)
});
