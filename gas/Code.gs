/**
 * Web API for Sheets
 * Routes:
 *  - GET  ?route=listItems       — list items from Data sheet
 *  - GET  ?route=getSettings     — list rows from settings sheet (QCM-0001)
 *  - GET  ?route=getCoachSessions — fetch 21-day session window (OQM-0007)
 *  - GET  ?route=getTraineeSessions — fetch trainee-facing 21-day session window (OQM-0015)
 *  - POST { route: "coachLogin", payload: { mode: "pin"|"password", pin?|password? } } — create coach session token
 *  - POST { route: "adminLogin", payload: { password } } — create admin session token
 *  - POST { route: "createItem", payload: { name, email } }
 *  - POST { route: "registerCoachPin", payload: { firstname, lastname, alias, pin } } — register a new coach PIN code (OQM-0003)
 *  - POST { route: "verifyCoachPin", payload: { pin } } — verify a coach PIN against coach_login sheet (OQM-0004)
 *  - POST { route: "registerCoachForSession", payload: { firstname, lastname, session_type, date, start_time?, end_time? } } — register coach for a session (OQM-0008/OQM-0011); returns overlapping_session|date|start|end for time conflicts
 *  - POST { route: "removeCoachFromSession", payload: { firstname, lastname, session_type, date } } — remove coach from a session (OQM-0009)
 *  - POST { route: "registerTraineePin", payload: { firstname, lastname, age, pin } } — register a new trainee PIN code (OQM-0016)
 *  - POST { route: "verifyTraineePin", payload: { pin } } — verify a trainee PIN against trainee_login sheet (OQM-0016)
 *  - POST { route: "registerTraineeForSession", payload: { first_name, last_name, age_group, underage_age?, session_type, camp_session_id?, date, start_time, end_time } } — register trainee for a session (OQM-0014)
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
      const data = getCoachSessions_();
      return json_({ ok: true, data });
    }
    if (route === 'getTraineeSessions') {
      const data = getTraineeSessions_();
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
    if (route === 'createItem') {
      const created = createItem_(payload);
      return json_({ ok: true, data: created });
    }
    if (route === 'registerCoachPin') {
      const result = registerCoachPin_(payload);
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
      const result = registerCoachForSession_(payload);
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
      const result = removeCoachFromSession_(payload);
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
    return json_({ ok: false, error: 'Unknown route' });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 400);
  }
}

function json_(obj, _status) {
  logToSheet(`return - obj: ${JSON.stringify(obj)}, status: ${_status}`);
  return ContentService.createTextOutput(JSON.stringify(obj))
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
    'registerTraineeForSession',
    'registerTraineePin',
    'verifyTraineePin'
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
    'getSettings'
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
  const payloadFirstnameLower = payloadFirstname.toLowerCase();
  const payloadLastnameLower = payloadLastname.toLowerCase();

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
 * Register a coach for a specific session.
 * Validates that the coach exists in coach_login and that no coach is already registered for the session.
 * On success, appends a row to coach_registrations and returns the new row id.
 * Returns { alreadyTaken: true } if a coach is already registered for the session+date.
 * Returns { unknownCoach: true } if the coach is not in coach_login.
 * Schema: id, first_name, last_name, session_type, date, realized, start_time, end_time, created_at, updated_at (columns A–J)
 * See SKILL.sheet-schema.md for full schema definition.
 * See SKILL.wire-react-to-gas.md for API contract (OQM-0008).
 */
