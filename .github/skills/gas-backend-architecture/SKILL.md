```markdown
---
name: gas-backend-architecture
description: Architectural rules, structure, and execution model for the Google Apps Script backend powering the OQM Registration system. Copilot must use this skill whenever generating or modifying backend routes, handlers, or shared utilities.
license: MIT
---

# GAS Backend Architecture

Authoritative architecture for the OQM Google Apps Script backend.  
Defines entry points, routing model, sessionToken validation, response format, file structure, execution rules, and prohibited behavior.

---

# 1. Entry Points

## doGet(e)
Used for:
- public read-only routes  
- authenticated GET routes (sessionToken in query params)

## doPost(e)
Used for:
- login routes  
- write operations  
- authenticated POST routes (sessionToken in body)

Both must:
- parse input safely  
- dispatch to correct route handler  
- wrap responses in strict JSON format  
- catch errors → `{ ok: false, error: "<code>" }`  
- never return HTML  
- never return raw exceptions or stack traces  

---

# 2. Routing Model

Requests follow:
```json
{ "route": "<routeName>", "payload": { ... }, "sessionToken": "..." }
```

Route handlers must be **pure functions**:
```js
function routeName_(payload, session) {
  // no side effects
}
```

Backend must not:
- mutate global state  
- rely on undeclared globals  
- write Script Properties dynamically  
- generate alternative routing models  
- use dynamic eval  

---

# 3. SessionToken Validation

Copilot must validate tokens using:
- CacheService  
- role-based access rules  
- expiration timestamp  

Rules:
- validate **before** calling route handlers  
- invalid/expired → `{ ok: false, error: "unauthorized" }`  
- admin-only routes require admin  
- coach routes allow coach or admin  

---

# 4. Response Format (Strict)

All route responses must follow `gas-response-format` exactly:

- success: `{ "ok": true, "data": ... }`
- error: `{ "ok": false, "error": "<error_code>" }`

Do not generate alternative keys, partial objects, HTML, or raw exceptions.

---

# 5. File Structure

Recommended:
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

Rules:
- route handlers → `routes/`  
- shared logic → `core/`  
- no circular dependencies  
- no mixing route logic with shared utilities  

---

# 6. Backend Execution Rules (Copilot-only)

## 6.1 No direct Google API calls from frontend
- frontend must only call GAS Web App URL  
- backend is the only layer accessing SpreadsheetApp  

## 6.2 Stable range rules
- use stable column indexes  
- never use dynamic ranges  
- skip header rows  
- map rows to typed objects  

## 6.3 No global mutable state
- no global caches  
- no global arrays  
- no global counters  
- no global mutable objects  

## 6.4 No side effects outside route handlers
- no writes in doGet/doPost  
- no writes in utilities unless explicitly intended  

---

# 7. Error Handling

Copilot must:
- wrap route logic in try/catch  
- convert thrown errors → error codes  
- never leak stack traces  
- never return raw exceptions  
- use only error codes from `gas-error-handling`  

---

# 8. Interaction With Other Skills

- **gas-error-handling** — error codes + propagation  
- **gas-sheet-operations** — sheet read/write rules  
- **gas-locking-and-concurrency** — atomic write rules  
- **auth-flow** — login/session behavior  
- **security-secrets** — Script Properties rules  
- **wire-react-to-gas** — API contract  
- **gas-response-format** — strict JSON format  
- **sheet-schema** — column order + required fields  

---

# 9. Prohibited Behavior

Copilot must not:
- generate dynamic eval  
- generate global mutable state  
- generate alternative routing models  
- generate HTML output  
- generate non-JSON responses  
- generate direct Google API calls from frontend  
- bypass sessionToken validation  
- write Script Properties dynamically  

---

# 10. Future Extensions

Architecture may evolve.  
All changes to API contracts, sheet schemas, or backend architecture must be reflected in SKILL.md files.
```
