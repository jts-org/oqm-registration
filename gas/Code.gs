/**
 * Web API for Sheets
 * Routes:
 *  - GET  ?route=listItems       — list items from Data sheet
 *  - GET  ?route=getSettings     — list rows from settings sheet (QCM-0001)
 *  - GET  ?route=getCoachSessions — fetch 21-day session window (OQM-0007)
 *  - GET  ?route=getTraineeSessions — fetch trainee-facing 21-day session window (OQM-0015)
 *  - POST { route: "getTraineeSessions", payload?: { first_name, last_name, age_group, underage_age? } } — fetch trainee-facing 21-day session window with optional trainee identity flags (OQM-0033)
 *  - POST { route: "coachLogin", payload: { mode: "pin"|"password", pin?|password? } } — create coach session token
 *  - POST { route: "adminLogin", payload: { password } } — create admin session token
 *  - POST { route: "createItem", payload: { name, email } }
 *  - POST { route: "registerCoachPin", payload: { firstname, lastname, alias, pin, password } } — register a new coach PIN code (OQM-0003, OQM-0030)
 *  - POST { route: "verifyCoachPin", payload: { pin } } — verify a coach PIN against coach_login sheet (OQM-0004)
 *  - POST { route: "registerCoachForSession", payload: { firstname, lastname, session_type, date, start_time?, end_time? } } — register coach for a session (OQM-0008/OQM-0011); returns overlapping_session|date|start|end for time conflicts
 *  - POST { route: "removeCoachFromSession", payload: { firstname, lastname, session_type, date } } — remove coach from a session (OQM-0009)
 *  - POST { route: "registerTraineePin", payload: { firstname, lastname, age, pin } } — register a new trainee PIN code (OQM-0016)
 *  - POST { route: "verifyTraineePin", payload: { pin } } — verify a trainee PIN against trainee_login sheet (OQM-0016)
 *  - POST { route: "sendFeedback", payload: { type: "feedback"|"bug_report"|"support_request", from, message } } — store feedback, bug reports, or support requests in the Messages sheet and notify support (OQM-0046)
 *  - POST { route: "registerTraineeForSession", payload: { first_name, last_name, age_group, underage_age?, session_type, camp_session_id?, date, start_time, end_time } } — register trainee for a session (OQM-0014)
 *  - POST { route: "resolveSessionSelector", payload: { selector } } — resolve a QR selector against today’s backend-day session schedule and return a single deterministic candidate (OQM-0049 tracer)
 *  - POST { route: "registerTraineeBatchForSessions", payload: { rows: [{ first_name, last_name, age_group, underage_age?, session_type, camp_session_id?, date, start_time?, end_time? }] }, sessionToken } — admin batch trainee registrations (OQM-0034)
 *  - POST { route: "registerCustomerEventWithSchedule", payload: { event, event_alias, instructor, start_date, end_date, schedules: [{ session_name, session_name_alias, date, start_time, end_time }] }, sessionToken } — admin customer event + schedule creation (OQM-0035)
 * Internal helpers (not exposed as routes):
 *  - updateCoachLastActivity_(coachId) — sets last_activity in coach_login (OQM-0011)
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const COACH_PASSWORD = PropertiesService.getScriptProperties().getProperty('COACH_PASSWORD');
const ADMIN_PASSWORD = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function doGet(e) {
  try {
    const route = (e.parameter.route || '').toString();
    authorize_(e, route);
    logToSheet(`doGet - route: ${route}`);
    if (route === 'listItems') {
      const data = listItems_();
      return json_({ ok: true, data });
    }
    if (route === 'getSettings') {
      const data = listSettings_();
      return json_({ ok: true, data });
    }
    if (route === 'getCoachSessions') {
      const reader = createSheetReader_();
      const data = getCoachSessions_(reader);
      return json_({ ok: true, data });
    }
    if (route === 'getTraineeSessions') {
      const reader = createSheetReader_();
      const data = getTraineeSessions_(undefined, reader);
      return json_({ ok: true, data });
    }
    if (route === 'resolveSessionSelector') {
      const selectorPayload = {
        selector: e.parameter && e.parameter.selector ? e.parameter.selector : e.parameter && e.parameter.session ? e.parameter.session : ''
      };
      const result = resolveSessionSelector_(selectorPayload, createSheetReader_());
      if (!result.ok) {
        return json_({ ok: false, error: result.error });
      }
      return json_({ ok: true, data: result.data });
    }
    if (route === 'listSessionsSchedule') {
      const data = listSessionsSchedule_();
      return json_({ ok: true, data });
    }
    if (route === 'listCoachAccounts') {
      const data = listCoachAccounts_();
      return json_({ ok: true, data });
    }
    if (route === 'listTraineeAccounts') {
      const data = listTraineeAccounts_();
      return json_({ ok: true, data });
    }
    return json_({ ok: false, error: 'Unknown route' });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 400);
  }
}

function doPost(e) {
  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const route = body.route;
    const payload = body.payload;
    if (route === 'coachLogin') {
      const result = coachLogin_(payload);
      return json_({ ok: true, data: result });
    }
    if (route === 'adminLogin') {
      const result = adminLogin_(payload);
      return json_({ ok: true, data: result });
    }

    authorize_(e, route, body);
    logToSheet(`doPost - route: ${route}`);
    if (route === 'getTraineeSessions') {
      const reader = createSheetReader_();
      const data = getTraineeSessions_(payload, reader);
      return json_({ ok: true, data });
    }
    if (route === 'resolveSessionSelector') {
      const result = resolveSessionSelector_(payload, createSheetReader_());
      if (!result.ok) {
        return json_({ ok: false, error: result.error });
      }
      return json_({ ok: true, data: result.data });
    }
    if (route === 'createItem') {
      const created = createItem_(payload);
      return json_({ ok: true, data: created });
    }
    if (route === 'registerCoachPin') {
      const result = registerCoachPin_(payload);
      if (result.invalidPassword) {
        return json_({ ok: false, error: 'invalid_password' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      if (result.mismatchingAliases) {
        return json_({ ok: false, error: 'mismatching_aliases' });
      }
      if (result.alreadyRegistered) {
        return json_({ ok: false, error: 'already_registered' });
      }
      if (result.pinsDoNotMatch) {
        return json_({ ok: false, error: 'pins_do_not_match' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'verifyCoachPin') {
      const coachData = verifyCoachPin_(payload);
      if (!coachData) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      return json_({ ok: true, data: coachData });
    }
    if (route === 'registerCoachForSession') {
      const reader = createSheetReader_();
      const result = registerCoachForSession_(payload, reader);
      if (result.alreadyTaken) {
        return json_({ ok: false, error: 'already_taken' });
      }
      if (result.unknownCoach) {
        return json_({ ok: false, error: 'unknown_coach' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.overlappingSession) {
        return json_({ ok: false, error: `overlapping_session|${result.date}|${result.start_time}|${result.end_time}` });
      }
      return json_({ ok: true, data: { id: result.id } });
    }
    if (route === 'removeCoachFromSession') {
      const reader = createSheetReader_();
      const result = removeCoachFromSession_(payload, reader);
      if (result.concurrentOperation) {
        return json_({ ok: false, error: 'concurrent_operation' });
      }
      if (result.registrationNotFound) {
        return json_({ ok: false, error: 'registration_not_found' });
      }
      if (result.sessionAvailable) {
        return json_({ ok: false, error: 'session_available' });
      }
      return json_({ ok: true, data: { id: result.id } });
    }
    if (route === 'registerTraineePin') {
      const result = registerTraineePin_(payload);
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.nameAlreadyExists) {
        return json_({ ok: false, error: 'name_already_exists' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'verifyTraineePin') {
      const traineeData = verifyTraineePin_(payload);
      if (!traineeData) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      return json_({ ok: true, data: traineeData });
    }
    if (route === 'sendFeedback') {
      const result = sendFeedback_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_error' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      return json_({ ok: true });
    }
    if (route === 'registerTraineeForSession') {
      const result = registerTraineeForSession_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.validationFailedAge) {
        return json_({ ok: false, error: 'validation_failed_age' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.alreadyRegistered) {
        return json_({ ok: false, error: 'already_registered' });
      }
      return json_({ ok: true, data: { id: result.id } });
    }
    if (route === 'registerTraineeBatchForSessions') {
      const result = registerTraineeBatchForSessions_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'registerCustomerEventWithSchedule') {
      const result = registerCustomerEventWithSchedule_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.duplicateEvent) {
        return json_({ ok: false, error: 'already_registered' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'addSessionSchedule') {
      const result = addSessionSchedule_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.scheduleAlreadyExists) {
        return json_({ ok: false, error: 'schedule_already_exists' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'updateSessionSchedule') {
      const result = updateSessionSchedule_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      if (result.scheduleAlreadyExists) {
        return json_({ ok: false, error: 'schedule_already_exists' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'deleteSessionSchedule') {
      const result = deleteSessionSchedule_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      return json_({ ok: true, data: { id: result.deletedId } });
    }
    if (route === 'createCoachAccount') {
      const result = createCoachAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'createTraineeAccount') {
      const result = createTraineeAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'updateCoachAccount') {
      const result = updateCoachAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      if (result.forbidden) {
        return json_({ ok: false, error: 'forbidden' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'updateTraineeAccount') {
      const result = updateTraineeAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
      }
      if (result.forbidden) {
        return json_({ ok: false, error: 'forbidden' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'deleteCoachAccount') {
      const result = deleteCoachAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      if (result.forbidden) {
        return json_({ ok: false, error: 'forbidden' });
      }
      return json_({ ok: true, data: result });
    }
    if (route === 'deleteTraineeAccount') {
      const result = deleteTraineeAccount_(payload);
      if (result.validationFailed) {
        return json_({ ok: false, error: 'validation_failed' });
      }
      if (result.concurrentRequest) {
        return json_({ ok: false, error: 'concurrent_request' });
      }
      if (result.noMatchFound) {
        return json_({ ok: false, error: 'no_match_found' });
      }
      if (result.forbidden) {
        return json_({ ok: false, error: 'forbidden' });
      }
      return json_({ ok: true, data: result });
    }
    return json_({ ok: false, error: 'Unknown route' });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 400);
  }
}

function json_(obj, _status) {
  const body = JSON.stringify(obj);
  if (isLoggingEnabled_()) {
    logToSheet(`return - obj: ${body}, status: ${_status}`);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function authorize_(e, route, body) {
  if (isPublicRoute_(route)) {
    return null;
  }

  // Preferred auth path: short-lived role sessions.
  const sessionToken = getSessionToken_(e, body);
  if (sessionToken) {
    if (isCoachRoute_(route)) {
      return requireSessionRole_(sessionToken, ['coach', 'admin']);
    }
    if (isAdminRoute_(route)) {
      return requireSessionRole_(sessionToken, ['admin']);
    }
  }

  throw new Error('Unauthorized');
}

function isPublicRoute_(route) {
  return [
    'listItems',
    'createItem',
    'registerCoachPin',
    'verifyCoachPin',
    'getTraineeSessions',
    'resolveSessionSelector',
    'registerTraineeForSession',
    'registerTraineePin',
    'verifyTraineePin',
    'sendFeedback'
  ].indexOf(String(route || '')) !== -1;
}

function isCoachRoute_(route) {
  return [
    'getCoachSessions',
    'registerCoachForSession',
    'removeCoachFromSession'
  ].indexOf(String(route || '')) !== -1;
}

function isAdminRoute_(route) {
  return [
    'getSettings',
    'registerTraineeBatchForSessions',
    'registerCustomerEventWithSchedule',
    'listSessionsSchedule',
    'listCoachAccounts',
    'listTraineeAccounts',
    'addSessionSchedule',
    'updateSessionSchedule',
    'deleteSessionSchedule',
    'createCoachAccount',
    'createTraineeAccount',
    'updateCoachAccount',
    'updateTraineeAccount',
    'deleteCoachAccount',
    'deleteTraineeAccount'
  ].indexOf(String(route || '')) !== -1;
}

function getSessionToken_(e, body) {
  if (body && body.sessionToken) {
    return String(body.sessionToken);
  }
  if (e.parameter && e.parameter.sessionToken) {
    return String(e.parameter.sessionToken);
  }
  return '';
}

function requireSessionRole_(sessionToken, allowedRoles) {
  const cache = CacheService.getScriptCache();
  const raw = cache.get('session:' + sessionToken);
  if (!raw) {
    throw new Error('Unauthorized');
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch (_err) {
    throw new Error('Unauthorized');
  }

  if (!session || !session.role) {
    throw new Error('Unauthorized');
  }
  if (allowedRoles.indexOf(session.role) === -1) {
    throw new Error('Forbidden');
  }
  return session;
}

function createSession_(role, subject) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const cache = CacheService.getScriptCache();
  const session = {
    role: role,
    subject: subject || '',
    createdAt: new Date().toISOString()
  };
  cache.put('session:' + token, JSON.stringify(session), SESSION_TTL_SECONDS);
  return {
    sessionToken: token,
    role: role,
    expiresInSeconds: SESSION_TTL_SECONDS
  };
}

function coachLogin_(payload) {
  const mode = payload && payload.mode ? String(payload.mode) : '';
  if (mode === 'pin') {
    const coachData = verifyCoachPin_(payload);
    if (!coachData) {
      throw new Error('no_match_found');
    }
    return {
      session: createSession_('coach', String(coachData.id || '')),
      coachData: coachData
    };
  }

  if (mode === 'password') {
    const password = payload && payload.password ? String(payload.password) : '';
    if (!COACH_PASSWORD || password !== COACH_PASSWORD) {
      throw new Error('invalid_credentials');
    }
    return {
      session: createSession_('coach', ''),
      coachData: null
    };
  }

  throw new Error('validation_failed');
}

function adminLogin_(payload) {
  const password = payload && payload.password ? String(payload.password) : '';
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    throw new Error('invalid_credentials');
  }
  return {
    session: createSession_('admin', 'admin')
  };
}

/**
 * Get cached spreadsheet instance to avoid repeated openById calls
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

/**
 * Get sheet by name
 * @param sheetName sheet's name
 * @returns sheet or null if not found
 */
