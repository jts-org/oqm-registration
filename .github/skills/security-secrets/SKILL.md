```markdown
---
name: security-secrets
description: Security, authentication, authorization, and secret-handling rules for the OQM GAS backend. Copilot must apply this skill whenever generating backend code, validating tokens, handling authentication, or interacting with Script Properties.
license: MIT
---

# Security & Secrets (GAS Backend)

Authoritative security model for the OQM backend.  
Defines secret storage, authentication, authorization, sessionToken rules, PIN identity rules, safe error handling, and frontend/backend responsibility boundaries.

Copilot must follow these rules for all backend logic.

---

## 1. Secret Storage (Script Properties)

Sensitive values must be stored **only** in Script Properties:

- `SHEET_ID`  
- `COACH_PASSWORD`  
- `ADMIN_PASSWORD`

### Required rules
Copilot must:
- never commit secrets to the repo  
- never log secrets  
- never return secrets in API responses  
- never expose Script Properties via routes  
- never store secrets in Sheets or frontend code  
- only read secrets inside backend functions  

Example:
```js
const ADMIN_PASSWORD = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
```

---

## 2. Authentication Model Overview

Two layers:

### A) PIN-Based Identity (public → identity)
Used for:
- `coachLogin(mode: "pin")`  
- `registerCoachPin`  
- `registerTraineePin`

Rules:
- PINs are **not secrets**  
- PINs identify rows in Sheets  
- PINs must never access protected routes  
- PIN uniqueness must be enforced across both login sheets  

### B) Role-Based Session Tokens (private → authorization)
Used for:
- coach routes (coach/admin)  
- admin routes (admin only)

sessionToken is the **only** authorization mechanism.

---

## 3. Session Token Model

Created by:
- `coachLogin`  
- `adminLogin`

sessionToken:
- random UUID pair  
- stored in CacheService: `session:<token>`  
- expires in 8 hours  
- bound to role (`coach` or `admin`)  
- bound to subject (coach id or `"admin"`)  
- never stored in Sheets  
- never logged  

Example:
```json
{
  "role": "coach",
  "subject": "coach-id-1718294400000",
  "createdAt": "2026-04-12T10:00:00.000Z"
}
```

---

## 4. Session Token Validation Rules

Copilot must:

### 1. Extract sessionToken from:
- POST body (`body.sessionToken`)  
- GET query (`?sessionToken=`)

### 2. Validate using:
```js
requireSessionRole_(sessionToken, allowedRoles);
```

### 3. Reject invalid/expired tokens:
```js
throw new Error('unauthorized');
```

### 4. Reject insufficient roles:
```js
throw new Error('forbidden');
```

### 5. Never log sessionToken or session contents.

---

## 5. Required Authorization Pattern

Copilot must always generate:

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

  throw new Error('unauthorized');
}
```

Rules:
- must run **before** route handlers  
- must not be wrapped in locks  
- must not perform sheet writes  
- must not leak details  

---

## 6. PIN-Based Identity Rules

PINs are identity only.

Copilot must:
- never treat PINs as secrets  
- never allow PINs to access protected routes  
- validate PINs only against Sheets  
- enforce PIN uniqueness across both login sheets  
- always return a sessionToken after PIN-based login  

---

## 7. Error Handling Rules

Copilot must use strict backend error format:

```json
{ "ok": false, "error": "<error_code>" }
```

Allowed error codes:
- invalid_password  
- invalid_credentials  
- no_match_found  
- pin_reserved  
- name_already_exists  
- concurrent_request  
- concurrent_operation  
- validation_failed  
- validation_failed_age  
- already_registered  
- already_taken  
- forbidden  
- unauthorized  

Rules:
- never leak stack traces  
- never return raw exceptions  
- never return nested error objects  
- never return HTML  

---

## 8. Frontend Responsibility Rules

Frontend must:
- never store secrets  
- never store sessionToken permanently  
- always pass sessionToken explicitly  
- never validate sessionToken locally  
- never validate PINs locally  

Backend is the only authority for:
- PIN verification  
- password verification  
- sessionToken validation  
- role enforcement  

---

## 9. Additional Backend Security Rules (Copilot-only)

Copilot must:
- never expose Script Properties  
- never echo tokens  
- never store tokens in Sheets or frontend  
- sanitize user input before writing  
- validate required fields  
- validate sessionToken before route handlers  
- enforce role-based access  
- never bypass authorization logic  
- never generate alternative authentication models  

---

## 10. Interaction With Other Skills

### auth-flow
Defines login/session creation; this skill defines security constraints.

### sheet-schema
Ensures no secrets or tokens are written to Sheets.

### wire-react-to-gas
Defines how sessionToken is passed between frontend and backend.

### gas-error-handling
Defines allowed error codes and strict error format.

### gas-locking-and-concurrency
Ensures sessionToken validation happens **outside** locks.

### gas-backend-architecture
Ensures authorization runs before route handlers.

---

## 11. Required Behavior for Copilot

Copilot must:
- never log secrets or tokens  
- never expose Script Properties  
- always validate sessionToken  
- always enforce role-based access  
- always use strict error format  
- always treat PINs as identity only  
- keep sessionToken handling backend-only  

---

## 12. Future Extensions

Security rules may expand.  
Any change to authentication, authorization, or secret handling must be added here before Copilot may generate new logic.
```
