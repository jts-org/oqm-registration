---
name: gas-backend-architecture
description: >
  Architectural rules, structure, and execution model for the Google Apps Script
  backend powering the OQM Registration system. Copilot must use this skill
  whenever generating or modifying backend routes, handlers, or shared utilities.
license: MIT
---

# GAS Backend Architecture

The OQM backend is a Google Apps Script Web App that exposes a JSON API consumed
by the React frontend. This skill defines the required architecture, routing
model, response format, execution flow, and all backend-only rules that Copilot
must follow.

---

## 1. Entry Points

The backend exposes two entry points:

### doGet(e)
Used for:
- public read-only routes
- authenticated GET routes with sessionToken in query params

### doPost(e)
Used for:
- login routes
- write operations
- authenticated POST routes with sessionToken in body

Both must:

- parse input safely  
- dispatch to the correct route handler  
- wrap responses in the standard JSON format  
- catch errors and convert them to `{ ok: false, error: "<code>" }`  
- never return HTML  
- never return raw exceptions or stack traces  

---

## 2. Routing Model

Routes are dispatched based on:

```json
{ "route": "<routeName>", "payload": { ... }, "sessionToken": "..." }
```

Copilot must always generate route handlers as **pure functions**:

```js
function routeName_(payload, session) {
  // no side effects
}
```

Backend must never:

- mutate global state  
- rely on undeclared globals  
- write to Script Properties dynamically  
- generate alternative routing models  
- generate dynamic eval  

---

## 3. SessionToken Validation

Copilot must always validate sessionToken using:

- CacheService  
- role-based access rules  
- expiration timestamp  

Rules:

- Validation must happen **before** calling route handlers  
- Invalid or expired tokens must return `{ ok: false, error: "unauthorized" }`  
- Admin-only routes must enforce admin role  
- Coach routes must allow coach or admin  

---

## 4. Response Format (strict)

All responses must follow:

```json
{ "ok": true, "data": ... }
{ "ok": false, "error": "<error_code>" }
```

Copilot must never generate:

- `{ success: true }`
- `{ status: "ok" }`
- `{ message: "..." }`
- HTML output  
- partial objects  

Response formatting rules are defined in detail in `gas-response-format`.

---

## 5. File Structure

Recommended structure:

```
gas/
  main.gs
  routes/
    coach.gs
    trainee.gs
    admin.gs
  core/
    auth.gs
    errors.gs
    locking.gs
    sheets.gs
    utils.gs
```

Copilot must keep:

- route handlers in `routes/`
- shared logic in `core/`
- no circular dependencies
- no mixing of route logic and shared utilities

---

## 6. Backend Execution Rules (Copilot-only)

Copilot must follow these backend-only rules:

### 6.1 No direct Google API calls from frontend
- Frontend must only call the GAS Web App URL  
- Backend must be the only layer accessing SpreadsheetApp  
- Never generate frontend code that calls Google APIs directly  

### 6.2 Stable range rules
- Always use stable column indexes  
- Never use dynamic ranges  
- Always skip header rows  
- Always map rows to typed objects  

### 6.3 No global mutable state
- No global caches  
- No global arrays  
- No global counters  
- No global objects that mutate  

### 6.4 No side effects outside route handlers
- No writes in doGet/doPost  
- No writes in utility functions unless explicitly intended  

---

## 7. Error Handling

Copilot must:

- wrap all route logic in try/catch  
- convert thrown errors to backend error codes  
- never leak stack traces  
- never return raw exceptions  
- use only error codes defined in `gas-error-handling`  

---

## 8. Interaction With Other Skills

- **gas-error-handling** — defines error codes and formatting  
- **gas-sheet-operations** — defines sheet read/write rules  
- **gas-locking-and-concurrency** — defines atomic write rules  
- **auth-flow** — defines login/session behavior  
- **security-secrets** — defines Script Properties and secret handling  
- **wire-react-to-gas** — defines API contract  
- **gas-response-format** — defines JSON response rules  
- **sheet-schema** — defines column order and required fields  

---

## 9. Prohibited Behavior

Copilot must not:

- generate dynamic eval  
- generate global mutable state  
- generate alternative routing models  
- generate HTML output  
- generate non-JSON responses  
- generate direct Google API calls from frontend  
- generate code that bypasses sessionToken validation  
- generate code that writes to Script Properties dynamically  

---

## 10. Future Extensions

This architecture may evolve. Copilot must not assume routes, files, or
structures are fixed. All changes to API contracts, sheet schemas, or backend
architecture must be reflected in SKILL.md files.