function getSheetByName(sheetName) {
  return getSpreadsheet().getSheetByName(sheetName);
}

/**
 * Helper to get sheet data (excluding header row)
 * @param sheetName sheet's name
 * @returns sheet data or throws exception if sheet does not exist
 */
function getSheetData(sheetName) {
  const sheet = getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  return sheet.getDataRange().getValues().slice(1);
}

/**
 * Request-scoped sheet reader factory. Memoizes only the spreadsheet handle
 * (SpreadsheetApp.openById result) within a per-call closure — never a global —
 * so repeated multi-sheet reads within a single doGet/doPost invocation avoid
 * redundant openById() calls while still reading fresh row data every time.
 */
function createSheetReader_() {
  let spreadsheet = null;
  return {
    getSheetByName: function(name) {
      if (!spreadsheet) spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      return spreadsheet.getSheetByName(name);
    },
    getSheetData: function(name) {
      const sheet = this.getSheetByName(name);
      if (!sheet) throw new Error(`Sheet not found: ${name}`);
      return sheet.getDataRange().getValues().slice(1);
    }
  };
}

function listItems_() {
  const values = getSheetData('Data');
  return values.filter(r => r[0]).map(r => ({
    id: String(r[0]),
    name: String(r[1]),
    email: String(r[2]),
    created_at: String(r[3])
  }));
}

/**
 * Read all rows from the `settings` sheet.
 * Schema: id, parameter, value, created_at, updated_at, purpose (columns A-F)
 * See SKILL.sheet-schema.md for full schema definition.
 */
function listSettings_() {
  const values = getSheetData('settings');
  return values.filter(r => r[0]).map(r => ({
    id: String(r[0]),
    parameter: String(r[1]),
    value: String(r[2]),
    created_at: String(r[3]),
    updated_at: String(r[4]),
    purpose: String(r[5])
  }));
}

function listCoachAccounts_() {
  const values = getSheetData('coach_login');
  const accounts = values.filter(r => r[0]).map(r => ({
    id: String(r[0]),
    firstname: String(r[1]),
    lastname: String(r[2]),
    alias: String(r[3]),
    pin: String(r[4]),
    created_at: String(r[5]),
    last_activity: String(r[6])
  }));
  return { accounts: accounts };
}

function listTraineeAccounts_() {
  const values = getSheetData('trainee_login');
  const accounts = values.filter(r => r[0]).map(r => ({
    id: String(r[0]),
    firstname: String(r[1]),
    lastname: String(r[2]),
    age: String(r[3]),
    pin: String(r[4]),
    created_at: String(r[5]),
    last_activity: String(r[6])
  }));
  return { accounts: accounts };
}

function mapCoachAccountRow_(row) {
  return {
    id: String(row[0] || ''),
    firstname: String(row[1] || ''),
    lastname: String(row[2] || ''),
    alias: String(row[3] || ''),
    pin: String(row[4] || ''),
    created_at: String(row[5] || ''),
    last_activity: String(row[6] || '')
  };
}

function mapTraineeAccountRow_(row) {
  return {
    id: String(row[0] || ''),
    firstname: String(row[1] || ''),
    lastname: String(row[2] || ''),
    age: String(row[3] || ''),
    pin: String(row[4] || ''),
    created_at: String(row[5] || ''),
    last_activity: String(row[6] || '')
  };
}

function normalizeNameKeyPart_(value) {
  return String(value || '').trim().toLowerCase();
}

function hasRelatedRegistrationByName_(sheetName, firstname, lastname) {
  const first = normalizeNameKeyPart_(firstname);
  const last = normalizeNameKeyPart_(lastname);
  if (!first || !last) return false;

  const rows = getSheetData(sheetName);
  return rows.some(row =>
    normalizeNameKeyPart_(row[1]) === first &&
    normalizeNameKeyPart_(row[2]) === last
  );
}

function isPinReservedAcrossAccounts_(pin, excludeCoachId, excludeTraineeId) {
  const pinValue = String(pin || '').trim();
  if (!pinValue) {
    return false;
  }

  const coachRows = getSheetData('coach_login');
  const coachTaken = coachRows.some(row => {
    const rowId = String(row[0] || '');
    const rowPin = String(row[4] || '').trim();
    if (!rowId || !rowPin) return false;
    if (excludeCoachId && rowId === String(excludeCoachId)) return false;
    return rowPin === pinValue;
  });
  if (coachTaken) return true;

  const traineeRows = getSheetData('trainee_login');
  return traineeRows.some(row => {
    const rowId = String(row[0] || '');
    const rowPin = String(row[4] || '').trim();
    if (!rowId || !rowPin) return false;
    if (excludeTraineeId && rowId === String(excludeTraineeId)) return false;
    return rowPin === pinValue;
  });
}

function createCoachAccount_(payload) {
  const firstname = String(payload && payload.firstname ? payload.firstname : '').trim();
  const lastname = String(payload && payload.lastname ? payload.lastname : '').trim();
  const alias = String(payload && payload.alias ? payload.alias : '').trim();
  const pin = String(payload && payload.pin ? payload.pin : '').trim();

  if (!firstname || !lastname || !pin) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    if (isPinReservedAcrossAccounts_(pin)) {
      return { pinReserved: true };
    }

    const sheet = getSheetByName('coach_login');
    if (!sheet) {
      throw new Error('Sheet not found: coach_login');
    }

    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    const row = [id, firstname, lastname, alias, pin, now, ''];
    sheet.appendRow(row);

    return { account: mapCoachAccountRow_(row) };
  } finally {
    lock.releaseLock();
  }
}

function createTraineeAccount_(payload) {
  const firstname = String(payload && payload.firstname ? payload.firstname : '').trim();
  const lastname = String(payload && payload.lastname ? payload.lastname : '').trim();
  const age = String(payload && payload.age ? payload.age : '').trim();
  const pin = String(payload && payload.pin ? payload.pin : '').trim();

  if (!firstname || !lastname || !age || !pin) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    if (isPinReservedAcrossAccounts_(pin)) {
      return { pinReserved: true };
    }

    const sheet = getSheetByName('trainee_login');
    if (!sheet) {
      throw new Error('Sheet not found: trainee_login');
    }

    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    const row = [id, firstname, lastname, age, pin, now, ''];
    sheet.appendRow(row);

    return { account: mapTraineeAccountRow_(row) };
  } finally {
    lock.releaseLock();
  }
}

function updateCoachAccount_(payload) {
  const id = String(payload && payload.id ? payload.id : '').trim();
  const firstname = String(payload && payload.firstname ? payload.firstname : '').trim();
  const lastname = String(payload && payload.lastname ? payload.lastname : '').trim();
  const alias = String(payload && payload.alias ? payload.alias : '').trim();
  const pin = String(payload && payload.pin ? payload.pin : '').trim();

  if (!id || !firstname || !lastname || !pin) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const rows = getSheetData('coach_login');
    const index = rows.findIndex(row => String(row[0] || '') === id);
    if (index === -1) {
      return { noMatchFound: true };
    }

    const existing = rows[index];
    const existingFirstname = String(existing[1] || '');
    const existingLastname = String(existing[2] || '');
    const nameChanged =
      normalizeNameKeyPart_(existingFirstname) !== normalizeNameKeyPart_(firstname) ||
      normalizeNameKeyPart_(existingLastname) !== normalizeNameKeyPart_(lastname);

    if (nameChanged && hasRelatedRegistrationByName_('coach_registrations', existingFirstname, existingLastname)) {
      return { forbidden: true };
    }

    if (isPinReservedAcrossAccounts_(pin, id, '')) {
      return { pinReserved: true };
    }

    const sheet = getSheetByName('coach_login');
    if (!sheet) {
      throw new Error('Sheet not found: coach_login');
    }

    const sheetRow = index + 2;
    sheet.getRange(sheetRow, 2, 1, 4).setValues([[firstname, lastname, alias, pin]]);

    const updated = [
      existing[0],
      firstname,
      lastname,
      alias,
      pin,
      existing[5],
      existing[6]
    ];
    return { account: mapCoachAccountRow_(updated) };
  } finally {
    lock.releaseLock();
  }
}

function updateTraineeAccount_(payload) {
  const id = String(payload && payload.id ? payload.id : '').trim();
  const firstname = String(payload && payload.firstname ? payload.firstname : '').trim();
  const lastname = String(payload && payload.lastname ? payload.lastname : '').trim();
  const age = String(payload && payload.age ? payload.age : '').trim();
  const pin = String(payload && payload.pin ? payload.pin : '').trim();

  if (!id || !firstname || !lastname || !age || !pin) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const rows = getSheetData('trainee_login');
    const index = rows.findIndex(row => String(row[0] || '') === id);
    if (index === -1) {
      return { noMatchFound: true };
    }

    const existing = rows[index];
    const existingFirstname = String(existing[1] || '');
    const existingLastname = String(existing[2] || '');
    const nameChanged =
      normalizeNameKeyPart_(existingFirstname) !== normalizeNameKeyPart_(firstname) ||
      normalizeNameKeyPart_(existingLastname) !== normalizeNameKeyPart_(lastname);

    if (nameChanged && hasRelatedRegistrationByName_('trainee_registrations', existingFirstname, existingLastname)) {
      return { forbidden: true };
    }

    if (isPinReservedAcrossAccounts_(pin, '', id)) {
      return { pinReserved: true };
    }

    const sheet = getSheetByName('trainee_login');
    if (!sheet) {
      throw new Error('Sheet not found: trainee_login');
    }

    const sheetRow = index + 2;
    sheet.getRange(sheetRow, 2, 1, 4).setValues([[firstname, lastname, age, pin]]);

    const updated = [
      existing[0],
      firstname,
      lastname,
      age,
      pin,
      existing[5],
      existing[6]
    ];
    return { account: mapTraineeAccountRow_(updated) };
  } finally {
    lock.releaseLock();
  }
}

