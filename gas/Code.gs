/**
 * Web API for Sheets
 * Routes:
 *  - GET  ?route=listItems       — list items from Data sheet
 *  - GET  ?route=getSettings     — list rows from settings sheet (QCM-0001)
 *  - GET  ?route=getCoachSessions — fetch 21-day session window (OQM-0007)
 *  - POST { route: "createItem", payload: { name, email } }
 *  - POST { route: "registerCoachPin", payload: { firstname, lastname, alias, pin } } — register a new coach PIN code (OQM-0003)
 *  - POST { route: "verifyCoachPin", payload: { pin } } — verify a coach PIN against coach_login sheet (OQM-0004)
 *  - POST { route: "registerCoachForSession", payload: { firstname, lastname, session_type, date, start_time?, end_time? } } — register coach for a session (OQM-0008/OQM-0011); returns overlapping_session|date|start|end for time conflicts
 *  - POST { route: "removeCoachFromSession", payload: { firstname, lastname, session_type, date } } — remove coach from a session (OQM-0009)
 * Internal helpers (not exposed as routes):
 *  - updateCoachLastActivity_(coachId) — sets last_activity in coach_login (OQM-0011)
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const API_TOKEN = PropertiesService.getScriptProperties().getProperty('API_TOKEN');

function doGet(e) {
  try {
    logToSheet(`doGet - before auth SHEET_ID: ${SHEET_ID}, API_TOKEN: ${API_TOKEN}`);
    authorize_(e);
    logToSheet(`doGet - after auth`);
    const route = (e.parameter.route || '').toString();
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
    return json_({ ok: false, error: 'Unknown route' });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 400);
  }
}

function doPost(e) {
  try {
    logToSheet(`doPost - before auth SHEET_ID: ${SHEET_ID}, API_TOKEN: ${API_TOKEN}`);
    authorize_(e);
    logToSheet(`doPost - after auth`);
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    logToSheet(`doPost - body: ${JSON.stringify(body)}`);
    const route = body.route;
    const payload = body.payload;
    if (route === 'createItem') {
      const created = createItem_(payload);
      return json_({ ok: true, data: created });
    }
    if (route === 'registerCoachPin') {
      const result = registerCoachPin_(payload);
      if (result.pinReserved) {
        return json_({ ok: false, error: 'pin_reserved' });
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

function authorize_(e) {
  var token = (e.parameter && e.parameter.token) || null;
  if (!token && e.postData && e.postData.contents) {
    try { token = JSON.parse(e.postData.contents).token; } catch (_) {}
  }
  if (!API_TOKEN || token !== API_TOKEN) {
    throw new Error('Unauthorized');
  }
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

  // Check PIN is not already in use in coach_login (column E, index 4)
  const coachPins = getSheetData('coach_login')
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
  sh.appendRow([id, payload.firstname, payload.lastname, payload.alias || '', payload.pin, now, '']);
  return {
    id,
    firstname: payload.firstname,
    lastname: payload.lastname,
    alias: payload.alias || '',
    pin: payload.pin,
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
    sh.appendRow([id, payload.firstname, payload.lastname, payload.session_type, payload.date, true, startTime, endTime, now, now]);

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