```markdown
---
name: gas-response-format
description: Standard JSON response format for all OQM backend routes. Copilot must use this skill whenever generating or modifying backend responses.
license: MIT
---

# SKILL: gas-response-format
Authoritative JSON response format for all OQM backend routes.

---

# 1. Success Response (Strict)

Format:
```json
{ "ok": true, "data": ... }
```

Rules:
- `ok` = true  
- `data` required, never omitted  
- `data` never null unless explicitly intended  
- `data` never contains error codes  

Prohibited:
- `{ success: true }`  
- `{ status: "ok" }`  
- `{ data: ... }` (missing `ok`)  
- `{ ok: true }` (missing `data`)  
- nested success objects  

---

# 2. Error Response (Strict)

Format:
```json
{ "ok": false, "error": "<error_code>" }
```

Rules:
- `ok` = false  
- `error` = string code  
- `error` never object  
- `error` never stack trace  
- `error` never human-readable message  

Prohibited:
- `{ success: false }`  
- `{ status: "error" }`  
- `{ message: "..." }`  
- `{ error: { code, message } }`  
- `{ ok: false }` (missing `error`)  
- HTML pages  
- raw exceptions  

Error codes defined in `gas-error-handling`.

---

# 3. Required Behavior for Copilot

Copilot must:
- wrap all responses in strict format  
- success → `{ ok: true, data: ... }`  
- error → `{ ok: false, error: "<error_code>" }`  
- never return raw values  
- never return HTML  
- never return partial objects  
- never expose stack traces  
- never expose internal details (sheet names, ranges, Script Properties, tokens)

Route handler rules:
- all handlers return strict format  
- all errors caught → mapped to error codes  
- concurrency failures → concurrency error code  
- validation failures → validation error code  

---

# 4. Interaction With Other Skills

**gas-error-handling**  
- defines valid error codes  
- prevents stack trace leakage  

**wire-react-to-gas**  
- frontend expects `{ ok, data, error }`  

**auth-flow**  
- login/sessionToken responses follow strict format  
- unauthorized/forbidden → correct error codes  

**gas-backend-architecture**  
- doGet/doPost wrap responses in JSON  
- no HTML  

**gas-locking-and-concurrency**  
- lock failures → concurrency error codes  

---

# 5. Prohibited Behavior

Copilot must not:
- return `{ success: true }`  
- return `{ status: "ok" }`  
- return `{ message: "..." }`  
- return nested error objects  
- return raw values  
- return HTML  
- return stack traces  
- return partial objects  
- return Apps Script exception messages  
- invent new response formats  

---

# 6. JSON Serialization Rules

Copilot must ensure:
- use `JSON.stringify`  
- return via `ContentService.createTextOutput()`  
- set MIME type to JSON  
- no extra whitespace  
- no BOM  
- no extraneous characters  

---

# 7. Future Extensions

Response format is stable; changes must be added here first.
```
