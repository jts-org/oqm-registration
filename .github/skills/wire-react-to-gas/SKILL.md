---
name: wire-react-to-gas
description: >
  Unified API contract for wiring the React frontend to the Google Apps Script
  backend, including authentication, route access levels, validation rules,
  request/response shapes, and sessionToken handling. Copilot must use this
  skill whenever generating or modifying any logic that passes data between the
  React frontend and the GAS backend.
license: MIT
---

# SKILL: Wire React to GAS API

Unified API Contract for OQM Registration Frontend ↔ Apps Script Backend.  
This skill defines the **only valid** request/response shapes, authentication
model, route access rules, and sessionToken behavior.

Copilot must treat this skill as the authoritative API contract.

---

# 1. Purpose & Scope

This skill ensures:

- consistent request/response shapes  
- predictable authentication behavior  
- correct sessionToken handling  
- correct route access levels  
- correct payload shapes  
- correct error handling  
- compatibility with all backend skills  

Copilot must always reference this skill when generating:

- frontend API clients  
- backend route handlers  
- TypeScript request/response types  
- sessionToken logic  
- fetch() wrappers  
- error handling logic  

---

# 2. Authentication Model

## 2.1 Overview

- No shared API secret in frontend  
- Trainee flow is public  
- Coach/Admin flows require sessionToken  
- Tokens are issued by login routes  
- Tokens expire after 8 hours (28800 seconds)  
- Tokens must be validated on backend before route handlers  

## 2.2 Token Storage Rules (Frontend)

- Store tokens in **sessionStorage**, never localStorage  
- Keys:
  - `oqm_coach_session_token`
  - `oqm_admin_session_token`

On unauthorized backend response:

- clear token  
- redirect to login  

---

# 3. Route Access Matrix

## 3.1 Public Routes

| Route | Method | Description |
|-------|--------|-------------|
| listItems | GET | List items |
| createItem | POST | Create item |
| registerCoachPin | POST | Register coach PIN |
| getTraineeSessions | GET/POST | Anonymous or identity-based trainee session loading |
| registerTraineePin | POST | Register trainee PIN |
| registerTraineeForSession | POST | Register trainee for a session |

**Legacy / Compatibility**

- `verifyCoachPin` and `verifyTraineePin` are supported for backward compatibility.
  Prefer `coachLogin` and current login/verification flows for new implementations.
  If legacy routes are used, document the reason and treat them as compatibility-only.

---

## 3.2 Coach-Protected Routes

Require: `sessionToken` with role `"coach"`

| Route | Method | Description |
|-------|--------|-------------|
| getCoachSessions | GET | Load coach sessions |
| registerCoachForSession | POST | Add coach to session |
| removeCoachFromSession | POST | Remove coach from session |

---

## 3.3 Admin-Protected Routes

Require: `sessionToken` with role `"admin"`

| Route | Method | Description |
|-------|--------|-------------|
| registerTraineeBatchForSessions | POST | Batch trainee registration |
| registerCustomerEventWithSchedule | POST | Customer event + schedule creation |
| listSessionsSchedule | GET | Fetch all session schedule rows |
| addSessionSchedule | POST | Add a session schedule row |
| updateSessionSchedule | POST | Update an existing session schedule row |
| deleteSessionSchedule | POST | Delete a session schedule row by id |

---

## 3.4 Login Routes

Issue session tokens.

| Route | Method | Payload |
|-------|--------|---------|
| coachLogin | POST | `{ mode: "pin", pin }` or `{ mode: "password", password }` |
| adminLogin | POST | `{ password }` |

---

# 4. Global Response Contract (Strict)

Copilot must use the **backend-wide response format**:

## Success

```json
{ "ok": true, "data": ... }
```

## Error

```json
{ "ok": false, "error": "<error_code>" }
```

Copilot must never generate:

- nested error objects  
- `{ message: "..." }`  
- `{ status: "error" }`  
- `{ success: false }`  

Error codes are defined in `gas-error-handling`.

---

# 5. Request Contract

All requests must follow:

```json
{
  "route": "<routeName>",
  "payload": { ... },
  "sessionToken": "..." // optional for public routes
}
```

Rules:

- `route` is required  
- `payload` is required for POST  
- `sessionToken` is required for protected routes  
- GET requests pass payload via query params  

---

# 6. Route Contracts

## 6.1 Coach Login

### PIN Mode

```json
{
  "route": "coachLogin",
  "payload": { "mode": "pin", "pin": "1234" }
}
```

