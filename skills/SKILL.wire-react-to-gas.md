# SKILL: Wire React to GAS API

## Contract
- GET  `?route=listItems&token=...` → list rows from `Data` sheet
- GET  `?route=getSettings&token=...` → list rows from `settings` sheet (QCM-0001)
- GET  `?route=getCoachSessions&token=...` → fetch 21-day session window (OQM-0007)
- GET  `?route=getTraineeSessions&token=...` → fetch trainee-facing 21-day session window (OQM-0015)
- POST `{ route: "createItem", payload, token }` → append row
- POST `{ route: "registerCoachPin", payload, token }` → register coach PIN (OQM-0003)
- POST `{ route: "verifyCoachPin", payload, token }` → verify coach PIN, return coach data (OQM-0004)
- POST `{ route: "registerCoachForSession", payload, token }` → register coach for a session (OQM-0008)
- POST `{ route: "removeCoachFromSession", payload, token }` → remove coach from a session (OQM-0009)
- POST `{ route: "registerTraineeForSession", payload, token }` → register trainee for a session (OQM-0014)
- Response JSON shape: `{ ok: true, data } | { ok: false, error }`

## Settings parameters used by the frontend
| parameter   | description                     | used by              |
|-------------|---------------------------------|----------------------|
| `coach_pwd` | Password for coach login        | CoachLoginDialog     |
| `admin_pwd` | Password for admin login        | AdminLoginDialog     |

## registerCoachPin (OQM-0003)

### Request
```json
{
  "route": "registerCoachPin",
  "payload": {
    "firstname": "string (required, 1–30 letters/spaces/hyphens)",
    "lastname":  "string (required, 1–30 letters/spaces/hyphens)",
    "alias":     "string (optional, 0–30 letters/spaces/hyphens)",
    "pin":       "string (required, 4–6 digits)"
  },
  "token": "string"
}
```

### Response (success)
```json
{ "ok": true, "data": { "id": "uuid", "firstname": "...", "lastname": "...", "alias": "...", "pin": "...", "created_at": "ISO-8601" } }
```

### Response (PIN already taken)
```json
{ "ok": false, "error": "pin_reserved" }
```

### Error cases
| Error           | Meaning                                         |
|-----------------|-------------------------------------------------|
| `pin_reserved`  | PIN exists in `coach_login` or `trainee_login`  |
| `Unauthorized`  | Invalid or missing API token                    |
| `Missing required fields: ...` | Payload validation failure       |

### Frontend API function
```ts
/** Shape of registration data collected by RegisterPinDialog. */
type RegisterPinData = {
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
};

/**
 * Register a new coach PIN code.
 * Returns the newly created CoachData on success (OQM-0010: used to pre-fill ConfirmCoachRegistrationDialog).
 * Throws Error('pin_reserved') if PIN is taken.
 * Throws other Errors on network/service failures.
 */
export async function registerCoachPin(data: RegisterPinData): Promise<CoachData> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerCoachPin', payload: data, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data as CoachData;
}
```

## verifyCoachPin (OQM-0004)

### Request
```json
{
  "route": "verifyCoachPin",
  "payload": { "pin": "string (required, 4–6 digits)" },
  "token": "string"
}
```

### Response (success)
```json
{ "ok": true, "data": { "id": "uuid", "firstname": "...", "lastname": "...", "alias": "...", "pin": "...", "created_at": "ISO-8601", "last_activity": "ISO-8601" } }
```

### Response (PIN not found)
```json
{ "ok": false, "error": "no_match_found" }
```

### Error cases
| Error            | Meaning                                      |
|------------------|----------------------------------------------|
| `no_match_found` | PIN not found in `coach_login` sheet         |
| `Unauthorized`   | Invalid or missing API token                 |
| `Missing required fields: pin` | Payload validation failure     |

### Frontend API function
```ts
/** Coach data returned from the backend on successful PIN verification. */
type CoachData = {
  id: string;
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
  created_at: string;
  last_activity: string;
};

/**
 * Verify a coach PIN code against the GAS backend.
 * Returns CoachData on success.
 * Throws Error('no_match_found') if PIN does not match any coach.
 * Throws other Errors on network/service failures.
 */
export async function verifyCoachPin(pin: string): Promise<CoachData> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'verifyCoachPin', payload: { pin }, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Verification failed');
  return json.data as CoachData;
}
```

## removeCoachFromSession (OQM-0009)

