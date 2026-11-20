const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup() {
  const rows = {
    camps: [['c1', 'Camp', 'Camp', 'Coach', '2026-04-01', '2026-04-03']],
    camp_schedules: [
      ['s1', 'c1', 'First', '2026-04-01', '10:00', '11:00'],
      ['s2', 'c1', 'Second', '2026-04-02', '10:00', '11:00'],
      ['foreign', 'c2', 'Other', '2026-04-01', '10:00', '11:00'],
      ['outside', 'c1', 'Outside', '2026-04-04', '10:00', '11:00'],
    ],
    trainee_registrations: [],
  };
  const writes = [];
  let released = 0;
  const sandbox = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => '' }) },
    Session: { getScriptTimeZone: () => 'UTC' },
    Utilities: { getUuid: (() => { let n = 0; return () => `id-${++n}`; })() },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => { released++; } }) },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8'), sandbox);
  sandbox.getSheetData = name => rows[name];
  sandbox.getSheetByName = () => ({
    getLastRow: () => 1,
    getMaxRows: () => 100,
    getRange: (...args) => ({ setValues: values => writes.push({ args, values }) }),
  });
  return { sandbox, rows, writes, released: () => released };
}

const payload = {
  camp: 'c1', schedule_ids: ['s1', 's2'], first_name: 'Jane', last_name: 'Doe', age_group: 'adult',
  schedules: [
    { id: 's1', session_name: 'First', date: '2026-04-01', start_time: '10:00', end_time: '11:00' },
    { id: 's2', session_name: 'Second', date: '2026-04-02', start_time: '10:00', end_time: '11:00' },
  ],
};

test('resolves only sessions belonging to the camp and within its dates', () => {
  const { sandbox, rows } = setup();
  const result = sandbox.resolveCamp_({ camp: 'c1' }, { getSheetData: name => rows[name] });
  assert.equal(result.ok, true);
  assert.deepEqual(Array.from(result.data.sessions, s => s.id), ['s1', 's2']);
  assert.equal(sandbox.resolveCamp_({ camp: 'unknown' }, { getSheetData: name => rows[name] }).ok, false);
});

test('writes all selected sessions in one full-row range under one lock', () => {
  const { sandbox, writes, released } = setup();
  const result = sandbox.registerTraineeBatchForCamp_(payload);
  assert.equal(result.ok, true);
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].args, [2, 1, 2, 13]);
  assert.deepEqual(Array.from(writes[0].values, row => row[6]), ['s1', 's2']);
  assert.equal(released(), 1);
});

test('extends a full sheet before writing the complete batch', () => {
  const { sandbox } = setup();
  const changes = [];
  sandbox.getSheetByName = () => ({
    getLastRow: () => 10,
    getMaxRows: () => 10,
    insertRowsAfter: (row, count) => changes.push(['insert', row, count]),
    getRange: (...args) => ({ setValues: values => changes.push(['write', args, values.length]) }),
  });
  assert.equal(sandbox.registerTraineeBatchForCamp_(payload).ok, true);
  assert.deepEqual(changes, [['insert', 10, 2], ['write', [11, 1, 2, 13], 2]]);
});

test('rejects invalid, foreign, repeated, stale or already registered sessions without writes', () => {
  for (const ids of [[], ['s1', 'foreign'], ['s1', 's1'], ['s1', 'outside'], ['s1', 'missing']]) {
    const { sandbox, writes } = setup();
    assert.equal(sandbox.registerTraineeBatchForCamp_({ ...payload, schedule_ids: ids }).ok, false);
    assert.equal(writes.length, 0);
  }
  const { sandbox, rows, writes } = setup();
  rows.trainee_registrations.push(['old', 'jane', 'DOE', 'adult', '', 'Camp - First', 's1', '2026-04-01', '10:00', '11:00', true]);
  assert.equal(sandbox.registerTraineeBatchForCamp_(payload).ok, false);
  assert.equal(writes.length, 0);
});

test('rejects a schedule changed after resolution without writing', () => {
  const { sandbox, rows, writes } = setup();
  rows.camp_schedules[1][4] = '12:00';
  assert.equal(sandbox.registerTraineeBatchForCamp_(payload).ok, false);
  assert.equal(writes.length, 0);
});

test('public POST dispatch resolves and registers without a session token', () => {
  const { sandbox, rows, writes } = setup();
  sandbox.createSheetReader_ = () => ({ getSheetData: name => rows[name] });
  sandbox.logToSheet = () => {};
  sandbox.json_ = value => value;
  const post = (route, body) => sandbox.doPost({ postData: { contents: JSON.stringify({ route, payload: body }) } });
  assert.equal(post('resolveCamp', { camp: 'c1' }).data.sessions.length, 2);
  assert.equal(post('registerTraineeBatchForCamp', payload).ok, true);
  assert.equal(writes.length, 1);
});

test('rejects missing camps, invalid times, bad ages and lock contention', () => {
  const { sandbox, rows, writes } = setup();
  rows.camp_schedules[0][4] = '';
  assert.equal(sandbox.resolveCamp_({ camp: 'c1' }, { getSheetData: name => rows[name] }).data.sessions.length, 1);
  assert.equal(sandbox.registerTraineeBatchForCamp_({ ...payload, camp: 'missing' }).ok, false);
  assert.equal(sandbox.registerTraineeBatchForCamp_({ ...payload, age_group: 'underage', underage_age: 18 }).error, 'validation_failed_age');
  sandbox.LockService.getScriptLock = () => ({ tryLock: () => false });
  assert.equal(sandbox.registerTraineeBatchForCamp_(payload).error, 'concurrent_request');
  assert.equal(writes.length, 0);
});

test('inactive duplicate does not prevent underage registration', () => {
  const { sandbox, rows, writes } = setup();
  rows.trainee_registrations.push(['old', 'Jane', 'Doe', 'underage', '12', '', 's1', '', '', '', false]);
  const result = sandbox.registerTraineeBatchForCamp_({ ...payload, age_group: 'underage', underage_age: 12 });
  assert.equal(result.ok, true);
  assert.equal(writes[0].values[0][4], 12);
});