function deleteCoachAccount_(payload) {
  const id = String(payload && payload.id ? payload.id : '').trim();
  if (!id) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const rows = getSheetData('coach_login');
    const index = rows.findIndex(row => String(row[0] || '') === id);
    if (index === -1) {
      return { noMatchFound: true };
    }

    const existing = rows[index];
    if (hasRelatedRegistrationByName_('coach_registrations', existing[1], existing[2])) {
      return { forbidden: true };
    }

    const sheet = getSheetByName('coach_login');
    if (!sheet) {
      throw new Error('Sheet not found: coach_login');
    }

    sheet.deleteRow(index + 2);
    return { id: id };
  } finally {
    lock.releaseLock();
  }
}

function deleteTraineeAccount_(payload) {
  const id = String(payload && payload.id ? payload.id : '').trim();
  if (!id) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const rows = getSheetData('trainee_login');
    const index = rows.findIndex(row => String(row[0] || '') === id);
    if (index === -1) {
      return { noMatchFound: true };
    }

    const existing = rows[index];
    if (hasRelatedRegistrationByName_('trainee_registrations', existing[1], existing[2])) {
      return { forbidden: true };
    }

    const sheet = getSheetByName('trainee_login');
    if (!sheet) {
      throw new Error('Sheet not found: trainee_login');
    }

    sheet.deleteRow(index + 2);
    return { id: id };
  } finally {
    lock.releaseLock();
  }
}

function createItem_(payload) {
  if (!payload || !payload.name || !payload.email) throw new Error('Missing fields');
  const sh = getSheetByName('Data');
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  sh.appendRow([id, payload.name, payload.email, now]);
  return { id, name: payload.name, email: payload.email, created_at: now };
}

/**
 * Register a new coach PIN code.
 * Checks that the PIN does not exist in coach_login or trainee_login sheets.
 * If the PIN is already taken, returns { pinReserved: true }.
 * Otherwise appends a new row to coach_login and returns the created record.
 * Schema: id, firstname, lastname, alias, pin, created_at, last_activity (columns A–G)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract.
 */
function registerCoachPin_(payload) {
  if (!payload || !payload.firstname || !payload.lastname || !payload.pin) {
    throw new Error('Missing required fields: firstname, lastname, pin');
  }

  const payloadFirstname = String(payload.firstname).trim();
  const payloadLastname = String(payload.lastname).trim();
  const payloadAlias = String(payload.alias || '').trim();
  const payloadPin = String(payload.pin);
  const payloadPassword = String(payload.password || '').trim();
  const payloadFirstnameLower = payloadFirstname.toLowerCase();
  const payloadLastnameLower = payloadLastname.toLowerCase();

  if (!COACH_PASSWORD || payloadPassword !== COACH_PASSWORD) {
    return { invalidPassword: true };
  }

  const coachRows = getSheetData('coach_login');
  const matchingCoachIndex = coachRows.findIndex(r =>
    String(r[1] || '').trim().toLowerCase() === payloadFirstnameLower &&
    String(r[2] || '').trim().toLowerCase() === payloadLastnameLower
  );

  // Same-name row handling for OQM-0025.
  if (matchingCoachIndex !== -1) {
    const row = coachRows[matchingCoachIndex];
    const rowId = String(row[0] || '');
    const rowAlias = String(row[3] || '').trim();
    const rowAliasLower = rowAlias.toLowerCase();
    const payloadAliasLower = payloadAlias.toLowerCase();
    const rowPin = String(row[4] || '').trim();
    const rowCreatedAt = String(row[5] || '');

    if (
      (rowAlias && payloadAlias && rowAliasLower !== payloadAliasLower) ||
      (rowAlias && !payloadAlias)
    ) {
      return { mismatchingAliases: true };
    }

    if (rowPin) {
      if (rowPin === payloadPin) {
        return { alreadyRegistered: true };
      }
      return { pinsDoNotMatch: true };
    }

    // Existing name row has no PIN: keep uniqueness check against all other rows and trainee rows.
    const coachPinTakenElsewhere = coachRows.some((r, index) =>
      index !== matchingCoachIndex && r[4] && String(r[4]) === payloadPin
    );
    const traineePinTaken = getSheetData('trainee_login')
      .some(r => r[4] && String(r[4]) === payloadPin);
    if (coachPinTakenElsewhere || traineePinTaken) {
      return { pinReserved: true };
    }

    const sh = getSheetByName('coach_login');
    const now = new Date().toISOString();
    const sheetRow = matchingCoachIndex + 2; // +1 for header row, +1 for 1-based index.
    if (!rowAlias && payloadAlias) {
      sh.getRange(sheetRow, 4).setValue(payloadAlias); // Column D: alias
    }
    sh.getRange(sheetRow, 5).setValue(payloadPin); // Column E: pin
    sh.getRange(sheetRow, 7).setValue(now); // Column G: last_activity

    return {
      id: rowId,
      firstname: payloadFirstname,
      lastname: payloadLastname,
      alias: payloadAlias,
      pin: payloadPin,
      created_at: rowCreatedAt || now
    };
  }

  // Check PIN is not already in use in coach_login (column E, index 4)
  const coachPins = coachRows
    .filter(r => r[4])
    .map(r => String(r[4]));

  // Check PIN is not already in use in trainee_login (column E, index 4)
  const traineePins = getSheetData('trainee_login')
    .filter(r => r[4])
    .map(r => String(r[4]));

  if (coachPins.includes(payload.pin) || traineePins.includes(payload.pin)) {
    return { pinReserved: true };
  }

  const sh = getSheetByName('coach_login');
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  sh.appendRow([id, payloadFirstname, payloadLastname, payloadAlias, payloadPin, now, '']);
  return {
    id,
    firstname: payloadFirstname,
    lastname: payloadLastname,
    alias: payloadAlias,
    pin: payloadPin,
    created_at: now
  };
}

/**
 * Verify a coach PIN code against the coach_login sheet.
 * Returns the matching coach's row data or null if no match found.
 * Schema: id, firstname, lastname, alias, pin, created_at, last_activity (columns A–G)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0004).
 */
function verifyCoachPin_(payload) {
  if (!payload || !payload.pin) {
    throw new Error('Missing required fields: pin');
  }
  const rows = getSheetData('coach_login');
  const row = rows.find(r => r[4] && String(r[4]) === String(payload.pin));
  if (!row) return null;
  return {
    id: String(row[0]),
    firstname: String(row[1]),
    lastname: String(row[2]),
    alias: String(row[3]),
    pin: String(row[4]),
    created_at: String(row[5]),
    last_activity: String(row[6])
  };
}

/**
 * Register a new trainee PIN code.
 * Checks that the PIN does not exist in coach_login or trainee_login sheets.
 * If the PIN is already taken, returns { pinReserved: true }.
 * Otherwise appends a new row to trainee_login and returns the created record.
 * Schema: id, firstname, lastname, age, pin, created_at, last_activity (columns A–G)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0016).
 */
function registerTraineePin_(payload) {
  if (!payload || !payload.firstname || !payload.lastname || !payload.age || !payload.pin) {
    throw new Error('Missing required fields: firstname, lastname, age, pin');
  }

  // Acquire lock to prevent concurrent writes to trainee_login
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }
  try {
    // Check PIN is not already in use in coach_login (column E, index 4)
    const coachPins = getSheetData('coach_login')
      .filter(r => r[4])
      .map(r => String(r[4]));

    // Check PIN is not already in use in trainee_login (column E, index 4)
    const traineeRows = getSheetData('trainee_login').filter(r => r[0]);
    const traineePins = traineeRows.filter(r => r[4]).map(r => String(r[4]));

    if (coachPins.includes(payload.pin) || traineePins.includes(payload.pin)) {
      return { pinReserved: true };
    }

    // Check no trainee with the same firstname and lastname already exists (columns B=index 1, C=index 2)
    const nameExists = traineeRows.some(
      r => String(r[1]).toLowerCase() === payload.firstname.toLowerCase() &&
           String(r[2]).toLowerCase() === payload.lastname.toLowerCase()
    );
    if (nameExists) {
      return { nameAlreadyExists: true };
    }

    const sh = getSheetByName('trainee_login');
    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    sh.appendRow([id, payload.firstname, payload.lastname, payload.age, payload.pin, now, '']);
    return {
      id,
      firstname: payload.firstname,
      lastname: payload.lastname,
      age: payload.age,
      pin: payload.pin,
      created_at: now
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Verify a trainee PIN code against trainee_login first, then coach_login as fallback.
 * Returns trainee-shaped data from trainee_login when matched.
 * If no trainee match exists but coach PIN matches, maps coach row to trainee shape
 * (age is an empty string and alias is not included).
 * Returns null if no match is found in either sheet.
 * Schema: id, firstname, lastname, age, pin, created_at, last_activity (columns A–G)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0016, OQM-0023).
 */
function verifyTraineePin_(payload) {
  if (!payload || !payload.pin) {
    throw new Error('Missing required fields: pin');
  }
  const traineeRows = getSheetData('trainee_login');
  const traineeRow = traineeRows.find(r => r[4] && String(r[4]) === String(payload.pin));
  if (traineeRow) {
  return {
      id: String(traineeRow[0]),
      firstname: String(traineeRow[1]),
      lastname: String(traineeRow[2]),
      age: String(traineeRow[3]),
      pin: String(traineeRow[4]),
      created_at: String(traineeRow[5]),
      last_activity: String(traineeRow[6])
    };
  }

  const coachRows = getSheetData('coach_login');
  const coachRow = coachRows.find(r => r[4] && String(r[4]) === String(payload.pin));
  if (!coachRow) return null;
  return {
    id: String(coachRow[0]),
    firstname: String(coachRow[1]),
    lastname: String(coachRow[2]),
    age: '',
    pin: String(coachRow[4]),
    created_at: String(coachRow[5]),
    last_activity: String(coachRow[6])
  };
}

/**
 * Accept feedback, bug reports, or support requests and persist them to the Messages sheet.
 * Writes the row atomically, then sends a support notification email.
 * Email failures are logged but do not roll back the sheet write.
 * Schema: id, timestamp, type, from, message (columns A–E)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0046).
 */
function sendFeedback_(payload) {
  const normalizedType = String(payload && payload.type ? payload.type : '').trim();
  const from = String(payload && payload.from ? payload.from : '').trim();
  const message = String(payload && payload.message ? payload.message : '');

  if (normalizedType !== 'feedback' && normalizedType !== 'bug_report' && normalizedType !== 'support_request') {
    return { validationFailed: true };
  }
  if (!from || message.trim().length === 0 || message.length > 500) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }
  try {
    const sheet = getSheetByName('Messages');
    if (!sheet) {
      throw new Error('Sheet not found: Messages');
    }

    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    sheet.appendRow([id, now, normalizedType, from, message]);

    try {
      MailApp.sendEmail({
        to: 'webmaster@oulunkickboxing.fi',
        subject: 'OQM ' + normalizedType.replace('_', ' '),
        body: `Type: ${normalizedType}\nFrom: ${from}\n\n${message}`
      });
    } catch (mailErr) {
      logToSheet(`sendFeedback email failed: ${String(mailErr)}`);
    }

    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Register a coach for a specific session.
 * Validates that the coach exists in coach_login and that no coach is already registered for the session.
 * On success, appends a row to coach_registrations and returns the new row id.
 * Returns { alreadyTaken: true } if a coach is already registered for the session+date.
 * Returns { unknownCoach: true } if the coach is not in coach_login.
 * Schema: id, first_name, last_name, session_type, date, realized, start_time, end_time, created_at, updated_at (columns A–J)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0008).
 */
function registerCoachForSession_(payload, reader) {
  if (!payload || !payload.firstname || !payload.lastname || !payload.session_type || !payload.date) {
    throw new Error('Missing required fields: firstname, lastname, session_type, date');
  }

  // Acquire lock for concurrent operation
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }
  try {
    // Check coach exists in coach_login (columns B=firstname, C=lastname)
    const coachRows = reader.getSheetData('coach_login');
    const coachExists = coachRows.some(r =>
      String(r[1]).trim().toLowerCase() === payload.firstname.trim().toLowerCase() &&
      String(r[2]).trim().toLowerCase() === payload.lastname.trim().toLowerCase()
    );
    if (!coachExists) {
      return { unknownCoach: true };
    }

    // Check if session already has a registered coach (session_type + date with realized=true)
    const coachRegRows = reader.getSheetData('coach_registrations');
    const tz = Session.getScriptTimeZone();
    const sessionTypeUpper = payload.session_type.toUpperCase();
    const alreadyRegistered = coachRegRows.some(r => {
      const regSessionType = String(r[3] || '').toUpperCase();
      const regDate = timeToStr(r[4], tz, 'yyyy-MM-dd');
      const realized = r.length >= 6 ? getBooleanValue(r[5]) : true;
      return regSessionType === sessionTypeUpper && regDate === payload.date && realized;
    });
    if (alreadyRegistered) {
      return { alreadyTaken: true };
    }

    // Overlapping session check for free/sparring session
    if (sessionTypeUpper === 'FREE/SPARRING' && payload.start_time && payload.end_time) {
      // Find registrations for same date and session_type
      const overlapping = coachRegRows.find(r => {
        const regDate = timeToStr(r[4], tz, 'yyyy-MM-dd');
        if (regDate !== payload.date) return false;
        const regStart = r[6] || '';
        const regEnd = r[7] || '';
        // Overlap logic
        return (
          (payload.start_time >= regStart && payload.start_time < regEnd) ||
          (payload.end_time > regStart && payload.end_time <= regEnd)
        );
      });
      if (overlapping) {
        return {
          overlappingSession: true,
          date: payload.date,
          start_time: overlapping[6],
          end_time: overlapping[7]
        };
      }
    }

    // Append row to coach_registrations
    const sh = reader.getSheetByName('coach_registrations');
    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    const startTime = payload.start_time || '';
    const endTime = payload.end_time || '';
    sh.appendRow([id, payload.firstname, payload.lastname, String(payload.session_type).toLowerCase(), payload.date, true, startTime, endTime, now, now]);

    return { id };
  } finally {
    lock.releaseLock();
  }
}

