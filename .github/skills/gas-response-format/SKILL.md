---
name: gas-response-format
description: >
  Standard JSON response format for all OQM backend routes. Copilot must use
  this skill whenever generating or modifying backend responses.
license: MIT
---

# GAS Response Format

This skill defines the only valid response format for the OQM backend. All
backend responses must follow this strict JSON structure so that the React
frontend, API layer, and error-handling logic remain consistent and predictable.

---

## 1. Success Response (Strict)

All successful backend responses must follow this exact structure:

```json
{ "ok": true, "data": ... }
```

Rules:

- `"ok"` must always be `true` for success  
- `"data"` must contain the full payload  
- `"data"` must never be omitted  
- `"data"` must never be `null` unless explicitly intended  
- `"data"` must never contain error codes  

Copilot must never generate:

- `{ success: true }`
- `{ status: "ok" }`
- `{ data: ... }` (missing `"ok"`)
- `{ ok: true }` (missing `"data"`)
- nested success objects

---

## 2. Error Response (Strict)

All error responses must follow this exact structure:

```json
{ "ok": false, "error": "<error_code>" }
```

Rules:

- `"ok"` must always be `false` for errors  
- `"error"` must be a string error code  
- `"error"` must never be an object  
- `"error"` must never contain stack traces  
- `"error"` must never contain human-readable messages  

Copilot must never generate:

- `{ success: false }`
- `{ status: "error" }`
- `{ message: "..." }`
- `{ error: { code: "...", message: "..." } }`
- `{ ok: false }` (missing `"error"`)
- HTML error pages
- raw exceptions

Error codes are defined in `gas-error-handling`.

---

## 3. Required Behavior for Copilot

When generating backend code, Copilot must:

- always wrap responses in the strict JSON format  
- always return `{ ok: true, data: ... }` for success  
- always return `{ ok: false, error: "<error_code>" }` for errors  
- never return raw values (e.g., `return data;`)  
- never return HTML  
- never return partial objects  
- never return alternative response shapes  
- never embed stack traces or exception messages  
- never expose internal details (sheet names, ranges, Script Properties, tokens)  

### Required behavior in route handlers:

- All route handlers must return a response object in the correct format  
- All errors must be caught and converted to error codes  
- All concurrency failures must return the correct concurrency error code  
- All validation failures must return the correct validation error code  

---

## 4. Interaction With Other Skills

### **gas-error-handling**
- Defines valid error codes  
- Defines error propagation rules  
- Ensures errors never leak stack traces  

### **wire-react-to-gas**
- Defines frontend expectations for response format  
- Ensures API layer parses `{ ok, data, error }` consistently  

### **auth-flow**
- Defines login/sessionToken response rules  
- Ensures unauthorized/forbidden responses use correct error codes  

### **gas-backend-architecture**
- Ensures doGet/doPost always wrap responses in JSON  
- Ensures no HTML or alternative formats are generated  

### **gas-locking-and-concurrency**
- Ensures lock failures return concurrency error codes in correct format  

---

## 5. Prohibited Behavior

Copilot must not:

- return `{ success: true }`  
- return `{ status: "ok" }`  
- return `{ message: "..." }`  
- return `{ error: { code: "...", message: "..." } }`  
- return raw values  
- return HTML  
- return stack traces  
- return partial objects  
- return Google Apps Script exception messages  
- invent new response formats  

---

## 6. Required JSON Serialization Rules

Copilot must ensure:

- All responses are serialized using `JSON.stringify`  
- Content is returned via `ContentService.createTextOutput()`  
- MIME type is set to `ContentService.MimeType.JSON`  
- No additional whitespace or formatting is added  
- No BOM or extraneous characters are included  

---

## 7. Future Extensions

The response format is stable and must not change.  
If new fields are ever added, they must be added here first before Copilot is
allowed to generate them.