function registerCoachForSession_(payload) {
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
    const coachRows = getSheetData('coach_login');
    const coachExists = coachRows.some(r =>
      String(r[1]).trim().toLowerCase() === payload.firstname.trim().toLowerCase() &&
      String(r[2]).trim().toLowerCase() === payload.lastname.trim().toLowerCase()
    );
    if (!coachExists) {
      return { unknownCoach: true };
    }

    // Check if session already has a registered coach (session_type + date with realized=true)
    const coachRegRows = getSheetData('coach_registrations');
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
    const sh = getSheetByName('coach_registrations');
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
function getCoachSessions_() {

  const sessionsRows = getSheetData('sessions');
  const weeklyScheduleRows = getSheetData('weekly_schedule');
  const coachRegistrationsRowsData = getSheetData('coach_registrations');
  const coachLoginRows = getSheetData('coach_login');

  const tz = Session.getScriptTimeZone();
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

  // --- Build courseActivePeriods map (once) ---
  // Sessions schema: [id, session_type, session_type_alias, start_date, end_date]
  const courseActivePeriods = {};
  sessionsRows.forEach(row => {
    const sessionType = String(row[1] || '').toUpperCase();
    const sessionTypeAlias = String(row[2] || '').toUpperCase();
    const startDate = row[3];
    const endDate = row[4];
    if (sessionType && startDate && endDate) {
      courseActivePeriods[sessionType] = {
        sessionTypeAlias: sessionTypeAlias,
        start: startDate instanceof Date ? startDate : new Date(startDate),
        end: endDate instanceof Date ? endDate : new Date(endDate)
      };
    }
  });

  // --- Pre-parse weekly schedule rows (once) ---
  // Schema: [id, session_type, weekday_available, start_time, end_time, location, active]
  const parsedSchedules = [];
  weeklyScheduleRows.forEach(row => {
    if (!getBooleanValue(row[6])) return; // skip inactive
    const weekdays = String(row[2] || '').split(',').map(w => Number(w.trim()));
    const weekdaySet = {};
    weekdays.forEach(w => { weekdaySet[w] = true; });
    parsedSchedules.push({
      id: String(row[0]),
      sessionType: String(row[1] || '').toUpperCase(),
      weekdaySet: weekdaySet,
      startTime: timeToStr(row[3], tz, 'HH:mm'),
      endTime: timeToStr(row[4], tz, 'HH:mm'),
      location: row[5] || ''
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

      var activePeriod = courseActivePeriods[sched.sessionType];
      if (activePeriod && (sessionDate < activePeriod.start || sessionDate > activePeriod.end)) {
        continue;
      }

      // O(1) coach lookup instead of O(n) scan
      var key = sched.sessionType + '|' + dateStr;
      var registeredCoaches = regByKey[key] || [];

      sessions.push({
        id: sched.id + '_' + dateStr,
        session_type: sched.sessionType,
        session_type_alias: activePeriod ? activePeriod.sessionTypeAlias : sched.sessionType,
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
      var sparringAlias = courseActivePeriods['FREE/SPARRING']
        ? courseActivePeriods['FREE/SPARRING'].sessionTypeAlias
        : 'FREE/SPARRING';
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
  const campsRows = getSheetData('camps');
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

    var campSchedulesRows = getSheetData('camp_schedules');
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
function removeCoachFromSession_(payload) {
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
    const sheet = getSheetByName('coach_registrations');
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

// usage: 
//  logToSheet(`removeCoachRegistration - alias: ${alias}`);
//  logToSheet(`holder: ` + JSON.stringify(holder));
function logToSheet(message) {
  const sheet = getSpreadsheet().getSheetByName("Logs");
  if (!sheet) return;
  const loggingEnabled = sheet.getRange("A1").getValue();
  if (String(loggingEnabled).trim() === "log_enabled") {
    sheet.appendRow([new Date(), message]);
  }
}

/**
 * Fetch trainee sessions for a 21-day window (7 days before current week's Monday through next 2 weeks).
 * Includes regular active sessions, realized free/sparring coach sessions, and camp session replacements.
 * Returns trainee-facing session objects sorted by date and start_time.
 * @returns {Array}
 */
function getTraineeSessions_() {
  const sessionsRows = getSheetData('sessions');
  const weeklyScheduleRows = getSheetData('weekly_schedule');
  const coachRegistrationsRows = getSheetData('coach_registrations');
  const campsRows = getSheetData('camps');
  const campSchedulesRows = getSheetData('camp_schedules');

  const tz = Session.getScriptTimeZone();

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

  // Sessions schema: [id, session_type, session_type_alias, start_date, end_date]
  const sessionMetaByType = {};
  sessionsRows.forEach(row => {
    const sessionType = String(row[1] || '').trim();
    if (!sessionType) return;
    const key = sessionType.toUpperCase();
    sessionMetaByType[key] = {
      sessionType: sessionType,
      sessionTypeAlias: String(row[2] || '').trim() || sessionType,
      start: row[3] instanceof Date ? row[3] : new Date(row[3]),
      end: row[4] instanceof Date ? row[4] : new Date(row[4]),
    };
  });

  // Weekly schedule schema: [id, session_type, weekdays_available, start_time, end_time, location, active]
  const parsedSchedules = [];
  weeklyScheduleRows.forEach(row => {
    if (!getBooleanValue(row[6])) return;
    const weekdaySet = {};
    String(row[2] || '')
      .split(',')
      .map(part => Number(part.trim()))
      .filter(val => Number.isFinite(val))
      .forEach(val => {
        weekdaySet[val] = true;
      });

    parsedSchedules.push({
      id: String(row[0] || ''),
      sessionType: String(row[1] || '').trim(),
      sessionTypeUpper: String(row[1] || '').trim().toUpperCase(),
      weekdaySet: weekdaySet,
      startTime: timeToStr(row[3], tz, 'HH:mm'),
      endTime: timeToStr(row[4], tz, 'HH:mm'),
      location: String(row[5] || ''),
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

      var activePeriod = sessionMetaByType[sched.sessionTypeUpper];
      if (activePeriod && (sessionDate < activePeriod.start || sessionDate > activePeriod.end)) {
        continue;
      }

      sessions.push({
        id: sched.id + '_' + dateStr,
        session_type: sched.sessionType,
        session_type_alias: activePeriod ? activePeriod.sessionTypeAlias : sched.sessionType,
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

    const sparringMeta = sessionMetaByType['FREE/SPARRING'];

    sessions.push({
      id: 'sparring_' + String(row[0] || '') + '_' + dateStr,
      session_type: 'free/sparring',
      session_type_alias: sparringMeta ? sparringMeta.sessionTypeAlias : 'free/sparring',
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
      session_type: sessionName,
      session_type_alias: sessionName,
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

  logToSheet('getTraineeSessions_() - returned ' + merged.length + ' sessions');
  return merged;
}