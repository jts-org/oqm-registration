---
name: gas-sheet-operations
description: >
  Rules for reading, writing, validating, and transforming Google Sheets data
  in the OQM backend. Copilot must use this skill whenever generating or
  modifying sheet operations.
license: MIT
---

# GAS Sheet Operations

This skill defines how Copilot must interact with Sheets in the OQM backend.
All sheet operations must be deterministic, schema‑aligned, atomic, and safe
under concurrent execution.

---

## 1. Reading Sheets (Strict Rules)

Copilot must always:

- read full ranges using `getDataRange().getValues()`  
- skip header row  
- skip empty rows  
- map rows to typed objects based on `sheet-schema`  
- treat all values as untrusted until validated  
- use stable column indexes (never dynamic detection)  
- avoid reading outside locks when the result affects a write  

### Required behavior:

- Always read → validate → write inside the same lock when writes occur  
- Never assume fixed row counts  
- Never assume Sheets auto‑sort or auto‑clean data  

---

## 2. Writing Sheets (Strict Rules)

Copilot must:

- use locks for **all** writes (see `gas-locking-and-concurrency`)  
- write full rows in correct column order  
- never write undefined values  
- always write timestamps in ISO format  
- always write IDs before writing dependent fields  
- ensure writes are atomic and consistent  

### Required write pattern:

1. Acquire lock  
2. Read sheet  
3. Validate data  
4. Apply changes  
5. Write full rows  
6. Release lock  

### Prohibited:

- partial writes  
- writing outside lock  
- writing secrets to Sheets  
- writing inconsistent row lengths  

---

## 3. ID Generation

Copilot must:

- generate IDs using incremental numeric or timestamp-based patterns  
 - generate IDs using incremental numeric, timestamp-based, or UUID (via Utilities.getUuid()) patterns  
 - never use external UUID libraries; use `Utilities.getUuid()` where needed  
 - never use random strings  
- never generate IDs on the frontend  
- ensure ID generation happens **inside the lock**  

ID rules are defined in detail in `gas-id-generation`.

---

## 4. Validation Rules

Copilot must:

- validate required fields  
- validate uniqueness (PIN, name)  
- validate session overlaps  
- validate age rules  
- validate sheet row structure  
- validate that no required column is missing  

Validation logic is defined in `gas-validation-rules`.

---

## 5. Stable Range Rules (Copilot-only)

These rules come from repository-wide instructions and must be enforced here:

- Always use stable column indexes  
- Never use dynamic column detection  
- Never use `getLastRow()` to infer schema  
- Never rely on Sheets UI formatting  
- Never reorder columns  
- Never assume column order differs from `sheet-schema`  

---

## 6. Read → Validate → Write Atomicity

Copilot must ensure:

- All read → validate → write sequences occur **inside the same lock**  
- No reads occur outside the lock if they influence writes  
- No writes occur without a preceding validation step  
- No multi-phase writes (must be atomic)  

This ensures consistency under concurrent execution.

---

## 7. Interaction With Other Skills

### **sheet-schema**
- Defines column order and required fields  
- Defines typed row structure  

### **gas-locking-and-concurrency**
- Ensures all writes are atomic  
- Ensures read/validate/write happens inside lock  

### **gas-validation-rules**
- Defines validation logic for PINs, names, ages, sessions  

### **gas-error-handling**
- Defines error codes for validation and write failures  

### **auth-flow**
- Defines identity lookups and sessionToken validation  

### **gas-id-generation**
- Defines ID generation rules  

---

## 8. Prohibited Behavior

Copilot must not:

- use `appendRow` without locks  
- assume fixed row counts  
- write partial rows  
- reorder columns  
- write secrets to Sheets  
- generate dynamic schema detection  
- read outside lock when result affects writes  
- write inconsistent row lengths  
- generate optimistic concurrency patterns  
- generate multi-lock patterns  

---

## 9. Required Behavior for Copilot

When generating sheet operations, Copilot must:

- always follow schema from `sheet-schema`  
- always use stable column indexes  
- always use atomic read → validate → write  
- always use locks for writes  
- always validate before writing  
- always write full rows  
- always generate IDs inside lock  
- always return errors in strict JSON format  

---

## 10. Future Extensions

Sheet structures may evolve. Copilot must not assume fixed schemas.  
Any schema change must be reflected in `sheet-schema` and this skill before
Copilot is allowed to use it.

