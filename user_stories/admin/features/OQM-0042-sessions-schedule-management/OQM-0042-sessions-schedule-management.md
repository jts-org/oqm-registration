**Title:**
OQM-0042 Sessions Schedule Management

---

## Summary

Administrators need a dedicated Admin flow for viewing, creating, editing, and
deleting training session schedule master data in one place. This feature adds a
new `Sessions Schedules` section inside the Admin page backed by four new
admin-protected GAS routes operating on the `sessions_schedule` sheet.

The new `sessions_schedule` sheet consolidates `sessions` and `weekly_schedule`
into a single flat record. Future issues will migrate participation views and
registration flows to this sheet; this ticket covers only admin CRUD management
of `sessions_schedule`. No changes to existing sheets, routes, or flows are in
scope.

---

## User Story

_As an administrator, I want to manage session schedule master data inside the
Admin Dashboard so that I can view, add, edit, and delete training sessions and
their schedules in one place._

---

## New Sheet Schema

Sheet: `sessions_schedule`

| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | session_type       | string   |
| C      | session_type_alias | string   |
| D      | start_date         | ISO-8601 |
| E      | end_date           | ISO-8601 |
| F      | weekdays_available | number   |
| G      | start_time         | time     |
| H      | end_time           | time     |
| I      | location           | string   |
| J      | location_alias     | string   |
| K      | active             | boolean  |
| L      | created_at         | ISO-8601 |
| M      | updated_at         | ISO-8601 |

**Column notes:**
- B: English session type name
- C: Localized (Finnish) session type name (alias)
- D/E: Active date range, `YYYY-MM-DD`
- F: Mon=0 … Sun=6, comma-separated for multiple days (e.g., `"0,2,4"`)
- G/H: Time values in `HH:MM` format
- I: Location in English
- J: Location alias in Finnish
- K: `true` if this schedule is currently active
- L: server-set at creation, never updated
- M: server-set at creation and on every update

---

## Scope

### Backend (GAS — `gas/Code.gs`)

Add four admin-protected route handlers:

#### `listSessionsSchedule` (GET)
- Reads all rows from `sessions_schedule` (skip header row)
- Maps each row to a `SessionScheduleRecord` object using stable column indexes
- No lock required (read-only)
- Returns `{ ok: true, data: { schedules: SessionScheduleRecord[] } }`

#### `addSessionSchedule` (POST)
- Acquires script lock (`tryLock(5000)`, return `concurrent_request` on failure)
- Validates payload (see Validation Rules)
- Checks for duplicate: same `session_type` + `weekdays_available` + `start_time` + `end_time` + `location` + `active = true` within overlapping date ranges
- Generates `id = String(Date.now())`
- Sets `created_at` and `updated_at` to `new Date().toISOString()`
- Sets `active = true` by default if not provided
- Appends full row in exact column order A–M
- Returns `{ ok: true, data: { schedule: SessionScheduleRecord } }`

#### `updateSessionSchedule` (POST)
- Acquires script lock
- Validates `id` is present and row exists
- Validates all updatable fields (see Validation Rules)
- Checks for duplicate (same criteria as add, excluding the row being updated)
- Updates only columns B–K and M (`updated_at = new Date().toISOString()`)
- Never modifies `id` (A) or `created_at` (L)
- Returns `{ ok: true, data: { schedule: SessionScheduleRecord } }`

#### `deleteSessionSchedule` (POST)
- Acquires script lock
- Validates `id` is present
- Finds row by `id` (column A)
- Returns `no_match_found` if not found
- Deletes row using `sheet.deleteRow(rowIndex)`
- Returns `{ ok: true, data: { id: string } }`

**`SessionScheduleRecord` object shape:**

