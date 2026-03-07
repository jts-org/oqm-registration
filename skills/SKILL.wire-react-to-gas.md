# SKILL: Wire React to GAS API

## Contract
- GET  `?route=listItems&token=...` → list rows from `Data` sheet
- GET  `?route=getSettings&token=...` → list rows from `settings` sheet (QCM-0001)
- POST `{ route: "createItem", payload, token }` → append row
- POST `{ route: "registerCoachPin", payload, token }` → register coach PIN (OQM-0003)
- POST `{ route: "verifyCoachPin", payload, token }` → verify coach PIN, return coach data (OQM-0004)
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
 * Throws Error('pin_reserved') if PIN is taken.
 * Throws other Errors on network/service failures.
 */
export async function registerCoachPin(data: RegisterPinData): Promise<void> {
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


## Settings parameters used by the frontend
| parameter   | description                     | used by              |
|-------------|---------------------------------|----------------------|
| `coach_pwd` | Password for coach login        | CoachLoginDialog     |
| `admin_pwd` | Password for admin login        | AdminLoginDialog     |

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