function getBooleanValue(value) {
    if (typeof value === 'boolean') return value;
    const trimmed = value.trim().toUpperCase();
    return trimmed !== 'FALSE' && trimmed !== '0' && trimmed !== 'NO' && trimmed !== 'N';  
}

function resolveSessionSelector_(payload, reader) {
  const selector = String((payload && payload.selector) || '').trim().toLowerCase();
  if (!selector) {
    return { ok: false, error: 'missing_selector' };
  }

  const supportedSelectorMap = {
    advanced: 'advanced',
    fitness: 'fitness',
    joint: 'joint',
    sparring: 'free/sparring',
    basic: 'basic'
  };

  if (!supportedSelectorMap[selector]) {
    return { ok: false, error: 'unsupported_selector' };
  }

  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const sheetReader = reader || createSheetReader_();
  const todaysSessions = getTraineeSessions_(undefined, sheetReader).filter(session => session.date === today);

  if (selector === 'basic') {
    const basicMatch = todaysSessions.find(session => {
      const type = String(session.session_type || '').trim().toLowerCase();
      return !session.is_free_sparring && type.indexOf('basic_') === 0;
    });
    if (!basicMatch) {
      return { ok: false, error: 'no_session_today' };
    }
    return {
      ok: true,
      data: {
        selector: selector,
        session: basicMatch,
        resolved_session_type: basicMatch.session_type,
        date: today
      }
    };
  }

  if (selector === 'sparring') {
    const sparringRegistrationRows = sheetReader.getSheetData('coach_registrations');
    const hasSparringRegistration = sparringRegistrationRows.some(row => {
      if (!row || row.length < 8) return false;
      const rowType = String(row[3] || '').trim().toLowerCase();
      const rowDate = normalizeDateYmd_(row[4], tz);
      const active = row.length >= 6 ? getBooleanValue(row[5]) : true;
      return active && rowType === 'free/sparring' && rowDate === today;
    });

    const sparringMatch = todaysSessions.find(session => {
      return session.is_free_sparring === true && String(session.session_type || '').trim().toLowerCase() === 'free/sparring';
    });

    if (!hasSparringRegistration || !sparringMatch) {
      return { ok: false, error: 'no_session_today' };
    }

    return {
      ok: true,
      data: {
        selector: selector,
        session: sparringMatch,
        resolved_session_type: sparringMatch.session_type,
        date: today
      }
    };
  }

  const standardMatch = todaysSessions.find(session => {
    return String(session.session_type || '').trim().toLowerCase() === supportedSelectorMap[selector];
  });

  if (!standardMatch) {
    return { ok: false, error: 'no_session_today' };
  }

  return {
    ok: true,
    data: {
      selector: selector,
      session: standardMatch,
      resolved_session_type: standardMatch.session_type,
      date: today
    }
  };
}

/**
 * Update the last_activity timestamp for a coach in the coach_login sheet.
 * Sets current datetime in ISO-8601 format into the coach's row's last_activity cell (column G, index 6).
 * Schema: id, firstname, lastname, alias, pin, created_at, last_activity (columns A–G)
 * See SKILL.sheet-schema.md for full schema definition.
 * @param {string} coachId - The coach's id (column A)
 */
function updateCoachLastActivity_(coachId) {
  if (!coachId) throw new Error('Missing required field: coachId');
  const sheet = getSheetByName('coach_login');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(coachId)) {
      sheet.getRange(i + 1, 7).setValue(now); // Column G (1-indexed: 7)
      return { updated: true };
    }
  }
  return { notFound: true };
}

function timeToStr(rawTime, format) {
  let timeStr = '';
  if (rawTime instanceof Date) {
    timeStr = Utilities.formatDate(rawTime, arguments[1], arguments[2]);
  } else if (rawTime) {
    timeStr = String(rawTime || '');
  }
  return timeStr;
}

/**
 * Normalize mixed sheet/date values to 'YYYY-MM-DD' for stable comparisons.
 * Accepts Date objects, ISO-like strings, and plain 'YYYY-MM-DD'.
 */
function normalizeDateYmd_(value, tz) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  }

  const raw = String(value).trim();
  if (!raw) return '';

  const directYmdMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directYmdMatch) {
    return directYmdMatch[1];
  }

  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, tz, 'yyyy-MM-dd');
  }

  return raw;
}

/**
 * Normalize mixed time values to 'HH:mm' for stable comparisons.
 * Accepts Date objects and string representations.
 */
function normalizeTimeHm_(value, tz) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, tz, 'HH:mm');
  }

  const raw = String(value).trim();
  if (!raw) return '';

  const directHmMatch = raw.match(/^(\d{1,2}):(\d{2})/);
  if (directHmMatch) {
    const hh = String(Number(directHmMatch[1])).padStart(2, '0');
    return `${hh}:${directHmMatch[2]}`;
  }

  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, tz, 'HH:mm');
  }

  return raw;
}

/**
 * Get a map of coach names to their aliases
 * Returns { "FirstName LastName": "Alias" } for coaches who have an alias set
 */
function getCoachAliasMap(coachLoginRows) {  
  let data;
  if (!coachLoginRows) {
    data = getSheetData('coach_login');
  } else {
    data = coachLoginRows;
  }
  const aliasMap = {};
  
  data.forEach(row => {
    const firstName = String(row[1] || '').trim();
    const lastName = String(row[2] || '').trim();
    const alias = String(row[3] || '').trim();
    
    if (firstName && lastName && alias) {
      const fullName = `${firstName} ${lastName}`;
      aliasMap[fullName] = alias;
    }
  });
  
  return aliasMap;
}

/**
 * Fetch coach sessions for a 21-day window (7 days before current week's Monday through next 2 weeks).
 * Returns sessions with dates and their registered coaches
 * Only shows sessions where the course is currently active (within start/end dates)
 * @returns {Array} - Array of session objects
 */
