---
name: gas-validation-rules
description: >
  Validation rules for PINs, names, ages, sessions, and batch operations in the
  OQM backend. Copilot must use this skill whenever generating or modifying
  validation logic.
license: MIT
---

# GAS Validation Rules

This skill defines all validation rules used by the OQM backend.  
All validation must be **schema-driven**, **atomic**, **deterministic**, and **performed inside locks** when writes occur.

Copilot must treat validation as a required step before any write operation.

---

# 1. General Validation Principles (Copilot-only)

Copilot must:

- validate **before** writing  
- validate **inside the lock** for any write operation  
- validate using **stable column indexes** from `sheet-schema`  
- validate using **actual sheet data**, not assumptions  
- validate **all required fields**  
- validate **foreign keys**  
- validate **uniqueness constraints**  
- return only error codes defined in `gas-error-handling`  
- never skip validation  
- never validate on the frontend  
- never invent new validation rules  

Validation must be deterministic and must not rely on UI formatting or dynamic schema detection.

---

# 2. PIN Validation

Copilot must:

- ensure PIN is unique across **coach_login** and **trainee_login**  
- treat PIN as identity, not a secret  
- validate PIN inside the lock when writing  
- return `pin_reserved` if duplicate  

### Required behavior:

- read both login sheets  
- skip header rows  
- compare PINs using strict equality  
- treat empty or undefined PIN as invalid  

---

# 3. Name Validation

Copilot must:

- ensure name is not empty  
- ensure name is unique when required  
- return `name_already_exists` on conflict  

### Required behavior:

- trim whitespace  
- treat empty strings as invalid  
- compare case-insensitively when required  
- validate inside lock when writing  

---

# 4. Age Validation

Copilot must:

- validate age ranges  
- validate age_group consistency  
- return `validation_failed_age` on failure  

### Required behavior:

- if age_group = "underage", underage_age must be a number  
- if age_group = "adult", underage_age must be empty or null  
- age must be within allowed ranges defined by business rules  

---

# 5. Session Validation

Copilot must:

- prevent overlapping registrations  
- prevent duplicate registrations  
- validate session_type exists in `sessions` sheet  
- validate camp_session_id exists in `camp_schedules` when applicable  
- return `already_registered` or `already_taken`  

### Required behavior:

- compare date + time ranges  
- ensure no overlapping sessions for same trainee/coach  
- ensure session_type is valid  
- ensure foreign keys exist  

---

# 6. Batch Validation

Copilot must:

- validate all rows before writing  
- fail atomically  
- return `validation_failed`  

### Required behavior:

- validate each row independently  
- collect all validation errors  
- abort write if any row fails  
- never perform partial writes  

---

# 7. Schema-Driven Validation (Copilot-only)

Copilot must use `sheet-schema` to validate:

- required fields  
- column order  
- datatypes  
- foreign keys  
- boolean fields  
- ISO timestamps  
- time fields  
- numeric fields  

Copilot must never:

- infer schema dynamically  
- assume missing columns  
- assume optional fields that are not defined  
- write fields not defined in schema  

---

# 8. Read → Validate → Write Atomicity

Validation must follow this sequence:

1. Acquire lock  
2. Read sheet data  
3. Validate using schema + business rules  
4. If validation fails → return error code  
5. If validation succeeds → write full rows  
6. Release lock  

Copilot must never:

- validate outside lock when result affects writes  
- validate after writing  
- perform multi-phase writes  

---

# 9. Error Code Mapping

Copilot must map validation failures to these error codes:

### PIN
- duplicate PIN → `pin_reserved`

### Name
- duplicate name → `name_already_exists`

### Age
- invalid age → `validation_failed_age`

### Session
- duplicate registration → `already_registered`
- session full or taken → `already_taken`

### Batch
- any batch validation failure → `validation_failed`

### General
- missing required fields → `validation_failed`
- invalid foreign key → `validation_failed`

Copilot must not invent new validation error codes.

---

# 10. Interaction With Other Skills

### **sheet-schema**
- Defines column order, types, and required fields  

### **gas-sheet-operations**
- Defines read/write rules and atomicity  

### **gas-error-handling**
- Defines valid error codes and error format  

### **gas-locking-and-concurrency**
- Ensures validation happens inside lock for writes  

### **auth-flow**
- Ensures identity validation follows correct rules  

### **wire-react-to-gas**
- Ensures validation errors are returned in correct API format  

---

# 11. Prohibited Behavior

Copilot must not:

- skip validation  
- validate on frontend  
- invent new validation rules  
- validate using dynamic schema detection  
- validate outside lock when result affects writes  
- return human-readable messages  
- return stack traces  
- return partial error objects  

---

# 12. Future Extensions

Validation rules may expand. Copilot must not assume fixed constraints.  
Any new validation rule must be added here before Copilot is allowed to use it.

