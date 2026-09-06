/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for customer event resolver route (OQM-0050 tracer).
 * @see .github/skills/wire-react-to-gas/SKILL.md
 * @see tracks/feature-oqm-0050-qr-customer-event-registration/spec.md
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
  sandbox.logToSheet = () => {};
  return sandbox;
}

function buildReader({
  customerEvents = [],
  customerEventSchedules = [],
} = {}) {
  return {
    getSheetData(sheetName) {
      if (sheetName === 'customer_events') return customerEvents;
      if (sheetName === 'customer_event_schedules') return customerEventSchedules;
      return [];
    },
  };
}

function makeCustomerEventRow({
  id = 'event-1',
  event = 'Boxing Fundamentals',
  eventAlias = 'Basics',
  instructor = 'John Doe',
  startDate = '2026-09-01',
  endDate = '2026-09-10',
  realized = true,
}) {
  return [
    id,
    event,
    eventAlias,
    instructor,
    startDate,
    endDate,
    realized,
    '2026-08-31T00:00:00.000Z',
    '2026-08-31T00:00:00.000Z',
  ];
}

function makeScheduleRow({
  id = 'schedule-1',
  eventId = 'event-1',
  sessionName = 'Boxing Class',
  sessionAlias = 'Class A',
  date = '2026-09-01',
  startTime = '18:00',
  endTime = '19:00',
  realized = true,
}) {
  return [
    id,
    eventId,
    sessionName,
    sessionAlias,
    date,
    startTime,
    endTime,
    realized,
    '2026-08-31T00:00:00.000Z',
    '2026-08-31T00:00:00.000Z',
  ];
}

test('resolveCustomerEvent_ returns error for missing customer_event parameter', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_({}, buildReader());

  assert.equal(result.ok, false);
  assert.equal(result.error, 'missing_customer_event');
});

test('resolveCustomerEvent_ returns error for empty customer_event parameter', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: '   ' },
    buildReader()
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, 'missing_customer_event');
});

test('resolveCustomerEvent_ returns error for invalid customer_event identifier', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'nonexistent-event-id' },
    buildReader({
      customerEvents: [makeCustomerEventRow({ id: 'event-1' })],
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, 'invalid_customer_event');
});

test('resolveCustomerEvent_ returns error for inactive customer event (realized=false)', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [makeCustomerEventRow({ id: 'event-1', realized: false })],
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, 'inactive_customer_event');
});

test('resolveCustomerEvent_ returns event with zero available sessions', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.event.id, 'event-1');
  assert.equal(result.data.event.event, 'Boxing Fundamentals');
  assert.equal(result.data.sessions.length, 0);
  assert.deepEqual(result.data.sessions, []);
});

test('resolveCustomerEvent_ returns event with one available session', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          sessionName: 'Class A',
          date: '2026-09-01',
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.event.id, 'event-1');
  assert.equal(result.data.sessions.length, 1);
  assert.equal(result.data.sessions[0].id, 'schedule-1');
  assert.equal(result.data.sessions[0].session_name, 'Class A');
  assert.equal(result.data.sessions[0].date, '2026-09-01');
});

test('resolveCustomerEvent_ returns event with multiple available sessions', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          sessionName: 'Class A',
          date: '2026-09-01',
          startTime: '18:00',
          endTime: '19:00',
        }),
        makeScheduleRow({
          id: 'schedule-2',
          eventId: 'event-1',
          sessionName: 'Class B',
          date: '2026-09-02',
          startTime: '19:00',
          endTime: '20:00',
        }),
        makeScheduleRow({
          id: 'schedule-3',
          eventId: 'event-1',
          sessionName: 'Class C',
          date: '2026-09-03',
          startTime: '17:00',
          endTime: '18:00',
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.event.id, 'event-1');
  assert.equal(result.data.sessions.length, 3);
  assert.equal(result.data.sessions[0].id, 'schedule-1');
  assert.equal(result.data.sessions[1].id, 'schedule-2');
  assert.equal(result.data.sessions[2].id, 'schedule-3');
});