### Request
```json
{
  "route": "removeCoachFromSession",
  "payload": {
    "firstname":    "string (required)",
    "lastname":     "string (required)",
    "session_type": "string (required)",
    "date":         "string (required, YYYY-MM-DD)"
  },
  "token": "string"
}
```

### Response (success)
```json
{ "ok": true, "data": { "id": "uuid" } }
```

### Response (error)
```json
{ "ok": false, "error": "concurrent_operation | registration_not_found | session_available" }
```

### Error cases
| Error                    | Meaning                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| `concurrent_operation`   | Script lock could not be acquired — another operation is in progress                     |
| `registration_not_found` | No realized=true row in `coach_registrations` for the given coach/session/date           |
| `session_available`      | Matching row found but realized=false (session already has no coach)                     |
| `Unauthorized`           | Invalid or missing API token                                                             |

### Frontend API function
```ts
/** Payload for removing a coach from a specific session. */
type RemoveCoachFromSessionPayload = {
  firstname: string;
  lastname: string;
  session_type: string;
  /** Date in 'YYYY-MM-DD' format */
  date: string;
};

/**
 * Remove a coach from a specific session.
 * Returns the updated registration id on success.
 * Throws Error('concurrent_operation') if a concurrent script lock is held.
 * Throws Error('registration_not_found') if no realized registration matches.
 * Throws Error('session_available') if the matching registration is already realized=false.
 * Throws other Errors on network/service failures.
 */
export async function removeCoachFromSession(payload: RemoveCoachFromSessionPayload): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'removeCoachFromSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Removal failed');
  return json.data.id as string;
}
```

## Frontend fetch patterns
```ts
const base = import.meta.env.VITE_GAS_BASE_URL;
const token = import.meta.env.VITE_API_TOKEN;

/** Shape of a single row returned from the `settings` sheet. */

/** Fetch all settings rows (QCM-0001 — fetched on application startup). */
export async function getSettings(): Promise<Setting[]> {
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getSettings&token=${encodeURIComponent(token || '')}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.data;
}

export async function createItem(payload: {name: string; email: string}) {
  const res = await fetch(base!, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ route: "createItem", payload, token })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Unknown error");
  return data.data;
}
```

## getTraineeSessions (OQM-0015)

### Request
- Method: `GET`
- URL: `?route=getTraineeSessions&token=...`

### Response (success)
```json
{
  "ok": true,
  "data": [
    {
      "id": "ws_1_2026-03-17 | sparring_<registrationId>_<date> | camp_<campScheduleId>_<date>",
      "session_type": "advanced | fitness | basic | free/sparring | <camp session name>",
      "session_type_alias": "localized alias or camp session name",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "location": "string",
      "coach_firstname": "string (free/sparring only)",
      "coach_lastname": "string (free/sparring only)",
      "camp_instructor_name": "string (camp sessions only)",
      "is_free_sparring": true
    }
  ]
}
```

### Response (error)
```json
{ "ok": false, "error": "Unauthorized | Unknown route | ..." }
```

**Why `redirect: "follow"` and `text/plain`?** Apps Script web apps may `302` and stricter JSON preflights can fail; this pattern avoids common CORS issues.

## Contract-First Development
Always declare backend routes, payloads, and expected responses in this file before implementation. Update this file whenever contracts change.

## Documentation Updates
Whenever you change backend routes, payloads, or sheet schemas, update the relevant skills/ documentation and instructions. Reference the SKILL doc in code comments and PRs.

## Review Checklist
Before merging, use the review-checklist.instructions.md to ensure all requirements are met, including documentation updates, test coverage, and contract compliance.

## Error Handling Examples
- Example error response: `{ ok: false, error: "Invalid token" }`
- Always document possible error cases for each route.

## API Versioning
- When making breaking changes, increment the API version and document changes here.
- Use a `version` field in requests/responses if needed.

## Integration Testing
- Document integration test patterns for frontend-backend communication.
- Example: Use mock fetch in frontend tests to simulate GAS responses.

## Localization
API must accept a language parameter and return localized responses where applicable. Document how error messages and data should be localized for English and Finnish.


## Settings parameters used by the frontend
| parameter   | description                     | used by              |
|-------------|---------------------------------|----------------------|
| `coach_pwd` | Password for coach login        | CoachLoginDialog     |
| `admin_pwd` | Password for admin login        | AdminLoginDialog     |

## registerCoachForSession (OQM-0008)

