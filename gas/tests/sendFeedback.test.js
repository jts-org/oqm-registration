const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function extractFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}(payload) {`);
  if (start === -1) {
    throw new Error(`Could not find function ${functionName}`);
  }

  let i = start;
  let braceDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingle) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }

    if (inTemplate) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '`') {
        inTemplate = false;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      continue;
    }

    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') {
      braceDepth += 1;
    } else if (ch === '}') {
      braceDepth -= 1;
      if (braceDepth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Could not extract function ${functionName}`);
}

function createSendFeedbackHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
  const functionSource = extractFunction(source, 'sendFeedback_');

  const rows = [];
  const emails = [];
  const logs = [];
  const lock = {
    tryLock() { return true; },
    releaseLock() {},
  };

  const context = {
    LockService: { getScriptLock: () => lock },
    Utilities: { getUuid: () => 'uuid-1' },
    MailApp: { sendEmail: (email) => emails.push(email) },
    logToSheet: (message) => logs.push(message),
    getSheetByName: (sheetName) => {
      if (sheetName !== 'Messages') return null;
      return {
        appendRow: (row) => rows.push(row),
      };
    },
    console,
  };

  vm.createContext(context);
  vm.runInContext(functionSource, context, { filename: 'Code.gs' });

  return {
    context,
    rows,
    emails,
    logs,
  };
}

test('sendFeedback_ writes a row and emails support for a valid payload', () => {
  const { context, rows, emails, logs } = createSendFeedbackHarness();
  const result = context.sendFeedback_({ type: 'feedback', from: 'Ada Lovelace', message: 'The app was great.' });

  assert.equal(result.success, true);
  assert.equal(rows.length, 1);
  assert.equal(rows[0][0], 'uuid-1');
  assert.equal(rows[0][2], 'feedback');
  assert.equal(rows[0][3], 'Ada Lovelace');
  assert.equal(rows[0][4], 'The app was great.');
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to, 'webmaster@oulunkickboxing.fi');
  assert.match(emails[0].body, /Type: feedback/);
  assert.equal(logs.length, 0);
});

test('sendFeedback_ rejects invalid types, empty sender names, and overlong messages', () => {
  const { context } = createSendFeedbackHarness();

  assert.equal(context.sendFeedback_({ type: 'unknown', from: 'Ada', message: 'hello' }).validationFailed, true);
  assert.equal(context.sendFeedback_({ type: 'feedback', from: '   ', message: 'hello' }).validationFailed, true);
  assert.equal(context.sendFeedback_({ type: 'feedback', from: 'Ada', message: 'x'.repeat(501) }).validationFailed, true);
});