test('resolveCustomerEvent_ filters out sessions outside event date range', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          date: '2026-08-31', // Before event start
        }),
        makeScheduleRow({
          id: 'schedule-2',
          eventId: 'event-1',
          date: '2026-09-05', // Within range
        }),
        makeScheduleRow({
          id: 'schedule-3',
          eventId: 'event-1',
          date: '2026-09-11', // After event end
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.sessions.length, 1);
  assert.equal(result.data.sessions[0].id, 'schedule-2');
});

test('resolveCustomerEvent_ filters out inactive sessions (realized=false)', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          date: '2026-09-01',
          realized: true,
        }),
        makeScheduleRow({
          id: 'schedule-2',
          eventId: 'event-1',
          date: '2026-09-02',
          realized: false,
        }),
        makeScheduleRow({
          id: 'schedule-3',
          eventId: 'event-1',
          date: '2026-09-03',
          realized: true,
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.sessions.length, 2);
  assert.equal(result.data.sessions[0].id, 'schedule-1');
  assert.equal(result.data.sessions[1].id, 'schedule-3');
});

test('resolveCustomerEvent_ filters out sessions for different event_id', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Boxing Fundamentals',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
        makeCustomerEventRow({
          id: 'event-2',
          event: 'Muay Thai',
          startDate: '2026-10-01',
          endDate: '2026-10-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          date: '2026-09-01',
        }),
        makeScheduleRow({
          id: 'schedule-2',
          eventId: 'event-2',
          date: '2026-10-01',
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.event.id, 'event-1');
  assert.equal(result.data.sessions.length, 1);
  assert.equal(result.data.sessions[0].event_id, 'event-1');
});

test('resolveCustomerEvent_ returns properly mapped event record', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          event: 'Advanced Boxing',
          eventAlias: 'Adv',
          instructor: 'Jane Smith',
          startDate: '2026-09-01',
          endDate: '2026-09-15',
          realized: true,
        }),
      ],
      customerEventSchedules: [],
    })
  );

  assert.equal(result.ok, true);
  const event = result.data.event;
  assert.equal(event.id, 'event-1');
  assert.equal(event.event, 'Advanced Boxing');
  assert.equal(event.event_alias, 'Adv');
  assert.equal(event.instructor, 'Jane Smith');
  assert.equal(event.start_date, '2026-09-01');
  assert.equal(event.end_date, '2026-09-15');
  assert.equal(event.realized, true);
});

test('resolveCustomerEvent_ returns properly mapped session records', () => {
  const sandbox = createSandbox();
  const result = sandbox.resolveCustomerEvent_(
    { customer_event: 'event-1' },
    buildReader({
      customerEvents: [
        makeCustomerEventRow({
          id: 'event-1',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        }),
      ],
      customerEventSchedules: [
        makeScheduleRow({
          id: 'schedule-1',
          eventId: 'event-1',
          sessionName: 'Boxing Basics',
          sessionAlias: 'Basics',
          date: '2026-09-05',
          startTime: '18:30',
          endTime: '19:30',
          realized: true,
        }),
      ],
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.sessions.length, 1);
  const session = result.data.sessions[0];
  assert.equal(session.id, 'schedule-1');
  assert.equal(session.event_id, 'event-1');
  assert.equal(session.session_name, 'Boxing Basics');
  assert.equal(session.session_name_alias, 'Basics');
  assert.equal(session.date, '2026-09-05');
  assert.equal(session.start_time, '18:30');
  assert.equal(session.end_time, '19:30');
  assert.equal(session.realized, true);
});

test('normalizeDateYmd_ and normalizeTimeHm_ handle localized Date strings and Date objects correctly', () => {
  const sandbox = createSandbox();
  const tz = 'UTC';

  assert.equal(
    sandbox.normalizeDateYmd_('2026-04-15', tz),
    '2026-04-15'
  );
  assert.equal(
    sandbox.normalizeTimeHm_('Sat Dec 30 1899 11:45:00 GMT+0139 (Itä-Euroopan normaaliaika)', tz),
    '11:45'
  );
  assert.equal(
    sandbox.normalizeTimeHm_('Sat Dec 30 1899 13:15:00 GMT+0139 (Itä-Euroopan normaaliaika)', tz),
    '13:15'
  );
});
