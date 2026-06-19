---
name: auth-flow
description: >
  Authentication and identity flow for the OQM application. Defines how
  coach, trainee, and admin identities are verified, how session tokens
  are created, and how roles are enforced. Copilot must use this skill
  whenever generating or modifying authentication-related logic.
---

# Authentication Flow (OQM)

This skill describes the current authentication model used by the OQM
Google Apps Script backend and the corresponding frontend API clients.
It covers PIN-based identity, password-based login, role-based sessions,
and error conventions. This skill describes the *current* model and does
not restrict future extensions such as new roles, token types, or login
mechanisms.

---

## 1. Identity Models

The system uses two identity mechanisms:

### A) PIN-Based Identity (Coach & Trainee)
- PINs are **not secrets**.
- PINs identify a person in Sheets:
  - coach_login
  - trainee_login
- PINs must be unique across both sheets.
- PINs must never grant access to protected routes.
- PIN-based login always returns a **sessionToken**.

### B) Password-Based Identity (Coach & Admin)
- COACH_PASSWORD and ADMIN_PASSWORD are stored in Script Properties.
- Passwords are validated only in backend:
  - coachLogin(mode: "password")
  - adminLogin
- Password-based login always returns a **sessionToken**.

---

## 2. Session Token Model (sessionToken)

sessionToken is the only authorization mechanism for protected routes.

### Creation
sessionToken is created by:
- coachLogin (PIN or password)
- adminLogin

### Storage
sessionToken is stored in CacheService:
```js
session:<token>
```

### Session Object
A session contains:
- role: "coach" or "admin"
- subject: coach id or "admin"
- createdAt: ISO timestamp

### Expiration
Sessions expire after `SESSION_TTL_SECONDS` (currently 8 hours).

### Frontend Rules
- Frontend must never store sessionToken permanently.
- Frontend must pass sessionToken explicitly in each request.
- Frontend must never attempt to validate sessionToken locally.

---

## 3. Login Flows

### A) Coach Login (PIN Mode)
Route:
```js
POST { route: "coachLogin", payload: { mode: "pin", pin } }
```

Backend steps:
1. verifyCoachPin_(pin)
2. If match → createSession_("coach", coachId)
3. Return:
  ```json
  { session: { sessionToken, role, expiresInSeconds }, coachData }
  ```

Errors:
- no_match_found

### B) Coach Login (Password Mode)
Route:
```js
POST { route: "coachLogin", payload: { mode: "password", password } }
```

Backend steps:
1. Compare password with COACH_PASSWORD
2. If match → createSession_("coach", "")
3. Return:
  ```js
  { session: { sessionToken, role, expiresInSeconds }, coachData: null }
  ```

Errors:
- invalid_credentials

### C) Admin Login
Route:
```js
POST { route: "adminLogin", payload: { password } }
```

Backend steps:
1. Compare password with ADMIN_PASSWORD
2. If match → createSession_("admin", "admin")

Errors:
- invalid_credentials

### D) Trainee PIN Verification
Route:
```js
POST { route: "verifyTraineePin", payload: { pin } }
```

Backend steps:
1. Check trainee_login
2. If not found → check coach_login (fallback)
3. Return trainee-shaped data

Errors:
- no_match_found

---

## 4. Route Access Control

Copilot must follow the backend’s route classification:

### Public Routes (no sessionToken required)
- listItems
- createItem
- registerCoachPin
- verifyCoachPin
- getTraineeSessions (GET or POST)
- registerTraineeForSession
- registerTraineePin
- verifyTraineePin

### Coach Routes (sessionToken with role coach or admin)
- getCoachSessions
- registerCoachForSession
- removeCoachFromSession

### Admin Routes (sessionToken with role admin)
- getSettings
- registerTraineeBatchForSessions
- registerCustomerEventWithSchedule

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

Copilot must use the backend’s established error codes:
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

Error responses must always be:
```json
{ ok: false, error: "<error_code>" }
```

---

## 7. Frontend/Backend Responsibility Boundary

### Frontend must:
- Never validate PINs.
- Never validate passwords.
- Never validate sessionToken.
- Always pass sessionToken explicitly.
- Handle backend error codes as Error(message).

### Backend must:
- Validate all credentials.
- Validate all sessionTokens.
- Enforce all roles.
- Prevent PIN collisions.
- Prevent unauthorized access.
- Never leak secrets or session data.

---

### 8. Future Extensions
This skill describes the current authentication model.

Copilot must not assume that roles, token formats, or authentication flows are fixed.

New roles, token types, or authentication mechanisms may be added without breaking this skill.

---

## Automatic References

Copilot must automatically apply this authentication model whenever generating
or modifying login flows, identity verification, session creation, or frontend
API clients that interact with authentication routes.

### When to Apply This Skill

Copilot must reference this skill when:

- generating coachLogin or adminLogin logic
- generating verifyCoachPin or verifyTraineePin logic
- generating PIN-based identity flows
- generating password-based login flows
- creating or consuming sessionToken objects
- generating frontend API clients for login or identity verification
- generating backend logic that maps sheet rows to identity objects
- reasoning about error codes related to authentication

### How This Skill Interacts With Other Skills

- **security-secrets**  
  Ensures that login flows are secure, sessionToken is validated correctly,
  and no sensitive data is leaked. auth-flow describes *what happens* during
  login; security-secrets describes *how it must be secured*.

- **sheet-schema**  
  Provides the structure of coach_login and trainee_login sheets used for
  PIN-based identity. Copilot must use the schema when reading or writing
  identity rows.

- **wire-react-to-gas**  
  Ensures that login-related API calls match the backend contract, including
  payload shapes, error codes, and sessionToken handling.

### Required Behavior

When Copilot generates authentication-related code:

- It must always return sessionToken for successful login.
- It must never validate PINs or passwords on the frontend.
- It must always use backend routes for identity verification.
- It must use the correct error codes defined by the backend.
- It must never assume that roles or login mechanisms are fixed.

### Future Extensions

This skill describes the current authentication model. Copilot must not assume
that roles, login methods, or identity mechanisms are fixed. New roles, login
types, or identity flows may be added without breaking this skill.