### Request
```json
{
  "route": "registerCoachForSession",
  "payload": {
    "firstname": "string (required)",
    "lastname":  "string (required)",
    "session_type": "string (required)",
    "date":      "string (required, YYYY-MM-DD)",
    "start_time": "string (optional, HH:MM — only for free/sparring sessions)",
    "end_time":   "string (optional, HH:MM — only for free/sparring sessions)"
  },
  "token": "string"
}
```

### Response (success)
```json
{ "ok": true, "data": { "id": "uuid" } }
```

### Response (session already taken)
```json
{ "ok": false, "error": "already_taken" }
```

### Response (unknown coach)
```json
{ "ok": false, "error": "unknown_coach" }
```

### Error cases
| Error            | Meaning                                                         |
|------------------|-----------------------------------------------------------------|
| `already_taken`  | A coach is already registered for this session on this date     |
| `unknown_coach`  | Coach (firstname + lastname) not found in `coach_login` sheet   |
| `Unauthorized`   | Invalid or missing API token                                    |
| `Missing required fields: ...` | Payload validation failure                    |

### Frontend API function
```ts
/** Payload for registering a coach for a session. */
type RegisterCoachForSessionPayload = {
  firstname: string;
  lastname: string;
  session_type: string;
  date: string;
  start_time?: string;
  end_time?: string;
};

/**
 * Register a coach for a specific session.
 * Returns the newly created registration id on success.
 * Throws Error('already_taken') if the session already has a registered coach.
 * Throws Error('unknown_coach') if the coach is not found in coach_login.
 * Throws other Errors on network/service failures.
 */
export async function registerCoachForSession(payload: RegisterCoachForSessionPayload): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerCoachForSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data.id as string;
}
```

## Frontend fetch patterns
```ts
const base = import.meta.env.VITE_GAS_BASE_URL;
const token = import.meta.env.VITE_API_TOKEN;

/** Shape of a single row returned from the `settings` sheet. */
type Setting = {
  id: string;
  parameter: string;
  value: string;
  created_at: string;
  updated_at: string;
  purpose: string;
};

/** Fetch all settings rows (QCM-0001 — fetched on application startup). */
export async function getSettings(): Promise<Setting[]> {
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getSettings&token=${encodeURIComponent(token || '')}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.data;
}

export async function createItem(payload: {name: string; email: string}) {
  const res = await fetch(base!, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ route: "createItem", payload, token })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Unknown error");
  return data.data;
}
```

**Why `redirect: "follow"` and `text/plain`?** Apps Script web apps may `302` and stricter JSON preflights can fail; this pattern avoids common CORS issues.

## Contract-First Development
Always declare backend routes, payloads, and expected responses in this file before implementation. Update this file whenever contracts change.

## Documentation Updates
Whenever you change backend routes, payloads, or sheet schemas, update the relevant skills/ documentation and instructions. Reference the SKILL doc in code comments and PRs.

## Review Checklist
Before merging, use the review-checklist.instructions.md to ensure all requirements are met, including documentation updates, test coverage, and contract compliance.

## Error Handling Examples
- Example error response: `{ ok: false, error: "Invalid token" }`
- Always document possible error cases for each route.

## API Versioning
- When making breaking changes, increment the API version and document changes here.
- Use a `version` field in requests/responses if needed.

## Integration Testing
- Document integration test patterns for frontend-backend communication.
- Example: Use mock fetch in frontend tests to simulate GAS responses.

## Localization
API must accept a language parameter and return localized responses where applicable. Document how error messages and data should be localized for English and Finnish.

/** Fetch all settings rows (QCM-0001 — fetched on application startup). */
export async function getSettings(): Promise<Setting[]> {
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getSettings&token=${encodeURIComponent(token || '')}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.data;
}

