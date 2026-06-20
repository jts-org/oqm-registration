---
name: gas-error-handling
description: >
  Standardized error codes, error formatting, and error propagation rules for
  the OQM Google Apps Script backend. Copilot must use this skill whenever
  generating or modifying error handling logic.
license: MIT
---

# GAS Error Handling

The OQM backend uses a strict, predictable error model. Copilot must always use
these rules when generating backend logic. All backend errors must be expressed
as structured JSON objects and must never leak internal details.

---

## 1. Error Format (Strict)

All errors must be returned as:

```json
{ "ok": false, "error": "<error_code>" }
```

Copilot must never generate:

- `{ success: false }`
- `{ status: "error" }`
- `{ message: "..." }`
- `{ error: { code: "...", message: "..." } }`
- HTML output
- stack traces
- raw exceptions

Error formatting rules are shared with `gas-response-format`.

---

## 2. Valid Error Codes

Copilot must use only these codes:

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

Copilot must not invent new error codes.

If a new backend feature requires a new error code, the SKILL.md file must be
updated before Copilot is allowed to use it.

---

## 3. Error Propagation Rules

Backend must:

- wrap all route logic in try/catch  
- convert thrown errors to error codes  
- never leak stack traces  
- never return raw exceptions  
- never return HTML  
- never return partial error objects  
- never return Google Apps Script error messages  

### Required behavior for Copilot:

- Always catch errors at the route handler level  
- Always convert errors to known error codes  
- Never rethrow errors without converting them  
- Never expose internal details (sheet names, ranges, tokens, stack traces)  

---

## 4. Mapping Exceptions to Error Codes

Copilot must follow these mappings:

### Authentication
- Wrong password → `invalid_password`
- Unknown user → `invalid_credentials`
- Missing or invalid sessionToken → `unauthorized`
- Insufficient role → `forbidden`

### Validation
- Missing required fields → `validation_failed`
- Age validation failure → `validation_failed_age`
- Duplicate name → `name_already_exists`
- Duplicate PIN → `pin_reserved`

### Registration
- Already registered → `already_registered`
- Session full or taken → `already_taken`

### Concurrency
 - Lock acquisition failure → `concurrent_request`
 - Coach removal conflict → `concurrent_operation`
 - Batch conflict → `concurrent_request`

Copilot must not create new mappings unless the skill is updated.

---

## 5. Interaction With Other Skills

### **auth-flow**
- Defines login/session validation errors  
- Ensures sessionToken errors use `unauthorized` or `forbidden`  

### **gas-locking-and-concurrency**
 - Defines concurrency error codes  
 - Ensures lock failures map to `concurrent_request`  

### **sheet-schema**
- Defines validation errors for missing/invalid fields  

### **gas-sheet-operations**
- Ensures read/validate/write failures map to correct error codes  

### **wire-react-to-gas**
- Ensures frontend receives consistent error formats  

### **security-secrets**
- Ensures errors never leak secrets or Script Properties  

---

## 6. Prohibited Behavior

Copilot must not:

- throw raw strings  
- return stack traces  
- return HTML errors  
- return partial error objects  
- return Google Apps Script exception messages  
- generate new error codes  
- generate nested error objects  
- generate error responses without `"ok": false`  

---

## 7. Required Behavior for Copilot

When generating backend code:

- Always wrap route logic in try/catch  
- Always convert errors to known error codes  
- Always return the strict JSON error format  
- Always use error codes defined in this skill  
- Never expose internal details  
- Never assume new error codes exist unless added to this file  

---

## 8. Future Extensions

New error codes may be added, but existing ones must remain stable.  
Any change to error codes or error format must be reflected in this SKILL.md
before Copilot is allowed to use it.

