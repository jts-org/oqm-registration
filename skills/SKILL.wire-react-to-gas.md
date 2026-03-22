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
- `GET ?route=getTraineeSessions`
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

## Script Properties (Apps Script)
- `SHEET_ID`
- `COACH_PASSWORD`
- `ADMIN_PASSWORD`
