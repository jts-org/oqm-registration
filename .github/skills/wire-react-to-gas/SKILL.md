```markdown
---
name: wire-react-to-gas
description: Unified API contract for wiring the React frontend to the GAS backend: authentication, route access levels, validation rules, request/response shapes, and sessionToken handling. Copilot must use this skill whenever generating or modifying logic passing data between React and GAS.
license: MIT
---

# SKILL: Wire React to GAS API

Authoritative API contract for OQM Registration Frontend ↔ Apps Script Backend.  
Defines the **only valid** request/response shapes, authentication model, route access rules, and sessionToken behavior.

Copilot must always reference this skill for any frontend↔backend logic.

---

# 1. Purpose & Scope

Ensures consistent request/response shapes, predictable authentication, correct sessionToken handling,
route access correctness, payload stability, and cross-skill compatibility.

Apply this skill for frontend API clients, backend route handlers, request/response types, fetch wrappers,
sessionToken logic, and API error handling.

---

# 2. Authentication Model

## 2.1 Overview

- No shared API secret in frontend  
- Trainee flow: public  
- Coach/Admin flows: require sessionToken  
- Tokens issued by login routes  
- Tokens expire after 8 hours (28800s)  
- Backend must validate tokens before handlers

## 2.2 Token Storage (Frontend)

- Store in **sessionStorage**, never localStorage  
- Keys:
  - `oqm_coach_session_token`
  - `oqm_admin_session_token`

On unauthorized response:
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
| getTraineeSessions | GET/POST | Anonymous or identity-based session loading |
| registerTraineePin | POST | Register trainee PIN |
| registerTraineeForSession | POST | Register trainee for a session |
| sendFeedback | POST | Send feedback or a bug report; no sessionToken required |

**Legacy**: `verifyCoachPin`, `verifyTraineePin` supported for compatibility only. Prefer modern login flows.

---

## 3.2 Coach-Protected Routes

Require: `sessionToken` with role `"coach"`.

| Route | Method | Description |
|-------|--------|-------------|
| getCoachSessions | GET | Load coach sessions |
| registerCoachForSession | POST | Add coach to session |
| removeCoachFromSession | POST | Remove coach from session |

---

## 3.3 Admin-Protected Routes

Require: `sessionToken` with role `"admin"`.

| Route | Method | Description |
|-------|--------|-------------|
| registerTraineeBatchForSessions | POST | Batch registration |
| registerCustomerEventWithSchedule | POST | Event + schedule creation |
| listSessionsSchedule | GET | Fetch schedule rows |
| listCoachAccounts | GET | Fetch coach account rows |
| listTraineeAccounts | GET | Fetch trainee account rows |
| addSessionSchedule | POST | Add schedule row |
| updateSessionSchedule | POST | Update schedule row |
| deleteSessionSchedule | POST | Delete schedule row |
| createCoachAccount | POST | Create coach login account |
| createTraineeAccount | POST | Create trainee login account |
| updateCoachAccount | POST | Update coach login account |
| updateTraineeAccount | POST | Update trainee login account |
| deleteCoachAccount | POST | Delete coach login account |
| deleteTraineeAccount | POST | Delete trainee login account |

---

## 3.4 Login Routes

Issue session tokens.

| Route | Method | Payload |
|-------|--------|---------|
| coachLogin | POST | `{ mode: "pin", pin }` or `{ mode: "password", password }` |
| adminLogin | POST | `{ password }` |

---

# 4. Global Response Contract (Strict)

Response objects must follow `gas-response-format` exactly:

- success: `{ "ok": true, "data": ... }`
- error: `{ "ok": false, "error": "<error_code>" }`

Error codes are defined in `gas-error-handling`.

---

# 5. Request Contract

All requests:

```json
{
  "route": "<routeName>",
  "payload": { ... },
  "sessionToken": "..." // optional for public routes
}
```

Rules:
- `route` required  
- `payload` required for POST  
- `sessionToken` required for protected routes  
- GET uses query params

---

# 6. Route Contracts

## 6.1 Coach Login

Request payload:
- PIN mode: `{ mode: "pin", pin }`
- Password mode: `{ mode: "password", password }`

Success data shape:
- `session`: `{ sessionToken, role: "coach", expiresInSeconds }`
- `coachData`: coach identity object for PIN mode, `null` for password mode

---

## 6.2 Coach PIN Registration

Request payload:
- `{ firstname, lastname, alias, pin, password }`

Success data shape:
- `{ id, firstname, lastname, alias, pin, created_at }`

### Errors
- invalid_password  
- pin_reserved  
- mismatching_aliases  
- already_registered  
- pins_do_not_match  

---

## 6.3 Admin Login

Request payload:
- `{ password }`

Success data shape:
- `session`: `{ sessionToken, role: "admin", expiresInSeconds }`

---

## 6.4 Admin Batch Trainee Registration (OQM‑0034)

Must follow global request contract with admin `sessionToken` and return strict `{ ok, data }` or `{ ok, error }`.
Payload and domain constraints are defined by backend validation and `sheet-schema`.

---

## 6.5 Admin Customer Event + Schedule (OQM‑0035)

Must follow global request contract with admin `sessionToken` and return strict `{ ok, data }` or `{ ok, error }`.
Payload and domain constraints are defined by backend validation and `sheet-schema`.

---

## 6.6 Get Trainee Sessions (OQM‑0033)

Supports anonymous and identity-based loading under public-route rules.
Return shape remains strict and route-specific fields must align with backend handlers.

---

## 6.7 Admin Account Management (feature-admin-account-crud)

All account routes require admin `sessionToken` and strict response envelope.

### List Routes (GET)

- `listCoachAccounts`
  - Query: `route=listCoachAccounts&sessionToken=<token>`
  - Success data: `{ accounts: CoachAccountRecord[] }`
- `listTraineeAccounts`
  - Query: `route=listTraineeAccounts&sessionToken=<token>`
  - Success data: `{ accounts: TraineeAccountRecord[] }`

### Create Routes (POST)

- `createCoachAccount`
  - Payload: `{ firstname, lastname, alias, pin }`
  - Success data: `{ account: CoachAccountRecord }`
  - Errors: `validation_failed`, `concurrent_request`, `pin_reserved`, `unauthorized`
- `createTraineeAccount`
  - Payload: `{ firstname, lastname, age, pin }`
  - Success data: `{ account: TraineeAccountRecord }`
  - Errors: `validation_failed`, `concurrent_request`, `pin_reserved`, `unauthorized`

### Update Routes (POST)

- `updateCoachAccount`
  - Payload: `{ id, firstname, lastname, alias, pin }`
  - Success data: `{ account: CoachAccountRecord }`
  - Errors: `validation_failed`, `concurrent_request`, `no_match_found`, `pin_reserved`, `forbidden`, `unauthorized`
- `updateTraineeAccount`
  - Payload: `{ id, firstname, lastname, age, pin }`
  - Success data: `{ account: TraineeAccountRecord }`
  - Errors: `validation_failed`, `concurrent_request`, `no_match_found`, `pin_reserved`, `forbidden`, `unauthorized`

### Delete Routes (POST)

- `deleteCoachAccount`
  - Payload: `{ id }`
  - Success data: `{ id }`
  - Errors: `validation_failed`, `concurrent_request`, `no_match_found`, `forbidden`, `unauthorized`
- `deleteTraineeAccount`
  - Payload: `{ id }`
  - Success data: `{ id }`
  - Errors: `validation_failed`, `concurrent_request`, `no_match_found`, `forbidden`, `unauthorized`

### Account Record Shapes

- `CoachAccountRecord`: `{ id, firstname, lastname, alias, pin, created_at, last_activity }`
- `TraineeAccountRecord`: `{ id, firstname, lastname, age, pin, created_at, last_activity }`

---

# 7. Script Properties (Backend)

- SHEET_ID  
- COACH_PASSWORD  
- ADMIN_PASSWORD  

Copilot must **never** write new Script Properties.

---

# 8. Frontend Integration Rules

- Only `VITE_GAS_BASE_URL` required  
- Admin token → `sessionStorage.oqm_admin_session_token`  
- Coach token → `sessionStorage.oqm_coach_session_token`  
- Protected routes must include `sessionToken`  
- Remove all `VITE_API_TOKEN` usage

---

# 9. Required Behavior for Copilot

Copilot must:

- use correct route names  
- use correct payload shapes  
- include sessionToken when required  
- use strict response format  
- parse `{ ok, data, error }`  
- never invent routes, fields, shapes  
- never change route/payload/response shapes

---

# 10. Automatic References

Copilot must apply this skill when generating/modifying:

- frontend API clients  
- backend handlers  
- request/response types  
- sessionToken logic  
- fetch wrappers  
- error handling

---

# 11. Sessions Schedule Routes (OQM‑0042)

## 11.1 Shared Fields

Schedule payload fields:
- `session_type`, `session_type_alias`, `start_date`, `end_date`, `weekdays_available`, `start_time`,
  `end_time`, `location`, `location_alias`, `active`
- `id` required for update/delete

Validation rules:
- required for create/update: `session_type`, `session_type_alias`, `start_date`, `end_date`, `weekdays_available`, `active`
- `end_date >= start_date`
- `weekdays_available`: comma-separated integers in `0..6`, no duplicates
- `start_time` and `end_time`: optional but paired, valid `HH:MM`, `end_time >= start_time`

## 11.2 `listSessionsSchedule` (GET)

- Query: `route=listSessionsSchedule&sessionToken=<token>`
- Success data: `{ schedules: SessionSchedule[] }`
- Errors: `unauthorized`

## 11.3 `addSessionSchedule` (POST)

- Request: route + admin `sessionToken` + schedule payload (without `id`)
- Success data: `{ schedule }`
- Errors: `validation_failed`, `schedule_already_exists`, `concurrent_request`, `unauthorized`

## 11.4 `updateSessionSchedule` (POST)

- Request: route + admin `sessionToken` + schedule payload with `id`
- Success data: `{ schedule }`
- Errors: `validation_failed`, `no_match_found`, `schedule_already_exists`, `concurrent_request`, `unauthorized`
- Behavior: updates mutable schedule fields; never modifies `id` or `created_at`

## 11.5 `deleteSessionSchedule` (POST)

- Request: route + admin `sessionToken` + `{ id }`
- Success data: `{ id }`
- Errors: `no_match_found`, `concurrent_request`, `unauthorized`

---

# 12. Future Extensions

Versioned via Git.  
Breaking changes must be documented here.
```
