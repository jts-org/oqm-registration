```markdown
---
name: gas-response-format
description: Standard JSON response format for all OQM backend routes. Copilot must use this skill whenever generating or modifying backend responses.
license: MIT
---

# GAS Response Format

Authoritative response format for the OQM Apps Script backend.  
All backend routes must follow this strict JSON structure so the React frontend, API layer, and error-handling logic remain consistent and predictable.

---

# 1. Success Response (Strict)

```json
{ "ok": true, "data": ... }
```

Rules:

- `"ok"` must be `true`  
- `"data"` must contain the full payload  
- `"data"` must never be omitted  
- `"data"` must never be `null` unless explicitly intended  
- `"data"` must never contain error codes  

Copilot must **never** generate:

- `{ success: true }`  
- `{ status: "ok" }`  
- `{ data: ... }` (missing `"ok"`)  
- `{ ok: true }` (missing `"data"`)  
- nested success objects  

---

# 2. Error Response (Strict)

```json
{ "ok": false, "error": "<error_code>" }
```

Rules:

- `"ok"` must be `false`  
- `"error"` must be a string error code  
- `"error"` must never be an object  
- `"error"` must never contain stack traces  
- `"error"` must never contain human-readable messages  

Copilot must **never** generate:

- `{ success: false }`  
- `{ status: "error" }`  
- `{ message: "..." }`  
- `{ error: { code: "...", message: "..." } }`  
- `{ ok: false }` (missing `"error"`)  
- HTML error pages  
- raw exceptions  

Error codes defined in `gas-error-handling`.

---

# 3. Required Behavior for Copilot

Copilot must:

- wrap all backend responses in strict JSON format  
- return `{ ok: true, data: ... }` for success  
- return `{ ok: false, error: "<error_code>" }` for errors  
- never return raw values  
- never return HTML  
- never return partial objects  
- never embed stack traces or exception messages  
- never expose internal details (sheet names, ranges, Script Properties, tokens)

Route handler rules:

- All handlers must return strict response objects  
- All errors must be caught and converted to error codes  
- Concurrency failures must use concurrency error codes  
- Validation failures must use validation error codes  

---

# 4. Interaction With Other Skills

### gas-error-handling
- Defines valid error codes  
- Ensures errors never leak stack traces  

### wire-react-to-gas
- Defines frontend expectations for `{ ok, data, error }`  

### auth-flow
- Defines login/sessionToken response rules  
- Ensures unauthorized/forbidden responses use correct error codes  

### gas-backend-architecture
- Ensures doGet/doPost wrap responses in JSON  
- Ensures no HTML or alternative formats  

### gas-locking-and-concurrency
- Ensures lock failures return concurrency error codes in correct format  

---

# 5. Prohibited Behavior

Copilot must not:

- return `{ success: true }`  
- return `{ status: "ok" }`  
- return `{ message: "..." }`  
- return `{ error: { code: "...", message: "..." } }`  
- return raw values  
- return HTML  
- return stack traces  
- return partial objects  
- return Apps Script exception messages  
- invent new response formats  

---

# 6. Required JSON Serialization Rules

Copilot must ensure:

- responses use `JSON.stringify`  
- returned via `ContentService.createTextOutput()`  
- MIME type set to `ContentService.MimeType.JSON`  
- no extra whitespace or formatting  
- no BOM or extraneous characters  

---

# 7. Future Extensions

Response format is stable and must not change.  
Any new fields must be added here before Copilot may generate them.
```