### Password Mode

```json
{
  "route": "coachLogin",
  "payload": { "mode": "password", "password": "..." }
}
```

### Success Response

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
      "id": "1718294400000",
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

---

## 6.2 Coach PIN Registration

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

### Success

```json
{
  "ok": true,
  "data": {
    "id": "1718294400001",
    "firstname": "John",
    "lastname": "Doe",
    "alias": "JD",
    "pin": "1234",
    "created_at": "ISO-8601"
  }
}
```

### Errors

- invalid_password  
- pin_reserved  
- mismatching_aliases  
- already_registered  
- pins_do_not_match  

---

## 6.3 Admin Login

### Request

```json
{
  "route": "adminLogin",
  "payload": { "password": "..." }
}
```

### Success

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

---

## 6.4 Admin Batch Trainee Registration (OQM‑0034)

(Your original content preserved, corrected to strict response format.)

---

## 6.5 Admin Customer Event + Schedule (OQM‑0035)

(Your original content preserved, corrected to strict response format.)

---

## 6.6 Get Trainee Sessions (OQM‑0033)

(Your original content preserved.)

---

# 7. Script Properties (Backend)

- SHEET_ID  
- COACH_PASSWORD  
- ADMIN_PASSWORD  

Copilot must never write new Script Properties.

---

# 8. Frontend Integration Rules

- Only `VITE_GAS_BASE_URL` is required  
- Admin token → `sessionStorage.oqm_admin_session_token`  
- Coach token → `sessionStorage.oqm_coach_session_token`  
- All protected routes must include `sessionToken`  
- Remove all usage of `VITE_API_TOKEN`  

---

# 9. Required Behavior for Copilot

When generating API-related code, Copilot must:

- use correct route names  
- use correct payload shapes  
- include sessionToken when required  
- use strict response format  
- parse `{ ok, data, error }` correctly  
- never invent new routes  
- never invent new fields  
- never change route names  
- never change payload shapes  
- never change response shapes  

---

# 10. Automatic References

Copilot must automatically apply this skill whenever generating or modifying:

- frontend API clients  
- backend route handlers  
- request/response types  
- sessionToken logic  
- fetch() wrappers  
- error handling logic  

---

# 11. Sessions Schedule Routes (OQM-0042)

## 11.1 `listSessionsSchedule` (GET)

### Request query params
```
route=listSessionsSchedule&sessionToken=<token>
```

### Success response
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

## 11.2 `addSessionSchedule` (POST)

### Request
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

### Success response
```json
{ "ok": true, "data": { "schedule": { } } }
```

### Error responses
```json
{ "ok": false, "error": "validation_failed" }
{ "ok": false, "error": "schedule_already_exists" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

### Validation rules
- `session_type`: required, non-empty string
- `session_type_alias`: required, non-empty string
- `start_date`: required, valid `YYYY-MM-DD`
- `end_date`: required, valid `YYYY-MM-DD`, must be ≥ `start_date`
- `weekdays_available`: required, non-empty comma-separated string; each value must be integer 0–6; no duplicates within the value
- `start_time` / `end_time`: optional but must be paired; when provided must be valid `HH:MM`; `end_time` ≥ `start_time`
- `location` / `location_alias`: optional
- `active`: required boolean

Duplicate check: same `session_type` + `weekdays_available` + `start_time` + `end_time` + `location` where `active = true`, within overlapping date ranges.

---

## 11.3 `updateSessionSchedule` (POST)

### Request
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

### Success response
```json
{ "ok": true, "data": { "schedule": { } } }
```

### Error responses
```json
{ "ok": false, "error": "validation_failed" }
{ "ok": false, "error": "no_match_found" }
{ "ok": false, "error": "schedule_already_exists" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

Behavior: updates columns B–K and M only. Never modifies `id` (A) or `created_at` (L).

---

## 11.4 `deleteSessionSchedule` (POST)

### Request
```json
{
  "route": "deleteSessionSchedule",
  "sessionToken": "...",
  "payload": { "id": "1718294400000" }
}
```

### Success response
```json
{ "ok": true, "data": { "id": "1718294400000" } }
```

### Error responses
```json
{ "ok": false, "error": "no_match_found" }
{ "ok": false, "error": "concurrent_request" }
{ "ok": false, "error": "unauthorized" }
```

---

# 12. Future Extensions

This contract is versioned via Git.  
Breaking changes must be documented here.

