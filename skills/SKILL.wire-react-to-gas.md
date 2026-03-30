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
