/**
 * Web API for Sheets
 * Routes:
 *  - GET  ?route=listItems       — list items from Data sheet
 *  - GET  ?route=getSettings     — list rows from settings sheet (QCM-0001)
 *  - GET  ?route=getCoachSessions — fetch 21-day session window (OQM-0007)
 *  - POST { route: "createItem", payload: { name, email } }
 *  - POST { route: "registerCoachPin", payload: { firstname, lastname, alias, pin } } — register a new coach PIN code (OQM-0003)
 *  - POST { route: "verifyCoachPin", payload: { pin } } — verify a coach PIN against coach_login sheet (OQM-0004)
 *  - POST { route: "registerCoachForSession", payload: { firstname, lastname, session_type, date, start_time?, end_time? } } — register coach for a session (OQM-0008)
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

  // Append row to coach_registrations
  const sh = getSheetByName('coach_registrations');
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  const startTime = payload.start_time || '';
  const endTime = payload.end_time || '';
  sh.appendRow([id, payload.firstname, payload.lastname, payload.session_type, payload.date, true, startTime, endTime, now, now]);

  return { id };
}

function getBooleanValue(value) {
    if (typeof value === 'boolean') return value;
    const trimmed = value.trim().toUpperCase();
    return trimmed !== 'FALSE' && trimmed !== '0' && trimmed !== 'NO' && trimmed !== 'N';  
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
  
  // Filter out rows where Realized (col 5) is not TRUE
  const coachRegistrationsRows = coachRegistrationsRowsData.filter(row => {
    if (row.length < 6) return true;
    const realized = row[5];
    return getBooleanValue(realized);
  });
  const aliasMap = getCoachAliasMap(coachLoginRows);
  
  const tz = Session.getScriptTimeZone();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Build map of sessionType -> { startDate, endDate } from sessions sheet
  // Sessions schema: [id	session_type	session_type_alias	start_date	end_date]
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
  
  // Always show sessions from previous week's Monday to 21 days forward (21 days)
  function getSessionWindowDates() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    var daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    var currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - daysToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    // Previous week's Monday
    var prevMonday = new Date(currentMonday);
    prevMonday.setDate(currentMonday.getDate() - 7);

    // Generate 21 days from prevMonday
    var dates = [];
    for (var i = 0; i < 21; i++) {
      var d = new Date(prevMonday);
      d.setDate(prevMonday.getDate() + i);
      dates.push(d);
    }
    logToSheet(`Session window dates: ` + dates.map(d => Utilities.formatDate(d, tz, 'yyyy-MM-dd')).join(', '));
    return dates;
  }

  let sessions = [];
  const sessionDates = getSessionWindowDates();

  sessionDates.forEach(sessionDate => {
    const weekday = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1; // 0=Sun, 1=Mon...6=Sat → 0=Mon, 6=Sun
    const dateStr = Utilities.formatDate(sessionDate, tz, 'yyyy-MM-dd');

    weeklyScheduleRows.forEach(row => {
      // Schema: [id	session_type	weekday_available	start_time	end_time	location	active]
      const isActive = getBooleanValue(row[6]);
      if (!isActive) return;

      // Parse weekday(s) - supports single value (1) or comma-separated (1,3)
      const weekdayValue = String(row[2] || '');
      const weekdays = weekdayValue.split(',').map(w => Number(w.trim()));
      if (!weekdays.includes(weekday)) return;

      const sessionType = String(row[1] || '').toUpperCase();

      // Check if course is active for this date (from sessions sheet)
      const activePeriod = courseActivePeriods[sessionType];
      if (activePeriod) {
        if (sessionDate < activePeriod.start || sessionDate > activePeriod.end) {
          logToSheet(`Skipping session_type: ${sessionType} on date: ${dateStr} - not active (active from ${Utilities.formatDate(activePeriod.start, tz, 'yyyy-MM-dd')} to ${Utilities.formatDate(activePeriod.end, tz, 'yyyy-MM-dd')})`);
          return; // Course not active on this date
        }
      }

      // Format time values - Google Sheets stores times as Date objects
      const rawStartTime = row[3];
      const rawEndTime = row[4];

      const startTimeStr = timeToStr(rawStartTime, tz, 'HH:mm');
      const endTimeStr = timeToStr(rawEndTime, tz, 'HH:mm');

      const location = row[5] || '';

      // Find coaches registered for this session + date
      const registeredCoaches = coachRegistrationsRows
        .filter(coach => {
          const coachSessionType = String(coach[3] || '').toUpperCase();
          const coachDateStr = timeToStr(coach[4], tz, 'yyyy-MM-dd');
          return coachSessionType === sessionType && coachDateStr === dateStr;
        })
        .map(coach => {
          const registrationId = String(coach[0]);
          const firstname = String(coach[1] || '');
          const lastname = String(coach[2] || '');
          const fullName = `${firstname} ${lastname}`;
          const alias = aliasMap[fullName] || fullName;
          return { registrationId, firstname, lastname, alias };
        });

      sessions.push({
        id: String(row[0]) + '_' + dateStr,
        session_type: sessionType,
        session_type_alias: courseActivePeriods[sessionType] ? courseActivePeriods[sessionType].sessionTypeAlias : sessionType,
        date: dateStr,
        weekday: weekday,
        start_time: startTimeStr,
        end_time: endTimeStr,
        location: location, 
        coach_firstname: registeredCoaches.length > 0 ? registeredCoaches[0].firstname : '',
        coach_lastname: registeredCoaches.length > 0 ? registeredCoaches[0].lastname : '',
        coach_alias: registeredCoaches.length > 0 ? registeredCoaches[0].alias : '',
        registration_id: registeredCoaches.length > 0 ? registeredCoaches[0].registrationId : '',
        is_free_sparring: false
      });
    });

    logToSheet(`Sessions for ${dateStr}: ` + JSON.stringify(sessions.filter(s => s.date === dateStr)));

    // --- ADDITION: free/sparring sessions from coachesSheet ---
    // Find free/sparring sessions with designated coach and realized not FALSE for this date
    const freeSparringSessions = coachRegistrationsRows
      .filter(coach => {
        const coachSessionType = String(coach[3] || '').toUpperCase();
        const coachDateStr = timeToStr(coach[4], tz, 'yyyy-MM-dd');
        // Realized check: already filtered above, but double check
        const realized = coach.length >= 6 ? getBooleanValue(coach[5]) : undefined;
        return coachSessionType === 'free/sparring' && coachDateStr === dateStr && realized;
      });

    if (freeSparringSessions.length > 0) {
      // Group by coach
      freeSparringSessions.forEach(coach => {
        const firstName = String(coach[1] || '').trim();
        const lastName = String(coach[2] || '').trim();
        const fullName = `${firstName} ${lastName}`;
        const alias = aliasMap[fullName] || fullName;
        let startTimeStr = '';
        let endTimeStr = '';
        if (coach.length >= 8) {
          startTimeStr = timeToStr(coach[6], tz, 'HH:mm');
          endTimeStr = timeToStr(coach[7], tz, 'HH:mm');
        }
        sessions.push({
          id: 'sparring_' + String(coach[0]) + '_' + dateStr,
          session_type: 'free/sparring',
          session_type_alias: courseActivePeriods['free/sparring'] ? courseActivePeriods['free/sparring'].sessionTypeAlias : 'free/sparring',
          date: dateStr,
          weekday: weekday,
          start_time: startTimeStr,
          end_time: endTimeStr,
          location: location,
          coach_firstname: firstName,
          coach_lastname: lastName,
          coach_alias: alias,
          registration_id: String(coach[0]),
          is_free_sparring: true
        });
      });
    }
  });

  logToSheet(`Sessions after processing weekly_schedule and coach registrations: ` + JSON.stringify(sessions));

  // --- Replace overlapping sessions with camp sessions ---
  // Build camp schedule: for each camp_schedule row, check if it falls in the window
  const campsRows = getSheetData('camps');
  var campMap = {}; // or use new Map() if you prefer
  const sessionStartDate = Utilities.formatDate(sessionDates[0], tz, 'yyyy-MM-dd');
  const sessionEndDate = Utilities.formatDate(sessionDates[sessionDates.length - 1], tz, 'yyyy-MM-dd');

  campsRows.forEach(function(campRow) {
    var campId = String(campRow[0]);
    logToSheet(`Processing camps row: ${campId}, details: ` + JSON.stringify(campRow));    
    var startDate = Utilities.formatDate(campRow[4], tz, 'yyyy-MM-dd');
    var endDate = Utilities.formatDate(campRow[5], tz, 'yyyy-MM-dd');
    // Check if camp falls within session window
    if (endDate < sessionStartDate || startDate > sessionEndDate) {
      logToSheet(`Skipping campId: ${campId} - outside of session window (start: ${startDate}, end: ${endDate})`);
      return; // Camp outside of session window
    }
    var camp = String(campRow[1]);
    var campAlias = String(campRow[2]);
    var campInstructor = String(campRow[3]);

    // Store all details by campId
    campMap[campId] = {
      campId,
      camp,
      campAlias,
      campInstructor,
      startDate,
      endDate
    };
  });

  logToSheet(`Camp map content: ` + JSON.stringify(campMap));

  if (Object.keys(campMap).length > 0) {
    const campSchedulesRows = getSheetData('camp_schedules');
    campSchedulesRows.forEach(function(r) {
      var campId = String(r[1]);
      var campDetails = campMap[campId];
      if (campDetails) {
        logToSheet(`Processing camp schedule for campId: ${campId}, details: ` + JSON.stringify(campDetails));
        var sessionDate = Utilities.formatDate(r[3], tz, 'yyyy-MM-dd');
        if (sessionDate < sessionStartDate || sessionDate > sessionEndDate) {
          logToSheet(`Skipping camp schedule for campId: ${campId}, details: ` + JSON.stringify(campDetails) + `, sessionDate: ${sessionDate}`);
          return; // Camp session outside of session window
        }
        var sessionName = String(r[2]);
        var startTime = timeToStr(r[4], tz, 'HH:mm');
        var endTime = timeToStr(r[5], tz, 'HH:mm');

        // Remove any regular session with same date from sessions
        sessions = sessions.filter(function(s) {
          return s.date !== sessionDate || s.is_free_sparring;
        });

        sessions.push({
          id: 'camp_' + String(r[0]) + '_' + sessionDate,
          session_type: campDetails.camp + (sessionName ? ` - ${sessionName}` : ''),
          session_type_alias: campDetails.campAlias + (sessionName ? ` - ${sessionName}` : ''),
          date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          location: '',
          coach_firstname: campDetails.campInstructor,
          coach_lastname: '',
          coach_alias: '',
          registration_id: '',
          is_free_sparring: false
        });
      }
    });
  }

  // Sort by date, then by start time
  sessions.sort(function(a, b) {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  logToSheet(`getCoachSessions_() - returned sessions: ` + JSON.stringify(sessions));
  
  return sessions;
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