```json
{
  "id": "1718294400000",
  "session_type": "Advanced",
  "session_type_alias": "Edistynyt",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "weekdays_available": "0,2,4",
  "start_time": "18:00",
  "end_time": "19:30",
  "location": "Dojo A",
  "location_alias": "Sali A",
  "active": true,
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

Note: `weekdays_available` is stored and returned as a comma-separated string
(e.g., `"0,2,4"`), not an array, to match the raw sheet value.

**Validation rules (backend):**

- `session_type`: required, non-empty string
- `session_type_alias`: required, non-empty string
- `start_date`: required, valid `YYYY-MM-DD`
- `end_date`: required, valid `YYYY-MM-DD`, must be ≥ `start_date`
- `weekdays_available`: required, non-empty string; each comma-separated value
  must be an integer in range 0–6; no duplicates within the value
- `start_time`: not required, when provided must be valid `HH:MM`
- `end_time`: not required, when provided must be valid `HH:MM`, must be ≥ `start_time`
- `location`: not required
- `location_alias`: not required
- `active`: required boolean (never a string)

Return `validation_failed` for any validation failure.  
Return `schedule_already_exists` for duplicate detection.  
(`schedule_already_exists` must be added to `gas-error-handling` SKILL before
implementation.)

**Locking pattern:**
All write routes must follow the pattern defined in
`.github/skills/gas-locking-and-concurrency/SKILL.md` exactly.

---

### Frontend (React — `web/src/features/admin/`)

#### New entry point in Admin Dashboard

- Add a `Sessions Schedules` dashboard card with an `Open` action that routes
  to the in-page Sessions Schedules section.
- Add a drawer navigation item for `Sessions Schedules`.

#### New panel component: `AdminSessionsSchedulePanel`

File: `web/src/features/admin/components/AdminSessionsSchedulePanel.tsx`

**List view (default state):**
- Fetches all schedules on mount via `listSessionsSchedule`
- Shows a loading indicator while fetching
- Displays rows in a MUI `DataGrid` or MUI list with columns:
  - Session Type (`session_type`)
  - Alias (`session_type_alias`)
  - Start Date
  - End Date
  - Days (`weekdays_available` rendered as abbreviated day names, e.g. "Mon, Wed, Fri")
  - Start Time / End Time
  - Location
  - Location alias (`location_alias`)
  - Active (chip or icon)
  - Actions: Edit | Delete
- `+ Add Schedule` button above the list

**Add / Edit form (dialog or inline section):**
Opens when the user clicks `Add` or `Edit`.

Form fields (all required unless noted):
- Session Type (`TextField`)
- Session Type Alias (`TextField`)
- Start Date (`DatePicker`)
- End Date (`DatePicker`)
- Days of Week (`ToggleButtonGroup` with Mon–Sun, multi-select)
- Start Time (`TimePicker` or `TimeField`)
- End Time (`TimePicker` or `TimeField`)
- Location (`TextField`)
. Location alias (`TextField`)
- Active (`Switch` or `Checkbox`, default `true` on add)

**Frontend validation (block submit if any fail):**
- All fields required except End Time and Start Time
- End Date ≥ Start Date
- At least one weekday selected
- When provided End Time ≥ Start Time
    - both values must be present or empty

**Delete action:**
- Shows a confirmation dialog before calling `deleteSessionSchedule`
- Removes row from local state on success

**Feedback:**
- Localized success/error snackbar after add, update, and delete

---

### New TypeScript types

Add to `web/src/features/admin/types.ts`:

```ts
/** One row from the sessions_schedule sheet. */
export interface SessionScheduleRecord {
  id: string;
  session_type: string;
  session_type_alias: string;
  start_date: string;
  end_date: string;
  weekdays_available: string;
  start_time: string;
  end_time: string;
  location: string;
  location_alias: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload for addSessionSchedule and updateSessionSchedule. */
export interface SessionSchedulePayload {
  id?: string; // required for update, omitted for add
  session_type: string;
  session_type_alias: string;
  start_date: string;
  end_date: string;
  weekdays_available: string;
  start_time: string;
  end_time: string;
  location: string;
  location_alias: string;
  active: boolean;
}

/** Response shape for listSessionsSchedule. */
export interface ListSessionsScheduleResponse {
  schedules: SessionScheduleRecord[];
}
```

---

### New API functions

Add to `web/src/features/admin/api/admin.api.ts`:

- `listSessionsSchedule(sessionToken): Promise<ListSessionsScheduleResponse>`
- `addSessionSchedule(sessionToken, payload: SessionSchedulePayload): Promise<{ schedule: SessionScheduleRecord }>`
- `updateSessionSchedule(sessionToken, payload: SessionSchedulePayload): Promise<{ schedule: SessionScheduleRecord }>`
- `deleteSessionSchedule(sessionToken, id: string): Promise<{ id: string }>`

All functions follow the same pattern as existing functions in `admin.api.ts`:
`VITE_GAS_BASE_URL`, `Content-Type: text/plain;charset=utf-8`, `redirect: 'follow'`,
throw `new Error(json.error)` on `!json.ok`.

---

### Export updates

`web/src/features/admin/index.ts`:
- Export `AdminSessionsSchedulePanel`
- Export new types: `SessionScheduleRecord`, `SessionSchedulePayload`,
  `ListSessionsScheduleResponse`
- Export new API functions

---

### Localization

Add keys to both `web/src/locales/en.json` and `web/src/locales/fi.json`.
Finnish strings must use unicode escapes (`ä` → `\u00e4`, `ö` → `\u00f6`).

Minimum required keys (English examples):

```json
"adminSessionsSchedule.title": "Sessions Schedules",
"adminSessionsSchedule.dashboardCardTitle": "Sessions Schedules",
"adminSessionsSchedule.dashboardCardDescription": "View and manage training session schedule master data.",
"adminSessionsSchedule.addSchedule": "Add Schedule",
"adminSessionsSchedule.editSchedule": "Edit Schedule",
"adminSessionsSchedule.deleteSchedule": "Delete Schedule",
"adminSessionsSchedule.confirmDeleteTitle": "Confirm Delete",
"adminSessionsSchedule.confirmDeleteMessage": "Are you sure you want to delete this schedule?",
"adminSessionsSchedule.sessionType": "Session Type",
"adminSessionsSchedule.sessionTypeAlias": "Session Type Alias",
"adminSessionsSchedule.startDate": "Start Date",
"adminSessionsSchedule.endDate": "End Date",
"adminSessionsSchedule.weekdaysAvailable": "Days of Week",
"adminSessionsSchedule.startTime": "Start Time",
"adminSessionsSchedule.endTime": "End Time",
"adminSessionsSchedule.location": "Location",
"adminSessionsSchedule.active": "Active",
"adminSessionsSchedule.saveSuccess": "Schedule saved successfully.",
"adminSessionsSchedule.deleteSuccess": "Schedule deleted.",
"adminSessionsSchedule.errorScheduleAlreadyExists": "A schedule with the same type, days, and times already exists.",
"adminSessionsSchedule.errorNoMatchFound": "Schedule not found.",
"adminSessionsSchedule.errorValidationFailed": "Validation failed. Please check your input.",
"adminSessionsSchedule.loadError": "Failed to load schedules. Please try again.",
"adminSessionsSchedule.mon": "Mon",
"adminSessionsSchedule.tue": "Tue",
"adminSessionsSchedule.wed": "Wed",
"adminSessionsSchedule.thu": "Thu",
"adminSessionsSchedule.fri": "Fri",
"adminSessionsSchedule.sat": "Sat",
"adminSessionsSchedule.sun": "Sun"
```

---

### API Contract and Documentation Updates

- Add the four new routes to the Admin-Protected Routes table in
  `.github/skills/wire-react-to-gas/SKILL.md`:

| Route                  | Method | Description                              |
|------------------------|--------|------------------------------------------|
| listSessionsSchedule   | GET    | Fetch all session schedule rows          |
| addSessionSchedule     | POST   | Add a session schedule row               |
| updateSessionSchedule  | POST   | Update an existing session schedule row  |
| deleteSessionSchedule  | POST   | Delete a session schedule row by id      |

- Add full request/response contract sections for each route in the same file.
- Add `sessions_schedule` sheet definition to
  `.github/skills/sheet-schema/SKILL.md`.
- Add `schedule_already_exists` to the valid error codes list in
  `.github/skills/gas-error-handling/SKILL.md`.
- Add all four route names to `.github/skills/gas-route-registry/SKILL.md`.

---

### Tests

**Backend (`gas/__tests__/`):**
- `listSessionsSchedule.test.js` — returns all rows mapped correctly
- `addSessionSchedule.test.js` — validates required fields, date range, time
  range, weekday values, duplicate detection, and successful insert
- `updateSessionSchedule.test.js` — validates id lookup, field validation,
  duplicate detection (excluding current row), `updated_at` mutation, and
  successful update
- `deleteSessionSchedule.test.js` — validates id lookup, `no_match_found` on
  missing id, and successful delete

**Frontend (`web/src/features/admin/components/__tests__/`):**
- `AdminSessionsSchedulePanel.test.tsx` — covers: list loading, empty state,
  row rendering, add form open/submit, edit form open/submit, delete
  confirmation/confirm, success and error feedback, frontend validation blocking
  submit

---

## API Request / Response Contracts

### `listSessionsSchedule` (GET)

**Request query params:**
```
route=listSessionsSchedule&sessionToken=<token>
```

**Success response:**
```json
{
  "ok": true,
  "data": {
    "schedules": [
      {
        "id": "1718294400000",
        "session_type": "Advanced",
        "session_type_alias": "Edistynyt",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "weekdays_available": "0,2,4",
        "start_time": "18:00",
        "end_time": "19:30",
        "location": "Dojo A",
        "location_alias": "Sali A",
        "active": true,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### `addSessionSchedule` (POST)

**Request:**
```json
{
  "route": "addSessionSchedule",
  "sessionToken": "...",
  "payload": {
    "session_type": "Advanced",
    "session_type_alias": "Edistynyt",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "weekdays_available": "0,2,4",
    "start_time": "18:00",
    "end_time": "19:30",
    "location": "Dojo A",
    "location_alias": "Sali A",
    "active": true
  }
}
```

**Success response:**
```json
{
  "ok": true,
  "data": {
    "schedule": { }
  }
}
```

**Error responses:**
```json
{ "ok": false, "error": "validation_failed" }
{ "ok": false, "error": "schedule_already_exists" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

---

### `updateSessionSchedule` (POST)

**Request:**
```json
{
  "route": "updateSessionSchedule",
  "sessionToken": "...",
  "payload": {
    "id": "1718294400000",
    "session_type": "Advanced",
    "session_type_alias": "Edistynyt",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "weekdays_available": "0,2,4",
    "start_time": "18:00",
    "end_time": "20:00",
    "location": "Dojo B",
    "location_alias": "Sali B",
    "active": true
  }
}
```

**Success response:**
```json
{
  "ok": true,
  "data": {
    "schedule": { }
  }
}
```

**Error responses:**
```json
{ "ok": false, "error": "validation_failed" }
{ "ok": false, "error": "no_match_found" }
{ "ok": false, "error": "schedule_already_exists" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

---

### `deleteSessionSchedule` (POST)

**Request:**
```json
{
  "route": "deleteSessionSchedule",
  "sessionToken": "...",
  "payload": { "id": "1718294400000" }
}
```

**Success response:**
```json
{
  "ok": true,
  "data": { "id": "1718294400000" }
}
```

**Error responses:**
```json
{ "ok": false, "error": "no_match_found" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

---

## Preconditions

- Administrator is authenticated with a valid `oqm_admin_session_token`.
- The `sessions_schedule` sheet exists and follows the schema above.
- Existing Admin page shell, drawer navigation, and localization setup are in place.

---

## Main Flow (Add schedule)

1. Admin opens Admin page and navigates to `Sessions Schedules`.
2. Existing schedules are loaded and displayed in a list/table.
3. Admin clicks `+ Add Schedule`.
4. Admin fills in all required fields in the Add form.
5. Frontend validates and enables Submit.
6. Admin clicks Submit.
7. Frontend calls `addSessionSchedule` with payload and sessionToken.
8. GAS acquires lock → validates → checks duplicates → writes row → releases lock.
9. Frontend appends new row to local list and shows success feedback.

## Main Flow (Edit schedule)

1. Admin clicks `Edit` on a schedule row.
2. Edit form opens pre-populated with existing values.
3. Admin modifies fields and clicks Save.
4. Frontend calls `updateSessionSchedule`.
5. GAS acquires lock → validates → checks duplicates (excluding current row) →
   updates row → releases lock.
6. Frontend replaces updated row in local list and shows success feedback.

## Main Flow (Delete schedule)

1. Admin clicks `Delete` on a schedule row.
2. Confirmation dialog appears.
3. Admin confirms.
4. Frontend calls `deleteSessionSchedule`.
5. GAS acquires lock → finds row → deletes it → releases lock.
6. Frontend removes row from local list and shows success feedback.

---

## Alternative Flows

1. **Validation failure (frontend):** Submit is disabled; inline error shown next
   to the failing field.
2. **Validation failure (backend):** Error snackbar with localized
   `validation_failed` message.
3. **Duplicate detected:** Error snackbar with
   `adminSessionsSchedule.errorScheduleAlreadyExists`.
4. **Row not found on update/delete:** Error snackbar with
   `adminSessionsSchedule.errorNoMatchFound`; list is refreshed.
5. **Concurrent request:** Error snackbar; user may retry.
6. **Unauthorized / expired token:** Token cleared from sessionStorage; user
   redirected to login.

---

## Out of Scope

- Migrating existing `sessions` or `weekly_schedule` data to `sessions_schedule`.
- Changing participation-view or registration flows to use `sessions_schedule`.
- Bulk import of schedule rows.
- Exporting schedule data.

---

## Acceptance Criteria

- [ ] `sessions_schedule` sheet schema is added to `sheet-schema` SKILL.
- [ ] `schedule_already_exists` error code is added to `gas-error-handling` SKILL.
- [ ] All four routes are added to `wire-react-to-gas` SKILL and `gas-route-registry` SKILL.
- [ ] `listSessionsSchedule` returns all rows mapped to `SessionScheduleRecord`.
- [ ] `addSessionSchedule` validates, checks duplicates, generates id/timestamps,
      and writes the full row.
- [ ] `updateSessionSchedule` validates, checks duplicates (excluding self),
      updates B–J and L only, never modifies A or K.
- [ ] `deleteSessionSchedule` finds row by id and deletes it.
- [ ] All write routes use `LockService.getScriptLock()` / `tryLock(5000)`.
- [ ] Admin Dashboard has a `Sessions Schedules` card and drawer item.
- [ ] `AdminSessionsSchedulePanel` loads and displays all schedules on mount.
- [ ] Add form opens, validates, submits, and appends new row on success.
- [ ] Edit form opens pre-populated, validates, submits, and replaces row on success.
- [ ] Delete shows confirmation dialog, removes row on confirm.
- [ ] All new UI text uses translation keys; both `en.json` and `fi.json` updated.
- [ ] Backend tests cover validation, duplicates, and response shape for all 4 routes.
- [ ] Frontend tests cover list, add, edit, delete, validation, and feedback.

---

## Relevant Skills

- API Contract: `.github/skills/wire-react-to-gas/SKILL.md`
- Sheet Schema: `.github/skills/sheet-schema/SKILL.md`
- GAS Architecture: `.github/skills/gas-backend-architecture/SKILL.md`
- GAS Sheet Operations: `.github/skills/gas-sheet-operations/SKILL.md`
- GAS Validation Rules: `.github/skills/gas-validation-rules/SKILL.md`
- GAS Locking & Concurrency: `.github/skills/gas-locking-and-concurrency/SKILL.md`
- GAS Error Handling: `.github/skills/gas-error-handling/SKILL.md`
- GAS Date & Time: `.github/skills/gas-date-and-time/SKILL.md`
- Frontend Architecture: `.github/skills/frontend-architecture/SKILL.md`
- Frontend UX & Accessibility: `.github/skills/frontend-ux-and-accessibility/SKILL.md`
- Frontend Responsive Design: `.github/skills/frontend-responsive-design/SKILL.md`
- Frontend i18n: `.github/skills/frontend-i18n/SKILL.md`
- Frontend Performance: `.github/skills/frontend-performance/SKILL.md`
- Frontend API Client: `.github/skills/frontend-api-client/SKILL.md`
