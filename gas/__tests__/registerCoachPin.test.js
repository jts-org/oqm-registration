/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Backend unit tests for coach PIN registration conflict handling (OQM-0025).
 * @see skills/SKILL.wire-react-to-gas.md
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
        return 'uuid-1';
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
  return sandbox;
}

test('registerCoachPin_ returns mismatchingAliases when row alias exists but payload alias is empty', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', 'JD', '', '2026-01-01T00:00:00.000Z', '']];
    }
    return [];
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' });

  assert.deepEqual(toPlain(result), { mismatchingAliases: true });
});

test('registerCoachPin_ returns mismatchingAliases when aliases differ', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', 'JD', '', '2026-01-01T00:00:00.000Z', '']];
    }
    return [];
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: 'Johnny', pin: '1234' });

  assert.deepEqual(toPlain(result), { mismatchingAliases: true });
});

test('registerCoachPin_ returns alreadyRegistered when same-name row has same pin', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', 'JD', '1234', '2026-01-01T00:00:00.000Z', '']];
    }
    return [];
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });

  assert.deepEqual(toPlain(result), { alreadyRegistered: true });
});

test('registerCoachPin_ returns pinsDoNotMatch when same-name row has different pin', () => {
  const sandbox = createSandbox();
  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', 'JD', '9999', '2026-01-01T00:00:00.000Z', '']];
    }
    return [];
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });

  assert.deepEqual(toPlain(result), { pinsDoNotMatch: true });
});

test('registerCoachPin_ updates same-name row with empty pin and sets last_activity in column G', () => {
  const sandbox = createSandbox();
  const updates = [];
  const coachSheet = {
    getRange(row, col) {
      return {
        setValue(value) {
          updates.push({ row, col, value });
        },
      };
    },
    appendRow() {
      throw new Error('appendRow should not be called when matching name exists');
    },
  };

  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', '', '', '2026-01-01T00:00:00.000Z', '']];
    }
    if (sheetName === 'trainee_login') {
      return [];
    }
    return [];
  };
  sandbox.getSheetByName = sheetName => {
    if (sheetName === 'coach_login') return coachSheet;
    return null;
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: '', pin: '1234' });

  assert.equal(result.id, 'id-1');
  assert.equal(result.firstname, 'John');
  assert.equal(result.lastname, 'Doe');
  assert.equal(result.alias, '');
  assert.equal(result.pin, '1234');
  assert.equal(typeof result.created_at, 'string');
  assert.equal(updates.length, 2);
  assert.deepEqual(updates.map(u => u.col), [5, 7]);
  assert.equal(updates[0].row, 2);
  assert.equal(updates[1].row, 2);
  assert.equal(updates[0].value, '1234');
  assert.equal(typeof updates[1].value, 'string');
  assert.ok(updates[1].value.length > 0);
});

test('registerCoachPin_ stores payload alias into row alias when same-name row alias is empty', () => {
  const sandbox = createSandbox();
  const updates = [];
  const coachSheet = {
    getRange(row, col) {
      return {
        setValue(value) {
          updates.push({ row, col, value });
        },
      };
    },
    appendRow() {
      throw new Error('appendRow should not be called when matching name exists');
    },
  };

  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', '', '', '2026-01-01T00:00:00.000Z', '']];
    }
    if (sheetName === 'trainee_login') {
      return [];
    }
    return [];
  };
  sandbox.getSheetByName = sheetName => {
    if (sheetName === 'coach_login') return coachSheet;
    return null;
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });

  assert.equal(result.alias, 'JD');
  assert.equal(updates.length, 3);
  assert.deepEqual(updates.map(u => u.col), [4, 5, 7]);
  assert.equal(updates[0].row, 2);
  assert.equal(updates[0].value, 'JD');
  assert.equal(updates[1].value, '1234');
  assert.equal(typeof updates[2].value, 'string');
});

test('registerCoachPin_ keeps no-match path by appending a new row', () => {
  const sandbox = createSandbox();
  const appendedRows = [];
  const coachSheet = {
    appendRow(row) {
      appendedRows.push(row);
    },
  };

  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-2', 'Other', 'Name', '', '5555', '2026-01-01T00:00:00.000Z', '']];
    }
    if (sheetName === 'trainee_login') {
      return [];
    }
    return [];
  };
  sandbox.getSheetByName = sheetName => {
    if (sheetName === 'coach_login') return coachSheet;
    return null;
  };

  const result = sandbox.registerCoachPin_({ firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234' });

  assert.equal(result.id, 'uuid-1');
  assert.equal(result.firstname, 'John');
  assert.equal(result.lastname, 'Doe');
  assert.equal(result.alias, 'JD');
  assert.equal(result.pin, '1234');
  assert.equal(typeof result.created_at, 'string');
  assert.equal(appendedRows.length, 1);
  assert.equal(appendedRows[0][1], 'John');
  assert.equal(appendedRows[0][2], 'Doe');
  assert.equal(appendedRows[0][3], 'JD');
  assert.equal(appendedRows[0][4], '1234');
});

test('registerCoachForSession_ appends lowercase session_type to coach_registrations', () => {
  const sandbox = createSandbox();
  const appendedRows = [];
  const coachRegSheet = {
    appendRow(row) {
      appendedRows.push(row);
    },
  };

  sandbox.getSheetData = sheetName => {
    if (sheetName === 'coach_login') {
      return [['id-1', 'John', 'Doe', '', '1234', '2026-01-01T00:00:00.000Z', '']];
    }
    if (sheetName === 'coach_registrations') {
      return [];
    }
    return [];
  };
  sandbox.getSheetByName = sheetName => {
    if (sheetName === 'coach_registrations') return coachRegSheet;
    return null;
  };

  const result = sandbox.registerCoachForSession_({
    firstname: 'John',
    lastname: 'Doe',
    session_type: 'FREE/SPARRING',
    date: '2026-03-21',
    start_time: '10:00',
    end_time: '11:00',
  });

  assert.deepEqual(toPlain(result), { id: 'uuid-1' });
  assert.equal(appendedRows.length, 1);
  assert.equal(appendedRows[0][3], 'free/sparring');
});

test('doPost returns new registerCoachPin error codes to frontend', () => {
  const sandbox = createSandbox();
  sandbox.registerCoachPin_ = () => ({ mismatchingAliases: true });
  let result = sandbox.doPost({
    postData: { contents: JSON.stringify({ route: 'registerCoachPin', payload: {}, token: 'test' }) },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(result.payload), { ok: false, error: 'mismatching_aliases' });

  sandbox.registerCoachPin_ = () => ({ alreadyRegistered: true });
  result = sandbox.doPost({
    postData: { contents: JSON.stringify({ route: 'registerCoachPin', payload: {}, token: 'test' }) },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(result.payload), { ok: false, error: 'already_registered' });

  sandbox.registerCoachPin_ = () => ({ pinsDoNotMatch: true });
  result = sandbox.doPost({
    postData: { contents: JSON.stringify({ route: 'registerCoachPin', payload: {}, token: 'test' }) },
    parameter: {},
  });
  assert.deepEqual(JSON.parse(result.payload), { ok: false, error: 'pins_do_not_match' });
});
