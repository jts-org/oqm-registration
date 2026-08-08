```markdown
---
name: gas-error-handling
description: Standardized error codes, formatting, and propagation rules for the OQM GAS backend. Copilot must apply this skill whenever generating or modifying backend error handling logic.
license: MIT
---

# GAS Error Handling

Authoritative error model for the OQM backend.  
All errors must be structured, predictable, JSON‑formatted, and must never leak internal details.

---

## 1. Error Format (Strict)

All backend errors must follow the canonical response contract in `gas-response-format`:

```json
{ "ok": false, "error": "<error_code>" }
```

This skill defines which error codes are valid and how failures are mapped. Do not introduce alternate shapes.

---

## 2. Valid Error Codes

Copilot must use **only** these codes:

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
- schedule_already_exists  

Rules:
- Copilot must not invent new error codes.  
- New codes require updating this skill before use.

---

## 3. Error Propagation Rules

Backend must:
- wrap all route logic in `try/catch`  
- convert thrown errors to known error codes  
- never leak stack traces  
- never return raw exceptions  
- never return HTML  
- never return partial error objects  
- never return Google Apps Script exception messages  

Required behavior for Copilot:
- always catch errors at route handler level  
- always convert errors to known codes  
- never rethrow without converting  
- never expose internal details (sheet names, ranges, tokens, stack traces)

---

## 4. Mapping Exceptions to Error Codes

### Authentication
- wrong password → `invalid_password`  
- unknown user → `invalid_credentials`  
- missing/invalid sessionToken → `unauthorized`  
- insufficient role → `forbidden`  

### Validation
- missing required fields → `validation_failed`  
- age validation failure → `validation_failed_age`  
- duplicate name → `name_already_exists`  
- duplicate PIN → `pin_reserved`  

### Registration
- already registered → `already_registered`  
- session full or taken → `already_taken`  

### Concurrency
- lock acquisition failure → `concurrent_request`  
- coach removal conflict → `concurrent_operation`  
- batch conflict → `concurrent_request`  

Rules:
- mappings must remain stable  
- no new mappings unless this skill is updated  

---

## 5. Interaction With Other Skills

### auth-flow
Defines login/session validation errors and ensures sessionToken failures map to `unauthorized` or `forbidden`.

### gas-locking-and-concurrency
Defines concurrency error codes and ensures lock failures map to `concurrent_request`.

### sheet-schema
Defines validation errors for missing/invalid fields.

### gas-sheet-operations
Ensures read/validate/write failures map to correct error codes.

### wire-react-to-gas
Ensures frontend receives consistent error formats.

### security-secrets
Ensures errors never leak secrets or Script Properties.

---

## 6. Prohibited Behavior

Copilot must not:
- throw raw strings  
- return stack traces  
- return HTML errors  
- return partial error objects  
- return GAS exception messages  
- generate new error codes  
- generate nested error objects  
- omit `"ok": false`  

---

## 7. Required Behavior for Copilot

Copilot must:
- wrap route logic in try/catch  
- convert errors to known codes  
- return strict JSON error format  
- use only defined error codes  
- avoid leaking internal details  
- never assume new codes exist unless added here  

---

## 8. Future Extensions

New error codes may be added, but existing ones must remain stable.  
Any change to error codes or formatting must be added here before Copilot may use it.
```
