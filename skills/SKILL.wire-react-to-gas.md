# SKILL: Wire React to GAS API

## Current Auth Model
- No shared API secret in frontend.
- Trainee flow is public (no PIN/password required to browse sessions or register).
- Coach/admin protected routes require a short-lived `sessionToken` issued by GAS login routes.

## Route Access Matrix
### Public routes
- `GET ?route=listItems`
- `POST { route: "createItem", payload }`
- `POST { route: "registerCoachPin", payload }`
- `POST { route: "verifyCoachPin", payload }` (legacy-compatible; `coachLogin` is preferred)
- `GET ?route=getTraineeSessions` for anonymous trainee session loading
- `POST { route: "getTraineeSessions", payload?: { first_name, last_name, age_group, underage_age? } }`
- `POST { route: "registerTraineePin", payload }`
- `POST { route: "verifyTraineePin", payload }`
- `POST { route: "registerTraineeForSession", payload }`

### Coach-protected routes
- `GET ?route=getCoachSessions&sessionToken=...`
- `POST { route: "registerCoachForSession", payload, sessionToken }`
- `POST { route: "removeCoachFromSession", payload, sessionToken }`

### Admin-protected routes
- `GET ?route=getSettings&sessionToken=...`
- `POST { route: "registerTraineeBatchForSessions", payload: { rows: [{ first_name, last_name, age_group, underage_age?, session_type, camp_session_id?, date, start_time?, end_time? }] }, sessionToken }`

### Login routes (issue session token)
- `POST { route: "coachLogin", payload: { mode: "pin", pin } }`
- `POST { route: "coachLogin", payload: { mode: "password", password } }`
- `POST { route: "adminLogin", payload: { password } }`

## Common Response Shape
- Success: `{ ok: true, data }`
- Failure: `{ ok: false, error }`

## Session Token Shape
```json
{
  "sessionToken": "string",
  "role": "coach|admin",
  "expiresInSeconds": 28800
}
```

## Coach Login Contract
### Request (PIN mode)
```json
{
  "route": "coachLogin",
  "payload": {
    "mode": "pin",
    "pin": "1234"
  }
}
```

### Request (password mode)
```json
{
  "route": "coachLogin",
  "payload": {
    "mode": "password",
    "password": "..."
  }
}
```

### Response (success)
```json
{
  "ok": true,
  "data": {
    "session": {
      "sessionToken": "...",
      "role": "coach",
      "expiresInSeconds": 28800
    },
    "coachData": {
      "id": "uuid",
      "firstname": "...",
      "lastname": "...",
      "alias": "...",
      "pin": "...",
      "created_at": "ISO-8601",
      "last_activity": "ISO-8601"
    }
  }
}
```

## Coach PIN Registration Contract
### Request
```json
{
  "route": "registerCoachPin",
  "payload": {
    "firstname": "John",
    "lastname": "Doe",
    "alias": "JD",
    "pin": "1234",
    "password": "coach-password"
  }
}
```

### Response (success)
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "firstname": "John",
    "lastname": "Doe",
    "alias": "JD",
    "pin": "1234",
    "created_at": "ISO-8601"
  }
}
```

### Response (errors)
- `invalid_password` when the coach password is missing or incorrect.
- `pin_reserved` when the PIN already exists in coach_login or trainee_login.
- `mismatching_aliases` when the same-name coach row has a different stored alias.
- `already_registered` when the same-name coach row already has the same PIN.
- `pins_do_not_match` when the same-name coach row already has a different PIN.

## Admin Login Contract
### Request
```json
{
  "route": "adminLogin",
  "payload": {
    "password": "..."
  }
}
```

## Admin Batch Trainee Registration Contract (OQM-0034)
### Request
```json
{
  "route": "registerTraineeBatchForSessions",
  "sessionToken": "...",
  "payload": {
    "rows": [
      {
        "first_name": "Jane",
        "last_name": "Doe",
        "age_group": "adult",
        "underage_age": "",
        "session_type": "advanced",
        "camp_session_id": "",
        "dates": ["2026-04-01", "2026-04-02"],
        "start_time": "18:00",
        "end_time": "19:00"
      }
    ]
  }
}
```

### Validation highlights
- Route is admin-protected and requires valid admin `sessionToken`.
- `rows` must be a non-empty array.
- Per-row required fields: `first_name`, `last_name`, `age_group`, `session_type`, `dates`.
- `dates` must be a non-empty array of date strings in YYYY-MM-DD format. Each date creates a separate registration entry.
- `age_group` must be `adult` or `underage`.
- `underage_age` is required when `age_group` is `underage`.
- For `free/sparring`, `start_time` and `end_time` are optional; if one is set then both are required (applies to all dates in the row).
- For non-`free/sparring` rows, both `start_time` and `end_time` are not used (no time tracking).
- For `camp` rows, `camp_session_id` is required.
- Duplicate rows are rejected when matching trainee/session/date/time identity already exists in `trainee_registrations` or is duplicated inside the same batch.
- `totalRows` reflects the original number of input rows, while `addedCount` reflects the number of actual registrations created (may be greater if rows have multiple dates).

### Response (success with summary)
```json
{
  "ok": true,
  "data": {
    "totalRows": 1,
    "addedCount": 2,
    "rejectedCount": 0,
    "results": [
      { "rowIndex": 0, "status": "added", "id": "uuid-1" }
    ]
  }
}
```

### Response (errors)
- `concurrent_request` when script lock cannot be acquired.
- `validation_failed` when payload shape is invalid (for example missing/non-array `rows` or empty `dates` array).

### Response (success)
```json
{
  "ok": true,
  "data": {
    "session": {
      "sessionToken": "...",
      "role": "admin",
      "expiresInSeconds": 28800
    }
  }
}
```

## Frontend Integration Notes
- Keep only `VITE_GAS_BASE_URL` in frontend env.
- Persist admin session token in `sessionStorage` key `oqm_admin_session_token`.
- Settings fetch requires admin session token.
- Coach page requests must pass coach `sessionToken`.
- Remove any new usage of `VITE_API_TOKEN` and shared token query/body parameters.

## Get Trainee Sessions Contract (OQM-0033)
### Request
```json
{
  "route": "getTraineeSessions",
  "payload": {
    "first_name": "Jane",
    "last_name": "Doe",
    "age_group": "adult"
  }
}
```

- `payload` is optional.
- Frontend should use `GET ?route=getTraineeSessions` when trainee identity is not yet known.
- When trainee identity is known, frontend should use POST with `payload` to receive trainee-specific registration flags.
- Identity matching uses `first_name + last_name + age_group`; for `underage`, `underage_age` must also match.

### Response (success)
```json
{
  "ok": true,
  "data": [
    {
      "id": "weekly-basic_2026-03-30",
      "session_type": "Basic",
      "session_type_alias": "Basic",
      "date": "2026-03-30",
      "start_time": "18:00",
      "end_time": "19:00",
      "location": "Main Hall",
      "coach_firstname": "",
      "coach_lastname": "",
      "camp_instructor_name": "",
      "is_free_sparring": false,
      "trainee_registered": true
    }
  ]
}
```

- `trainee_registered` is set to `true` only for sessions where a matching row exists in `trainee_registrations` for the same session/date/time in the 21-day window.

## Script Properties (Apps Script)
- `SHEET_ID`
- `COACH_PASSWORD`
- `ADMIN_PASSWORD`