function getCoachSessions_(reader) {
  const tz = Session.getScriptTimeZone();
  const cacheKey = 'coach_sessions_v1_' + Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const cachedSessions = getCachedSessionWindow_(cacheKey);
  if (cachedSessions) {
    logToSheet('getCoachSessions_() - cache hit, returned ' + cachedSessions.length + ' sessions');
    return cachedSessions;
  }

  const sessionsScheduleRows = reader.getSheetData('sessions_schedule');
  const coachRegistrationsRowsData = reader.getSheetData('coach_registrations');
  const coachLoginRows = reader.getSheetData('coach_login');

  const aliasMap = getCoachAliasMap(coachLoginRows);

  // --- Pre-compute coach registrations index (once) ---
  // Build lookup: "SESSION_TYPE|DATE" -> [{ registrationId, firstname, lastname, alias }]
  const regByKey = {};
  const freeSparringByDate = {};
  coachRegistrationsRowsData.forEach(row => {
    if (row.length >= 6 && !getBooleanValue(row[5])) return; // skip realized=false
    const sessionType = String(row[3] || '').toUpperCase();
    const dateStr = timeToStr(row[4], tz, 'yyyy-MM-dd');
    const firstname = String(row[1] || '').trim();
    const lastname = String(row[2] || '').trim();
    const fullName = firstname + ' ' + lastname;
    const alias = aliasMap[fullName] || fullName;
    const entry = {
      registrationId: String(row[0]),
      firstname: firstname,
      lastname: lastname,
      alias: alias,
      startTime: row.length >= 8 ? timeToStr(row[6], tz, 'HH:mm') : '',
      endTime: row.length >= 8 ? timeToStr(row[7], tz, 'HH:mm') : ''
    };

    if (sessionType === 'FREE/SPARRING') {
      if (!freeSparringByDate[dateStr]) freeSparringByDate[dateStr] = [];
      freeSparringByDate[dateStr].push(entry);
    } else {
      var key = sessionType + '|' + dateStr;
      if (!regByKey[key]) regByKey[key] = [];
      regByKey[key].push(entry);
    }
  });

  // --- Pre-parse session schedule rows (once) ---
  // Schema: [id, session_type, session_type_alias, start_date, end_date, weekdays_available, start_time, end_time, location, location_alias, active]
  const sessionAliasByType = {};
  const parsedSchedules = [];
  sessionsScheduleRows.forEach(row => {
    if (!getBooleanValue(row[10])) return; // skip inactive

    const sessionType = String(row[1] || '').trim();
    const sessionTypeUpper = sessionType.toUpperCase();
    if (!sessionTypeUpper) return;

    const sessionTypeAlias = String(row[2] || '').trim();
    if (!sessionAliasByType[sessionTypeUpper]) {
      sessionAliasByType[sessionTypeUpper] = (sessionTypeAlias || sessionType).toUpperCase();
    }

    const weekdays = String(row[5] || '').split(',').map(w => Number(w.trim()));
    const weekdaySet = {};
    weekdays.forEach(w => { weekdaySet[w] = true; });

    const startDateYmd = normalizeDateYmd_(row[3], tz);
    const endDateYmd = normalizeDateYmd_(row[4], tz);
    if (!startDateYmd || !endDateYmd) return;

    parsedSchedules.push({
      id: String(row[0]),
      sessionType: sessionTypeUpper,
      sessionTypeAlias: (sessionTypeAlias || sessionType).toUpperCase(),
      startDateYmd: startDateYmd,
      endDateYmd: endDateYmd,
      weekdaySet: weekdaySet,
      startTime: normalizeTimeHm_(row[6], tz),
      endTime: normalizeTimeHm_(row[7], tz),
      location: row[8] || ''
    });
  });

  // --- Compute session window dates (once) ---
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var dayOfWeek = today.getDay();
  var daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysToMonday);
  currentMonday.setHours(0, 0, 0, 0);
  var prevMonday = new Date(currentMonday);
  prevMonday.setDate(currentMonday.getDate() - 7);

  var sessionDates = [];
  var sessionDateStrs = [];
  var sessionDateSet = {};
  for (var i = 0; i < 21; i++) {
    var d = new Date(prevMonday);
    d.setDate(prevMonday.getDate() + i);
    sessionDates.push(d);
    var ds = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
    sessionDateStrs.push(ds);
    sessionDateSet[ds] = true;
  }
  logToSheet('Session window dates: ' + sessionDateStrs.join(', '));

  // --- Build sessions from weekly schedule × dates ---
  let sessions = [];

  for (var di = 0; di < sessionDates.length; di++) {
    var sessionDate = sessionDates[di];
    var dateStr = sessionDateStrs[di];
    var weekday = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;

    for (var si = 0; si < parsedSchedules.length; si++) {
      var sched = parsedSchedules[si];
      if (!sched.weekdaySet[weekday]) continue;
      if (dateStr < sched.startDateYmd || dateStr > sched.endDateYmd) {
        continue;
      }

      // O(1) coach lookup instead of O(n) scan
      var key = sched.sessionType + '|' + dateStr;
      var registeredCoaches = regByKey[key] || [];

      sessions.push({
        id: sched.id + '_' + dateStr,
        session_type: sched.sessionType,
        session_type_alias: sched.sessionTypeAlias,
        date: dateStr,
        weekday: weekday,
        start_time: sched.startTime,
        end_time: sched.endTime,
        location: sched.location,
        coach_firstname: registeredCoaches.length > 0 ? registeredCoaches[0].firstname : '',
        coach_lastname: registeredCoaches.length > 0 ? registeredCoaches[0].lastname : '',
        coach_alias: registeredCoaches.length > 0 ? registeredCoaches[0].alias : '',
        registration_id: registeredCoaches.length > 0 ? registeredCoaches[0].registrationId : '',
        is_free_sparring: false
      });
    }

    // --- Free/sparring sessions for this date ---
    var sparringCoaches = freeSparringByDate[dateStr];
    if (sparringCoaches) {
      var sparringAlias = sessionAliasByType['FREE/SPARRING'] || 'FREE/SPARRING';
      for (var fi = 0; fi < sparringCoaches.length; fi++) {
        var coach = sparringCoaches[fi];
        sessions.push({
          id: 'sparring_' + coach.registrationId + '_' + dateStr,
          session_type: 'FREE/SPARRING',
          session_type_alias: sparringAlias,
          date: dateStr,
          weekday: weekday,
          start_time: coach.startTime,
          end_time: coach.endTime,
          location: '',
          coach_firstname: coach.firstname,
          coach_lastname: coach.lastname,
          coach_alias: coach.alias,
          registration_id: coach.registrationId,
          is_free_sparring: true
        });
      }
    }
  }

  // --- Replace overlapping sessions with camp sessions ---
  const campsRows = reader.getSheetData('camps');
  var campMap = {};
  var sessionStartDate = sessionDateStrs[0];
  var sessionEndDate = sessionDateStrs[sessionDateStrs.length - 1];

  campsRows.forEach(function(campRow) {
    var campId = String(campRow[0]);
    var startDate = Utilities.formatDate(campRow[4], tz, 'yyyy-MM-dd');
    var endDate = Utilities.formatDate(campRow[5], tz, 'yyyy-MM-dd');
    if (endDate < sessionStartDate || startDate > sessionEndDate) return;
    campMap[campId] = {
      campId: campId,
      camp: String(campRow[1]),
      campAlias: String(campRow[2]),
      campInstructor: String(campRow[3]),
      startDate: startDate,
      endDate: endDate
    };
  });

  if (Object.keys(campMap).length > 0) {
    // Collect all camp dates to remove regular sessions in one pass
    var campDatesToReplace = {};
    var campSessions = [];

    var campSchedulesRows = reader.getSheetData('camp_schedules');
    campSchedulesRows.forEach(function(r) {
      var campId = String(r[1]);
      var campDetails = campMap[campId];
      if (!campDetails) return;
      var sessionDate = Utilities.formatDate(r[3], tz, 'yyyy-MM-dd');
      if (sessionDate < sessionStartDate || sessionDate > sessionEndDate) return;
      var sessionName = String(r[2]);
      campDatesToReplace[sessionDate] = true;
      campSessions.push({
        id: 'camp_' + String(r[0]) + '_' + sessionDate,
        session_type: campDetails.camp + (sessionName ? ' - ' + sessionName : ''),
        session_type_alias: campDetails.campAlias + (sessionName ? ' - ' + sessionName : ''),
        date: sessionDate,
        start_time: timeToStr(r[4], tz, 'HH:mm'),
        end_time: timeToStr(r[5], tz, 'HH:mm'),
        location: '',
        coach_firstname: campDetails.campInstructor,
        coach_lastname: '',
        coach_alias: '',
        registration_id: '',
        is_free_sparring: false
      });
    });

    // Single-pass filter: remove regular sessions on camp dates
    sessions = sessions.filter(function(s) {
      return s.is_free_sparring || !campDatesToReplace[s.date];
    });
    sessions = sessions.concat(campSessions);
  }

  // Sort by date, then by start time
  sessions.sort(function(a, b) {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  logToSheet('getCoachSessions_() - returned ' + sessions.length + ' sessions');

  putCachedSessionWindow_(cacheKey, sessions);

  return sessions;
}

/**
 * Remove a coach from a specific session (OQM-0009).
 * Acquires a script lock to prevent concurrent operations.
 * Identifies the registration row by matching firstname, lastname, session_type, and date where realized=true.
 * Updates realized to false and updated_at to the current timestamp.
 * Returns { concurrentOperation: true } if the lock cannot be acquired.
 * Returns { registrationNotFound: true } if no matching realized=true row exists.
 * Returns { sessionAvailable: true } if the identified row has realized=false.
 * Returns { id } of the updated row on success.
 * Schema: id, first_name, last_name, session_type, date, realized, start_time, end_time, created_at, updated_at (cols A–J)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0009).
 */
function removeCoachFromSession_(payload, reader) {
  if (!payload || !payload.firstname || !payload.lastname || !payload.session_type || !payload.date) {
    throw new Error('Missing required fields: firstname, lastname, session_type, date');
  }

  const lock = LockService.getScriptLock();
  const acquired = lock.tryLock(5000);
  if (!acquired) {
    return { concurrentOperation: true };
  }

  try {
    const tz = Session.getScriptTimeZone();
    const sessionTypeUpper = payload.session_type.toUpperCase();
    const sheet = reader.getSheetByName('coach_registrations');
    if (!sheet) throw new Error('Sheet not found: coach_registrations');

    const data = sheet.getDataRange().getValues();
    // data[0] is the header row; data starts at index 1 for actual rows
    let matchRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowFirstname = String(row[1] || '').trim();
      const rowLastname = String(row[2] || '').trim();
      const rowSessionType = String(row[3] || '').toUpperCase();
      const rowDate = timeToStr(row[4], tz, 'yyyy-MM-dd');
      const rowRealized = row.length >= 6 ? getBooleanValue(row[5]) : true;

      if (
        rowFirstname.toLowerCase() === payload.firstname.trim().toLowerCase() &&
        rowLastname.toLowerCase() === payload.lastname.trim().toLowerCase() &&
        rowSessionType === sessionTypeUpper &&
        rowDate === payload.date
      ) {
        if (!rowRealized) {
          return { sessionAvailable: true };
        }
        matchRowIndex = i;
        break;
      }
    }

    if (matchRowIndex === -1) {
      return { registrationNotFound: true };
    }

    // Update realized=false and updated_at; sheet row is matchRowIndex + 1 (1-based)
    const now = new Date().toISOString();
    const sheetRow = matchRowIndex + 1;
    sheet.getRange(sheetRow, 6).setValue(false);   // col F = realized
    sheet.getRange(sheetRow, 10).setValue(now);    // col J = updated_at

    const registrationId = String(data[matchRowIndex][0]);
    logToSheet(`removeCoachFromSession_ - updated row ${sheetRow}, id: ${registrationId}`);
    return { id: registrationId };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Register a trainee for a specific session (OQM-0014).
 * Validates required payload fields and checks for duplicate registrations on the same date.
 * Acquires a script lock to prevent concurrent operations.
 * On success, appends a new row to trainee_registrations with realized=true and returns the new row id.
 * Returns { validationFailedAge: true } if age_group is 'underage' but underage_age is missing.
 * Returns { concurrentRequest: true } if the script lock cannot be acquired.
 * Returns { alreadyRegistered: true } if a matching registration already exists for the same date.
 * Schema: id, first_name, last_name, age_group, underage_age, session_type, camp_session_id, date, start_time, end_time, realized, created_at, updated_at (cols A–M)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0014).
 */
function registerTraineeForSession_(payload) {
  const required = ['first_name', 'last_name', 'age_group', 'session_type', 'date', 'start_time', 'end_time'];
  const missing = required.filter(field => !payload || !payload[field]);
  if (missing.length > 0) {
    return { validationFailed: true };
  }

  if (payload.age_group !== 'adult' && payload.age_group !== 'underage') {
    return { validationFailed: true };
  }

  if (payload.age_group === 'underage' && (payload.underage_age === undefined || payload.underage_age === null || payload.underage_age === '')) {
    return { validationFailedAge: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const tz = Session.getScriptTimeZone();
    const traineeRegRows = getSheetData('trainee_registrations');
    const payloadDate = normalizeDateYmd_(payload.date, tz);
    const payloadFirstName = String(payload.first_name || '').trim().toLowerCase();
    const payloadLastName = String(payload.last_name || '').trim().toLowerCase();
    const payloadAgeGroup = String(payload.age_group || '').trim().toLowerCase();
    const payloadUnderageAge = String(
      payload.underage_age !== undefined && payload.underage_age !== null ? payload.underage_age : ''
    ).trim();
    const payloadSessionType = String(payload.session_type || '').trim().toLowerCase();
    const payloadCampSessionId = String(payload.camp_session_id || '').trim();
    const payloadStartTime = normalizeTimeHm_(payload.start_time, tz);
    const payloadEndTime = normalizeTimeHm_(payload.end_time, tz);

    // Check for duplicate registration: same date + all payload fields (excludes id, realized, created_at, updated_at)
    const alreadyRegistered = traineeRegRows.some(row => {
      const rowDate = normalizeDateYmd_(row[7], tz);
      if (rowDate !== payloadDate) return false;

      return (
        String(row[1] || '').trim().toLowerCase() === payloadFirstName &&
        String(row[2] || '').trim().toLowerCase() === payloadLastName &&
        String(row[3] || '').trim().toLowerCase() === payloadAgeGroup &&
        String(row[4] || '').trim() === payloadUnderageAge &&
        String(row[5] || '').trim().toLowerCase() === payloadSessionType &&
        String(row[6] || '').trim() === payloadCampSessionId &&
        normalizeTimeHm_(row[8], tz) === payloadStartTime &&
        normalizeTimeHm_(row[9], tz) === payloadEndTime
      );
    });

    if (alreadyRegistered) {
      return { alreadyRegistered: true };
    }

    const sh = getSheetByName('trainee_registrations');
    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    sh.appendRow([
      id,
      payload.first_name,
      payload.last_name,
      payload.age_group,
      payload.age_group === 'underage' ? payload.underage_age : '',
      payload.session_type,
      payload.camp_session_id || '',
      payload.date,
      payload.start_time,
      payload.end_time,
      true,
      now,
      now
    ]);

    logToSheet(`registerTraineeForSession_ - appended row id: ${id}`);
    return { id };
  } finally {
    lock.releaseLock();
  }
}

function buildTraineeRegistrationKey_(entry, tz) {
  return [
    String(entry.first_name || '').trim().toLowerCase(),
    String(entry.last_name || '').trim().toLowerCase(),
    String(entry.age_group || '').trim().toLowerCase(),
    String(entry.underage_age || '').trim(),
    String(entry.session_type || '').trim().toLowerCase(),
    String(entry.camp_session_id || '').trim(),
    normalizeDateYmd_(entry.date, tz),
    normalizeTimeHm_(entry.start_time, tz),
    normalizeTimeHm_(entry.end_time, tz)
  ].join('|');
}

function validateBatchTraineeRegistrationRow_(row) {
  if (!row) {
    return 'validation_failed';
  }

  const required = ['first_name', 'last_name', 'age_group', 'session_type', 'date'];
  const missing = required.some(field => !String(row[field] || '').trim());
  if (missing) {
    return 'validation_failed';
  }

  const ageGroup = String(row.age_group || '').trim().toLowerCase();
  if (ageGroup !== 'adult' && ageGroup !== 'underage') {
    return 'validation_failed';
  }

  if (ageGroup === 'underage' && !String(row.underage_age === undefined || row.underage_age === null ? '' : row.underage_age).trim()) {
    return 'validation_failed_age';
  }

  const sessionType = String(row.session_type || '').trim().toLowerCase();
  const startTime = String(row.start_time || '').trim();
  const endTime = String(row.end_time || '').trim();
  const hasStartTime = !!startTime;
  const hasEndTime = !!endTime;

  if (sessionType === 'free/sparring') {
    if (hasStartTime !== hasEndTime) {
      return 'validation_failed_time_pair';
    }
  }

  if (sessionType === 'camp' && !String(row.camp_session_id || '').trim()) {
    return 'validation_failed_camp_session_id';
  }

  return '';
}

function buildCustomerEventKey_(eventEntry) {
  return [
    String(eventEntry.event || '').trim().toLowerCase(),
    String(eventEntry.event_alias || '').trim().toLowerCase()
  ].join('|');
}

function buildCustomerEventScheduleKey_(scheduleEntry, tz) {
  return [
    String(scheduleEntry.session_name || '').trim().toLowerCase(),
    String(scheduleEntry.session_name_alias || '').trim().toLowerCase(),
    normalizeDateYmd_(scheduleEntry.date, tz),
    normalizeTimeHm_(scheduleEntry.start_time, tz),
    normalizeTimeHm_(scheduleEntry.end_time, tz)
  ].join('|');
}

function validateCustomerEventPayload_(payload, tz) {
  if (!payload) {
    return false;
  }

  const event = String(payload.event || '').trim();
  const eventAlias = String(payload.event_alias || '').trim();
  const instructor = String(payload.instructor || '').trim();
  const startDate = normalizeDateYmd_(payload.start_date, tz);
  const endDate = normalizeDateYmd_(payload.end_date, tz);
  const schedules = payload && Array.isArray(payload.schedules) ? payload.schedules : null;

  if (!event || !eventAlias || !instructor || !startDate || !endDate) {
    return false;
  }
  if (endDate < startDate) {
    return false;
  }
  if (!schedules || schedules.length === 0) {
    return false;
  }

  return true;
}

function validateCustomerEventScheduleRow_(row, eventStartDate, eventEndDate, tz) {
  const sessionName = String(row.session_name || '').trim();
  const sessionNameAlias = String(row.session_name_alias || '').trim();
  const date = normalizeDateYmd_(row.date, tz);
  const startTime = normalizeTimeHm_(row.start_time, tz);
  const endTime = normalizeTimeHm_(row.end_time, tz);

  if (!sessionName || !sessionNameAlias || !date || !startTime || !endTime) {
    return 'validation_failed';
  }
  if (date < eventStartDate || date > eventEndDate) {
    return 'validation_failed_date_range';
  }
  if (endTime < startTime) {
    return 'validation_failed_time_range';
  }

  return '';
}

/**
 * Register one customer event and one or more customer event schedules (OQM-0035).
 * Writes the customer event row once, then inserts valid non-duplicate schedule rows.
 * Invalid or duplicate schedules are rejected with row-level reasons.
 */
function registerCustomerEventWithSchedule_(payload) {
  const tz = Session.getScriptTimeZone();
  if (!validateCustomerEventPayload_(payload, tz)) {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const eventsSheet = getSheetByName('customer_events');
    if (!eventsSheet) {
      throw new Error('Sheet not found: customer_events');
    }
    const schedulesSheet = getSheetByName('customer_event_schedules');
    if (!schedulesSheet) {
      throw new Error('Sheet not found: customer_event_schedules');
    }

    const event = String(payload.event || '').trim();
    const eventAlias = String(payload.event_alias || '').trim();
    const instructor = String(payload.instructor || '').trim();
    const startDate = normalizeDateYmd_(payload.start_date, tz);
    const endDate = normalizeDateYmd_(payload.end_date, tz);
    const schedules = Array.isArray(payload.schedules) ? payload.schedules : [];

    const existingEventRows = getSheetData('customer_events');
    const existingEventKeys = {};
    existingEventRows.forEach(row => {
      const key = buildCustomerEventKey_({
        event: row[1],
        event_alias: row[2]
      });
      existingEventKeys[key] = true;
    });

    const eventKey = buildCustomerEventKey_({ event: event, event_alias: eventAlias });
    if (existingEventKeys[eventKey]) {
      return { duplicateEvent: true };
    }

    const now = new Date().toISOString();
    const eventId = Utilities.getUuid();
    eventsSheet.appendRow([
      eventId,
      event,
      eventAlias,
      instructor,
      startDate,
      endDate,
      true,
      now,
      now
    ]);

    const existingScheduleRows = getSheetData('customer_event_schedules');
    const existingScheduleKeys = {};
    existingScheduleRows.forEach(row => {
      const key = buildCustomerEventScheduleKey_({
        session_name: row[2],
        session_name_alias: row[3],
        date: row[4],
        start_time: row[5],
        end_time: row[6]
      }, tz);
      existingScheduleKeys[key] = true;
    });

    let scheduleInsertedCount = 0;
    let scheduleRejectedCount = 0;
    const results = [];

    for (let i = 0; i < schedules.length; i++) {
      const rawRow = schedules[i] || {};
      const sessionName = String(rawRow.session_name || '').trim();
      const sessionNameAlias = String(rawRow.session_name_alias || '').trim();
      const date = normalizeDateYmd_(rawRow.date, tz);
      const startTime = normalizeTimeHm_(rawRow.start_time, tz);
      const endTime = normalizeTimeHm_(rawRow.end_time, tz);

      const normalizedRow = {
        session_name: sessionName,
        session_name_alias: sessionNameAlias,
        date: date,
        start_time: startTime,
        end_time: endTime
      };

      const validationError = validateCustomerEventScheduleRow_(normalizedRow, startDate, endDate, tz);
      if (validationError) {
        scheduleRejectedCount += 1;
        results.push({ rowIndex: i, status: 'rejected', reason: validationError });
        continue;
      }

      const scheduleKey = buildCustomerEventScheduleKey_(normalizedRow, tz);
      if (existingScheduleKeys[scheduleKey]) {
        scheduleRejectedCount += 1;
        results.push({ rowIndex: i, status: 'rejected', reason: 'already_registered' });
        continue;
      }

      const scheduleId = Utilities.getUuid();
      schedulesSheet.appendRow([
        scheduleId,
        eventId,
        sessionName,
        sessionNameAlias,
        date,
        startTime,
        endTime,
        true,
        now,
        now
      ]);
      existingScheduleKeys[scheduleKey] = true;
      scheduleInsertedCount += 1;
      results.push({ rowIndex: i, status: 'added', id: scheduleId });
    }

    return {
      customerEventInsertedCount: 1,
      totalScheduleRows: schedules.length,
      scheduleInsertedCount: scheduleInsertedCount,
      scheduleRejectedCount: scheduleRejectedCount,
      results: results
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Register trainee rows in batch for admin paper-list transfer (OQM-0034).
 * Expands rows with multiple dates into separate rows before processing.
 * Returns per-row status and summary counts.
 */
function registerTraineeBatchForSessions_(payload) {
  const rows = payload && Array.isArray(payload.rows) ? payload.rows : null;
  if (!rows || rows.length === 0) {
    return { validationFailed: true };
  }

  // Expand rows with multiple dates into individual rows
  const expandedRows = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || {};
    const dates = Array.isArray(row.dates) ? row.dates : [];
    
    if (dates.length === 0) {
      // At least one date is required per row
      return { validationFailed: true };
    }

    dates.forEach(date => {
      expandedRows.push({
        ...row,
        date: date,
        originalRowIndex: i
      });
    });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const tz = Session.getScriptTimeZone();
    const sheet = getSheetByName('trainee_registrations');
    if (!sheet) {
      throw new Error('Sheet not found: trainee_registrations');
    }

    const existingRows = getSheetData('trainee_registrations');
    const existingKeys = {};
    existingRows.forEach(row => {
      const key = buildTraineeRegistrationKey_({
        first_name: row[1],
        last_name: row[2],
        age_group: row[3],
        underage_age: row[4],
        session_type: row[5],
        camp_session_id: row[6],
        date: row[7],
        start_time: row[8],
        end_time: row[9]
      }, tz);
      existingKeys[key] = true;
    });

    const now = new Date().toISOString();
    const results = [];
    let addedCount = 0;
    let rejectedCount = 0;
    const rowResultMap = {}; // Track results per original row index

    for (let i = 0; i < expandedRows.length; i++) {
      const rawRow = expandedRows[i] || {};
      const originalRowIndex = rawRow.originalRowIndex;
      const firstName = String(rawRow.first_name || '').trim();
      const lastName = String(rawRow.last_name || '').trim();
      const ageGroup = String(rawRow.age_group || '').trim().toLowerCase();
      const underageAge = String(rawRow.underage_age === undefined || rawRow.underage_age === null ? '' : rawRow.underage_age).trim();
      const sessionType = String(rawRow.session_type || '').trim().toLowerCase();
      const campSessionId = String(rawRow.camp_session_id || '').trim();
      const date = normalizeDateYmd_(rawRow.date, tz);
      const startTime = normalizeTimeHm_(rawRow.start_time, tz);
      const endTime = normalizeTimeHm_(rawRow.end_time, tz);

      const normalizedRow = {
        first_name: firstName,
        last_name: lastName,
        age_group: ageGroup,
        underage_age: underageAge,
        session_type: sessionType,
        camp_session_id: campSessionId,
        date: date,
        start_time: startTime,
        end_time: endTime
      };

      const validationError = validateBatchTraineeRegistrationRow_(normalizedRow);
      if (validationError) {
        if (!rowResultMap[originalRowIndex]) {
          rowResultMap[originalRowIndex] = { rowIndex: originalRowIndex, status: 'rejected', reason: validationError };
          rejectedCount += 1;
        }
        continue;
      }

      const key = buildTraineeRegistrationKey_(normalizedRow, tz);
      if (existingKeys[key]) {
        if (!rowResultMap[originalRowIndex]) {
          rowResultMap[originalRowIndex] = { rowIndex: originalRowIndex, status: 'rejected', reason: 'already_registered' };
          rejectedCount += 1;
        }
        continue;
      }

      const id = Utilities.getUuid();
      sheet.appendRow([
        id,
        firstName,
        lastName,
        ageGroup,
        ageGroup === 'underage' ? underageAge : '',
        sessionType,
        campSessionId,
        date,
        startTime,
        endTime,
        true,
        now,
        now
      ]);
      existingKeys[key] = true;
      addedCount += 1;
      
      if (!rowResultMap[originalRowIndex]) {
        rowResultMap[originalRowIndex] = { rowIndex: originalRowIndex, status: 'added', id: id };
      }
    }

    // Compile results in original row order
    const finalResults = [];
    for (let i = 0; i < rows.length; i++) {
      if (rowResultMap[i]) {
        finalResults.push(rowResultMap[i]);
      }
    }

    return {
      totalRows: rows.length,
      addedCount: addedCount,
      rejectedCount: rejectedCount,
      results: finalResults
    };
  } finally {
    lock.releaseLock();
  }
}

// usage: 
//  logToSheet(`removeCoachRegistration - alias: ${alias}`);
//  logToSheet(`holder: ` + JSON.stringify(holder));
function logToSheet(message) {
  if (!isLoggingEnabled_()) return;
  const sheet = getSpreadsheet().getSheetByName("Logs");
  if (!sheet) return;
  sheet.appendRow([new Date(), message]);
}

/**
 * Checks whether Logs!A1 == "log_enabled", cached briefly to avoid opening
 * the spreadsheet on every logToSheet() call within a request (perf).
 */
function isLoggingEnabled_() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('logging_enabled');
    if (cached !== null) {
      return cached === '1';
    }

    const sheet = getSpreadsheet().getSheetByName("Logs");
    const enabled = sheet ? String(sheet.getRange("A1").getValue()).trim() === "log_enabled" : false;
    cache.put('logging_enabled', enabled ? '1' : '0', 30);
    return enabled;
  } catch (_err) {
    return false;
  }
}

// Short-TTL cache for computed session-window arrays (getCoachSessions_/getTraineeSessions_ only).
const SESSION_WINDOW_CACHE_TTL_SECONDS = 25;

/**
 * Reads a cached session-window array. Fails open (returns null) on any
 * CacheService error or unparseable payload, mirroring isLoggingEnabled_().
 */
function getCachedSessionWindow_(cacheKey) {
  try {
    const cache = CacheService.getScriptCache();
    const raw = cache.get(cacheKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

/**
 * Writes a computed session-window array to cache. Fails open (swallows
 * errors) so a CacheService outage never breaks the calling route.
 */
function putCachedSessionWindow_(cacheKey, data) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(cacheKey, JSON.stringify(data), SESSION_WINDOW_CACHE_TTL_SECONDS);
  } catch (_err) {
    // best-effort cache write only
  }
}

/**
 * Computes the identity-independent trainee session-window array (21-day
 * window x sessions_schedule, realized free/sparring coach registrations,
 * and camp replacements). Excludes trainee_registered enrichment — that is
 * always applied fresh per-request by the caller, even when this result
 * came from cache.
 * @returns {Array}
 */
function computeTraineeSessionsBase_(reader, tz) {
  const sessionsScheduleRows = reader.getSheetData('sessions_schedule');
  const coachRegistrationsRows = reader.getSheetData('coach_registrations');
  const campsRows = reader.getSheetData('camps');
  const campSchedulesRows = reader.getSheetData('camp_schedules');

  // Build 21-day window: previous Monday through next 2 weeks.
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var dayOfWeek = today.getDay();
  var daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysToMonday);
  currentMonday.setHours(0, 0, 0, 0);
  var prevMonday = new Date(currentMonday);
  prevMonday.setDate(currentMonday.getDate() - 7);

  var sessionDates = [];
  var sessionDateStrs = [];
  var sessionDateSet = {};
  for (var i = 0; i < 21; i++) {
    var d = new Date(prevMonday);
    d.setDate(prevMonday.getDate() + i);
    sessionDates.push(d);
    var ds = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
    sessionDateStrs.push(ds);
    sessionDateSet[ds] = true;
  }

  // sessions_schedule schema: [id, session_type, session_type_alias, start_date, end_date, weekdays_available, start_time, end_time, location, location_alias, active]
  const sessionAliasByType = {};
  const parsedSchedules = [];
  sessionsScheduleRows.forEach(row => {
    if (!getBooleanValue(row[10])) return;

    const sessionType = String(row[1] || '').trim();
    if (!sessionType) return;

    const sessionTypeUpper = sessionType.toUpperCase();
    const sessionTypeAlias = String(row[2] || '').trim() || sessionType;
    if (!sessionAliasByType[sessionTypeUpper]) {
      sessionAliasByType[sessionTypeUpper] = sessionTypeAlias;
    }

    const startDateYmd = normalizeDateYmd_(row[3], tz);
    const endDateYmd = normalizeDateYmd_(row[4], tz);
    if (!startDateYmd || !endDateYmd) return;

    const weekdaySet = {};
    String(row[5] || '')
      .split(',')
      .map(part => Number(part.trim()))
      .filter(val => Number.isFinite(val))
      .forEach(val => {
        weekdaySet[val] = true;
      });

    parsedSchedules.push({
      id: String(row[0] || ''),
      sessionType: sessionType,
      sessionTypeAlias: sessionTypeAlias,
      sessionTypeUpper: sessionTypeUpper,
      startDateYmd: startDateYmd,
      endDateYmd: endDateYmd,
      weekdaySet: weekdaySet,
      startTime: normalizeTimeHm_(row[6], tz),
      endTime: normalizeTimeHm_(row[7], tz),
      location: String(row[8] || ''),
    });
  });

  const sessions = [];

  // Build regular sessions from weekly schedule x date window.
  for (var di = 0; di < sessionDates.length; di++) {
    var sessionDate = sessionDates[di];
    var dateStr = sessionDateStrs[di];
    var weekday = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;

    for (var si = 0; si < parsedSchedules.length; si++) {
      var sched = parsedSchedules[si];
      if (!sched.weekdaySet[weekday]) continue;
      if (dateStr < sched.startDateYmd || dateStr > sched.endDateYmd) {
        continue;
      }

      sessions.push({
        id: sched.id + '_' + dateStr,
        session_type: sched.sessionType,
        session_type_alias: sched.sessionTypeAlias,
        date: dateStr,
        start_time: sched.startTime,
        end_time: sched.endTime,
        location: sched.location,
        coach_firstname: '',
        coach_lastname: '',
        camp_instructor_name: '',
        is_free_sparring: false,
      });
    }
  }

  // Add realized free/sparring sessions from coach_registrations.
  coachRegistrationsRows.forEach(row => {
    if (row.length >= 6 && !getBooleanValue(row[5])) return;

    const sessionType = String(row[3] || '').trim();
    if (sessionType.toUpperCase() !== 'FREE/SPARRING') return;

    const dateStr = timeToStr(row[4], tz, 'yyyy-MM-dd');
    if (!sessionDateSet[dateStr]) return;

    const sparringAlias = sessionAliasByType['FREE/SPARRING'] || 'free/sparring';

    sessions.push({
      id: 'sparring_' + String(row[0] || '') + '_' + dateStr,
      session_type: 'free/sparring',
      session_type_alias: sparringAlias,
      date: dateStr,
      start_time: timeToStr(row[6], tz, 'HH:mm'),
      end_time: timeToStr(row[7], tz, 'HH:mm'),
      location: '',
      coach_firstname: String(row[1] || '').trim(),
      coach_lastname: String(row[2] || '').trim(),
      camp_instructor_name: '',
      is_free_sparring: true,
    });
  });

  // Build active camps index for the same 21-day window.
  const windowStart = sessionDateStrs[0];
  const windowEnd = sessionDateStrs[sessionDateStrs.length - 1];
  const campMap = {};
  campsRows.forEach(row => {
    const campId = String(row[0] || '');
    if (!campId) return;
    const startDate = timeToStr(row[4], tz, 'yyyy-MM-dd');
    const endDate = timeToStr(row[5], tz, 'yyyy-MM-dd');
    if (endDate < windowStart || startDate > windowEnd) return;
    campMap[campId] = {
      name: String(row[1] || '').trim(),
      alias: String(row[2] || '').trim(),
      instructor: String(row[3] || '').trim(),
    };
  });

  const campDatesToReplace = {};
  const campSessions = [];
  campSchedulesRows.forEach(row => {
    const campId = String(row[1] || '');
    const camp = campMap[campId];
    if (!camp) return;

    const dateStr = timeToStr(row[3], tz, 'yyyy-MM-dd');
    if (!sessionDateSet[dateStr]) return;

    const sessionName = String(row[2] || '').trim();
    campDatesToReplace[dateStr] = true;

    campSessions.push({
      id: 'camp_' + String(row[0] || '') + '_' + dateStr,
      session_type: camp.name + (sessionName ? ' - ' + sessionName : ''),
      session_type_alias: (camp.alias || camp.name) + (sessionName ? ' - ' + sessionName : ''),
      date: dateStr,
      start_time: timeToStr(row[4], tz, 'HH:mm'),
      end_time: timeToStr(row[5], tz, 'HH:mm'),
      location: '',
      coach_firstname: '',
      coach_lastname: '',
      camp_instructor_name: camp.instructor,
      is_free_sparring: false,
    });
  });

  // Replace regular sessions with camp sessions for camp dates, but keep free/sparring sessions.
  const filtered = sessions.filter(session => {
    return session.is_free_sparring || !campDatesToReplace[session.date];
  });

  const merged = filtered.concat(campSessions);
  merged.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return merged;
}

/**
 * Fetch trainee sessions for a 21-day window (7 days before current week's Monday through next 2 weeks).
 * Includes regular active sessions, realized free/sparring coach sessions, and camp session replacements.
 * Returns trainee-facing session objects sorted by date and start_time.
 * @returns {Array}
 */
function getTraineeSessions_(traineeIdentity, reader) {
  const tz = Session.getScriptTimeZone();
  const cacheKey = 'trainee_sessions_base_v1_' + Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  let merged = getCachedSessionWindow_(cacheKey);
  if (!merged) {
    merged = computeTraineeSessionsBase_(reader, tz);
    putCachedSessionWindow_(cacheKey, merged);
  }

  const identity = traineeIdentity || {};
  const identityFirstName = String(identity.first_name || '').trim().toLowerCase();
  const identityLastName = String(identity.last_name || '').trim().toLowerCase();
  const identityAgeGroup = String(identity.age_group || '').trim().toLowerCase();
  const identityUnderageAge = identityAgeGroup === 'underage'
    ? String(identity.underage_age || '').trim()
    : '';

  const hasIdentity = identityFirstName && identityLastName && (identityAgeGroup === 'adult' || identityAgeGroup === 'underage');

  if (hasIdentity) {
    const traineeRegistrationsRows = reader.getSheetData('trainee_registrations');
    const registrationKeys = {};

    traineeRegistrationsRows.forEach(row => {
      if (row.length >= 11 && !getBooleanValue(row[10])) return;

      const rowFirstName = String(row[1] || '').trim().toLowerCase();
      const rowLastName = String(row[2] || '').trim().toLowerCase();
      const rowAgeGroup = String(row[3] || '').trim().toLowerCase();
      const rowUnderageAge = String(row[4] || '').trim();
      if (rowFirstName !== identityFirstName) return;
      if (rowLastName !== identityLastName) return;
      if (rowAgeGroup !== identityAgeGroup) return;
      if (identityAgeGroup === 'underage' && rowUnderageAge !== identityUnderageAge) return;

      const dateStr = normalizeDateYmd_(row[7], tz);
      const startTime = normalizeTimeHm_(row[8], tz);
      const endTime = normalizeTimeHm_(row[9], tz);
      const campSessionId = String(row[6] || '').trim();
      const sessionType = String(row[5] || '').trim().toLowerCase();
      if (!dateStr || !startTime || !endTime) return;

      if (campSessionId) {
        registrationKeys[`camp:${campSessionId}|${dateStr}|${startTime}|${endTime}`] = true;
        return;
      }

      registrationKeys[`type:${sessionType}|${dateStr}|${startTime}|${endTime}`] = true;
    });

    merged.forEach(session => {
      let registrationKey = '';
      if (String(session.id || '').indexOf('camp_') === 0) {
        const idParts = String(session.id).split('_');
        const campSessionId = idParts.length >= 3 ? idParts[1] : '';
        registrationKey = `camp:${campSessionId}|${session.date}|${session.start_time}|${session.end_time}`;
      } else {
        registrationKey = `type:${String(session.session_type || '').trim().toLowerCase()}|${session.date}|${session.start_time}|${session.end_time}`;
      }

      if (registrationKeys[registrationKey]) {
        session.trainee_registered = true;
      }
    });
  }

  logToSheet('getTraineeSessions_() - returned ' + merged.length + ' sessions');
  return merged;
}

// ─── Sessions Schedule (OQM-0042) ────────────────────────────────────────────

/**
 * Validate a sessions_schedule payload.
 * Returns '' on success, 'validation_failed' on any error.
 */
function validateSessionSchedulePayload_(payload, tz) {
  if (!payload) return 'validation_failed';

  const sessionType = String(payload.session_type || '').trim();
  const sessionTypeAlias = String(payload.session_type_alias || '').trim();
  const startDate = normalizeDateYmd_(payload.start_date, tz);
  const endDate = normalizeDateYmd_(payload.end_date, tz);
  const weekdays = String(payload.weekdays_available || '').trim();

  if (!sessionType || !sessionTypeAlias) return 'validation_failed';
  if (!startDate || !endDate) return 'validation_failed';
  if (endDate < startDate) return 'validation_failed';

  // weekdays_available: non-empty, comma-separated integers 0–6, no duplicates
  if (!weekdays) return 'validation_failed';
  const dayParts = weekdays.split(',');
  const daySet = {};
  for (var i = 0; i < dayParts.length; i++) {
    const raw = dayParts[i].trim();
    const d = Number(raw);
    if (raw === '' || isNaN(d) || d < 0 || d > 6 || Math.floor(d) !== d) return 'validation_failed';
    if (daySet[String(d)]) return 'validation_failed';
    daySet[String(d)] = true;
  }

  // active must be boolean
  if (typeof payload.active !== 'boolean') return 'validation_failed';

  // start_time / end_time: optional but must be paired
  const startTime = payload.start_time ? normalizeTimeHm_(payload.start_time, tz) : '';
  const endTime = payload.end_time ? normalizeTimeHm_(payload.end_time, tz) : '';
  if ((startTime && !endTime) || (!startTime && endTime)) return 'validation_failed';
  if (startTime && endTime && endTime < startTime) return 'validation_failed';

  return '';
}

/**
 * Map a raw sheet row (0-indexed array) to a SessionScheduleRecord object.
 */
function mapSessionScheduleRow_(row, tz) {
  return {
    id: String(row[0] || ''),
    session_type: String(row[1] || ''),
    session_type_alias: String(row[2] || ''),
    start_date: normalizeDateYmd_(row[3], tz),
    end_date: normalizeDateYmd_(row[4], tz),
    // Preserve numeric 0 (Monday-only) instead of treating it as empty.
    weekdays_available: String(row[5] ?? ''),
    start_time: normalizeTimeHm_(row[6], tz),
    end_time: normalizeTimeHm_(row[7], tz),
    location: String(row[8] || ''),
    location_alias: String(row[9] || ''),
    active: row[10] === true || String(row[10]).toUpperCase() === 'TRUE',
    created_at: String(row[11] || ''),
    updated_at: String(row[12] || '')
  };
}

/**
 * List all rows in sessions_schedule (OQM-0042).
 * Read-only — no lock required.
 */
function listSessionsSchedule_() {
  const tz = Session.getScriptTimeZone();
  const rows = getSheetData('sessions_schedule');
  const schedules = rows.map(function(row) {
    return mapSessionScheduleRow_(row, tz);
  });
  return { schedules: schedules };
}

/**
 * Add one row to sessions_schedule (OQM-0042).
 */
function addSessionSchedule_(payload) {
  const tz = Session.getScriptTimeZone();
  if (validateSessionSchedulePayload_(payload, tz) !== '') {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const sheet = getSheetByName('sessions_schedule');
    if (!sheet) throw new Error('Sheet not found: sessions_schedule');

    const sessionType = String(payload.session_type || '').trim();
    const sessionTypeAlias = String(payload.session_type_alias || '').trim();
    const startDate = normalizeDateYmd_(payload.start_date, tz);
    const endDate = normalizeDateYmd_(payload.end_date, tz);
    const weekdays = String(payload.weekdays_available || '').trim();
    const startTime = payload.start_time ? normalizeTimeHm_(payload.start_time, tz) : '';
    const endTime = payload.end_time ? normalizeTimeHm_(payload.end_time, tz) : '';
    const location = String(payload.location || '').trim();
    const locationAlias = String(payload.location_alias || '').trim();
    const active = payload.active !== false;

    // Duplicate check: same session_type + weekdays + times + location, overlapping dates, active=true rows
    const existing = getSheetData('sessions_schedule');
    for (var i = 0; i < existing.length; i++) {
      const row = existing[i];
      const rowActive = row[10] === true || String(row[10]).toUpperCase() === 'TRUE';
      if (!rowActive) continue;
      const rowStart = normalizeDateYmd_(row[3], tz);
      const rowEnd = normalizeDateYmd_(row[4], tz);
      if (endDate < rowStart || startDate > rowEnd) continue;
      if (String(row[1] || '').trim() === sessionType &&
          String(row[5] || '').trim() === weekdays &&
          normalizeTimeHm_(row[6], tz) === startTime &&
          normalizeTimeHm_(row[7], tz) === endTime &&
          String(row[8] || '').trim() === location) {
        return { scheduleAlreadyExists: true };
      }
    }

    const now = new Date().toISOString();
    const id = String(Date.now());
    sheet.appendRow([id, sessionType, sessionTypeAlias, startDate, endDate,
                     weekdays, startTime, endTime, location, locationAlias,
                     active, now, now]);

    return {
      schedule: {
        id: id,
        session_type: sessionType,
        session_type_alias: sessionTypeAlias,
        start_date: startDate,
        end_date: endDate,
        weekdays_available: weekdays,
        start_time: startTime,
        end_time: endTime,
        location: location,
        location_alias: locationAlias,
        active: active,
        created_at: now,
        updated_at: now
      }
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Update an existing row in sessions_schedule (OQM-0042).
 * Never modifies id (col A) or created_at (col L).
 */
function updateSessionSchedule_(payload) {
  const tz = Session.getScriptTimeZone();
  const id = String(payload && payload.id ? payload.id : '').trim();
  if (!id) return { validationFailed: true };
  if (validateSessionSchedulePayload_(payload, tz) !== '') {
    return { validationFailed: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const sheet = getSheetByName('sessions_schedule');
    if (!sheet) throw new Error('Sheet not found: sessions_schedule');

    const existing = getSheetData('sessions_schedule');
    var targetIndex = -1;
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i][0] || '') === id) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) return { noMatchFound: true };

    const sessionType = String(payload.session_type || '').trim();
    const sessionTypeAlias = String(payload.session_type_alias || '').trim();
    const startDate = normalizeDateYmd_(payload.start_date, tz);
    const endDate = normalizeDateYmd_(payload.end_date, tz);
    const weekdays = String(payload.weekdays_available || '').trim();
    const startTime = payload.start_time ? normalizeTimeHm_(payload.start_time, tz) : '';
    const endTime = payload.end_time ? normalizeTimeHm_(payload.end_time, tz) : '';
    const location = String(payload.location || '').trim();
    const locationAlias = String(payload.location_alias || '').trim();
    const active = payload.active !== false;

    // Duplicate check, excluding the row being updated
    for (var j = 0; j < existing.length; j++) {
      if (j === targetIndex) continue;
      const row = existing[j];
      const rowActive = row[10] === true || String(row[10]).toUpperCase() === 'TRUE';
      if (!rowActive) continue;
      const rowStart = normalizeDateYmd_(row[3], tz);
      const rowEnd = normalizeDateYmd_(row[4], tz);
      if (endDate < rowStart || startDate > rowEnd) continue;
      if (String(row[1] || '').trim() === sessionType &&
          String(row[5] || '').trim() === weekdays &&
          normalizeTimeHm_(row[6], tz) === startTime &&
          normalizeTimeHm_(row[7], tz) === endTime &&
          String(row[8] || '').trim() === location) {
        return { scheduleAlreadyExists: true };
      }
    }

    const now = new Date().toISOString();
    const createdAt = String(existing[targetIndex][11] || '');
    const sheetRow = targetIndex + 2; // 1-based + header row offset

    // Update columns B–K (2–11) and M (13); never touch A (id) or L (created_at)
    sheet.getRange(sheetRow, 2, 1, 10).setValues([[
      sessionType, sessionTypeAlias, startDate, endDate,
      weekdays, startTime, endTime, location, locationAlias, active
    ]]);
    sheet.getRange(sheetRow, 13).setValue(now);

    return {
      schedule: {
        id: id,
        session_type: sessionType,
        session_type_alias: sessionTypeAlias,
        start_date: startDate,
        end_date: endDate,
        weekdays_available: weekdays,
        start_time: startTime,
        end_time: endTime,
        location: location,
        location_alias: locationAlias,
        active: active,
        created_at: createdAt,
        updated_at: now
      }
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Delete a row from sessions_schedule by id (OQM-0042).
 */
function deleteSessionSchedule_(payload) {
  const id = String(payload && payload.id ? payload.id : '').trim();
  if (!id) return { validationFailed: true };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { concurrentRequest: true };
  }

  try {
    const sheet = getSheetByName('sessions_schedule');
    if (!sheet) throw new Error('Sheet not found: sessions_schedule');

    const existing = getSheetData('sessions_schedule');
    var targetIndex = -1;
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i][0] || '') === id) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) return { noMatchFound: true };

    const sheetRow = targetIndex + 2; // 1-based + header row offset
    sheet.deleteRow(sheetRow);
    return { deletedId: id };
  } finally {
    lock.releaseLock();
  }
}