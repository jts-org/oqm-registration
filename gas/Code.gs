/**
 * Web API for Sheets
 * Routes:
 *  - GET  ?route=listItems
 *  - POST { route: "createItem", payload: { name, email } }
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const API_TOKEN = PropertiesService.getScriptProperties().getProperty('API_TOKEN');

function doGet(e) {
  try {
    authorize_(e);
    const route = (e.parameter.route || '').toString();
    if (route === 'listItems') {
      const data = listItems_();
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
    logToSheet(`doPost - body: ${body}`);
    const route = body.route;
    const payload = body.payload;
    if (route === 'createItem') {
      const created = createItem_(payload);
      return json_({ ok: true, data: created });
    }
    return json_({ ok: false, error: 'Unknown route' });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 400);
  }
}

function json_(obj, _status) {
  
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

function createItem_(payload) {
  if (!payload || !payload.name || !payload.email) throw new Error('Missing fields');
  const sh = getSheetByName('Data');
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  sh.appendRow([id, payload.name, payload.email, now]);
  return { id, name: payload.name, email: payload.email, created_at: now };
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