export async function createItem(payload: {name: string; email: string}) {
  const res = await fetch(base!, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ route: "createItem", payload, token })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Unknown error");
  return data.data;
}
```

**Why `redirect: "follow"` and `text/plain`?** Apps Script web apps may `302` and stricter JSON preflights can fail; this pattern avoids common CORS issues.

## Contract-First Development
Always declare backend routes, payloads, and expected responses in this file before implementation. Update this file whenever contracts change.

## Documentation Updates
Whenever you change backend routes, payloads, or sheet schemas, update the relevant skills/ documentation and instructions. Reference the SKILL doc in code comments and PRs.

## Review Checklist
Before merging, use the review-checklist.instructions.md to ensure all requirements are met, including documentation updates, test coverage, and contract compliance.

## Error Handling Examples
- Example error response: `{ ok: false, error: "Invalid token" }`
- Always document possible error cases for each route.

## API Versioning
- When making breaking changes, increment the API version and document changes here.
- Use a `version` field in requests/responses if needed.

## Integration Testing
- Document integration test patterns for frontend-backend communication.
- Example: Use mock fetch in frontend tests to simulate GAS responses.

## Localization
API must accept a language parameter and return localized responses where applicable. Document how error messages and data should be localized for English and Finnish.

## getCoachSessions (OQM-0007)

### Request
```
GET ?route=getCoachSessions&token=<token>
```

### Response (success)
Returns an array of `SessionItem` objects sorted by date and start_time, covering a 21-day window (7 days before the current week's Monday through the following 2 weeks).

```json
{
  "ok": true,
  "data": [
    {
      "id": "string (schedule_id_date or camp_id_date)",
      "session_type": "string (English name)",
      "session_type_alias": "string (localized name, e.g. Finnish)",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "location": "string",
      "coach_firstname": "string (empty if no coach assigned)",
      "coach_lastname": "string (empty if no coach assigned)",
      "coach_alias": "string (from coach_login, empty if none)",
      "registration_id": "string (coach_registrations id, empty if none)",
      "is_free_sparring": false
    }
  ]
}
```

### Error cases
| Error          | Meaning                              |
|----------------|--------------------------------------|
| `Unauthorized` | Invalid or missing API token         |
| `Sheet not found: sessions` | Required sheet missing  |

## registerTraineeForSession (OQM-0014)

### Request
```json
{
  "route": "registerTraineeForSession",
  "payload": {
    "first_name":       "string (required)",
    "last_name":        "string (required)",
    "age_group":        "'adult' | 'underage' (required)",
    "underage_age":     "number (required when age_group is 'underage')",
    "session_type":     "string (required)",
    "camp_session_id":  "string (optional — id from camp_schedules sheet)",
    "date":             "string (required, YYYY-MM-DD)",
    "start_time":       "string (required, HH:MM)",
    "end_time":         "string (required, HH:MM)"
  },
  "token": "string"
}
```

### Response (success)
```json
{ "ok": true, "data": { "id": "uuid" } }
```

### Response (error)
```json
{ "ok": false, "error": "validation_failed_age | validation_failed | concurrent_request | already_registered" }
```

### Error cases
| Error                   | Meaning                                                                     |
|-------------------------|-----------------------------------------------------------------------------|
| `validation_failed_age` | `age_group` is 'underage' but `underage_age` is missing                     |
| `validation_failed`     | Required fields are missing or invalid                                      |
| `concurrent_request`    | Script lock could not be acquired — another operation is in progress        |
| `already_registered`    | A matching registration already exists for the same trainee and date        |
| `Unauthorized`          | Invalid or missing API token                                                |

### Frontend API function
```ts
/**
 * Payload for registering a trainee for a specific session (OQM-0014).
 * @see skills/SKILL.wire-react-to-gas.md
 */
type RegisterTraineeForSessionPayload = {
  first_name: string;
  last_name: string;
  /** 'adult' or 'underage' */
  age_group: 'adult' | 'underage';
  /** Required when age_group is 'underage'. */
  underage_age?: number;
  session_type: string;
  /** ID from camp_schedules sheet; omit for non-camp sessions. */
  camp_session_id?: string;
  /** Date in 'YYYY-MM-DD' format */
  date: string;
  /** Start time in 'HH:MM' format */
  start_time: string;
  /** End time in 'HH:MM' format */
  end_time: string;
};

/**
 * Register a trainee for a specific session.
 * POST { route: "registerTraineeForSession", payload: RegisterTraineeForSessionPayload, token }
 * Returns the new row id on success.
 * Throws Error('already_registered') if the trainee is already registered for the same session and date.
 * Throws Error('concurrent_request') if a concurrent script lock is held.
 * Throws Error('validation_failed') if required fields are missing or invalid.
 * Throws Error('validation_failed_age') if age_group is 'underage' but underage_age is missing.
 * Throws other Errors on network/service failures.
 */
export async function registerTraineeForSession(
  payload: RegisterTraineeForSessionPayload
): Promise<string> {
  const base = import.meta.env.VITE_GAS_BASE_URL as string;
  const token = import.meta.env.VITE_API_TOKEN as string;
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const res = await fetch(base, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'registerTraineeForSession', payload, token }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Registration failed');
  return json.data.id as string;
}
```
