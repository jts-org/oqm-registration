```markdown
---
name: auth-flow
description: Authentication and identity flow for the OQM application. Defines identity models, sessionToken rules, login flows, route access control, error codes, and frontend/backend responsibilities. Copilot must apply this skill whenever generating or modifying authentication logic.
---

# Authentication Flow (OQM)

Mandate-first description of the current authentication model used by the OQM GAS backend and frontend API clients. Covers PIN identity, password identity, sessionToken, role enforcement, and error conventions. Future extensions allowed.

---

## 1. Identity Models

The system uses two identity mechanisms.

### A) PIN Identity (Coach & Trainee)
- PINs are **not secrets**.
- PINs identify rows in Sheets:
  - `coach_login`
  - `trainee_login`
- PINs must be unique across both sheets.
- PINs must never grant access to protected routes.
- PIN login always returns a **sessionToken**.

### B) Password Identity (Coach & Admin)
- `COACH_PASSWORD` and `ADMIN_PASSWORD` stored in Script Properties.
- Validated only in backend:
  - `coachLogin(mode: "password")`
  - `adminLogin`
- Password login always returns a **sessionToken**.

---

## 2. Session Token Model (sessionToken)

sessionToken is the **only** authorization mechanism for protected routes.

### Creation
Created by:
- `coachLogin` (PIN or password)
- `adminLogin`

### Storage
Stored in CacheService:
```
session:<token>
```

### Session Object
- `role`: `"coach"` or `"admin"`
- `subject`: coach id or `"admin"`
- `createdAt`: ISO timestamp

### Expiration
TTL = `SESSION_TTL_SECONDS` (8 hours = 28800 seconds).
Define in backend constants (for example in `gas/Code.gs`) and keep frontend `expiresInSeconds` aligned.

### Frontend Rules
- Never store sessionToken permanently.
- Always pass sessionToken explicitly.
- Never validate sessionToken locally.

---

## 3. Login Flows

### A) Coach Login (PIN)
Route:
```js
POST { route: "coachLogin", payload: { mode: "pin", pin } }
```

Backend:
1. `verifyCoachPin_(pin)`
2. If match → `createSession_("coach", coachId)`
3. Return:
```json
{ session: { sessionToken, role, expiresInSeconds }, coachData }
```

Errors:
- `no_match_found`

---

### B) Coach Login (Password)
Route:
```js
POST { route: "coachLogin", payload: { mode: "password", password } }
```

Backend:
1. Compare with `COACH_PASSWORD`
2. If match → `createSession_("coach", "")`
3. Return:
```json
{ session: { sessionToken, role, expiresInSeconds }, coachData: null }
```

Errors:
- `invalid_credentials`

---

### C) Admin Login
Route:
```js
POST { route: "adminLogin", payload: { password } }
```

Backend:
1. Compare with `ADMIN_PASSWORD`
2. If match → `createSession_("admin", "admin")`

Errors:
- `invalid_credentials`

---

### D) Trainee PIN Verification
Route:
```js
POST { route: "verifyTraineePin", payload: { pin } }
```

Backend:
1. Check `trainee_login`
2. If not found → fallback to `coach_login` (legacy compatibility path only)
3. Return trainee-shaped data for matching identity

Notes:
- This route verifies identity only; it does not issue a sessionToken.
- `registerTraineePin` does not use this fallback.

Errors:
- `no_match_found`

---

## 4. Route Access Control

Canonical route list and access levels are defined in `wire-react-to-gas` (Route Access Matrix).

Role policy remains:
- public routes require no sessionToken
- coach routes allow `coach` and `admin`
- admin routes allow only `admin`

---

## 5. Required Authorization Pattern

Copilot must always generate authorization logic in this form:

```js
function authorize_(e, route, body) {
  if (isPublicRoute_(route)) return;

  const sessionToken = getSessionToken_(e, body);
  if (sessionToken) {
    if (isCoachRoute_(route)) {
      return requireSessionRole_(sessionToken, ['coach', 'admin']);
    }
    if (isAdminRoute_(route)) {
      return requireSessionRole_(sessionToken, ['admin']);
    }
  }

  throw new Error('Unauthorized');
}
```

---

## 6. Error Code Conventions

Copilot must use backend error codes:
- invalid_password  
- invalid_credentials  
- no_match_found  
- pin_reserved  
- name_already_exists  
- concurrent_request  
- validation_failed  
- validation_failed_age  
- already_registered  
- already_taken  
- forbidden  
- unauthorized  

Error responses must be:
```json
{ ok: false, error: "<error_code>" }
```

---

## 7. Frontend/Backend Responsibility Boundary

### Frontend must:
- Never validate PINs or passwords.
- Never validate sessionToken.
- Always pass sessionToken explicitly.
- Handle backend error codes as `Error(message)`.

### Backend must:
- Validate all credentials.
- Validate all sessionTokens.
- Enforce all roles.
- Prevent PIN collisions.
- Prevent unauthorized access.
- Never leak secrets or session data.

---

## 8. Future Extensions

This skill describes the current authentication model.  
Copilot must not assume roles, token formats, or login mechanisms are fixed.  
New roles, token types, or identity flows may be added without breaking this skill.

---

## Automatic References

Copilot must apply this skill when generating or modifying:

- coachLogin / adminLogin logic  
- verifyCoachPin / verifyTraineePin  
- PIN identity flows  
- password identity flows  
- sessionToken creation/consumption  
- frontend API clients for login or identity verification  
- backend logic mapping sheet rows to identity objects  
- authentication-related error handling  

---

## Interaction With Other Skills

### security-secrets
Secures login flows, sessionToken validation, and secret handling.

### sheet-schema
Defines structure of `coach_login` and `trainee_login` sheets.

### wire-react-to-gas
Ensures payload shapes, error codes, and sessionToken handling match backend contract.

---

## Required Behavior Summary

When Copilot generates authentication-related code:

- Always return sessionToken on successful login.  
- Never validate PINs or passwords on frontend.  
- Always use backend routes for identity verification.  
- Always use correct backend error codes.  
- Never assume roles or login mechanisms are fixed.

```
