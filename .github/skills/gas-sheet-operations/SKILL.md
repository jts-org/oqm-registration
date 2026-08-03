```markdown
---
name: gas-sheet-operations
description: Rules for reading, writing, validating, and transforming Google Sheets data in the OQM backend. Copilot must use this skill whenever generating or modifying sheet operations.
license: MIT
---

# GAS Sheet Operations

Authoritative rules for deterministic, schema‑aligned, atomic, concurrency‑safe sheet operations in the OQM backend.

---

# 1. Reading Sheets (Strict)

Copilot must:
- read full ranges via `getDataRange().getValues()`  
- skip header row  
- skip empty rows  
- map rows to typed objects using `sheet-schema`  
- treat all values as untrusted until validated  
- use stable column indexes (never dynamic detection)  
- avoid reads outside locks when results influence writes  

Required behavior:
- read → validate → write inside the same lock  
- never assume fixed row counts  
- never assume Sheets auto‑sort or auto‑clean  

---

# 2. Writing Sheets (Strict)

Copilot must:
- use locks for **all** writes (`gas-locking-and-concurrency`)  
- write full rows in correct column order  
- never write undefined values  
- write timestamps in ISO format  
- write IDs before dependent fields  
- ensure atomic, consistent writes  

Required write pattern:
1. Acquire lock  
2. Read sheet  
3. Validate data  
4. Apply changes  
5. Write full rows  
6. Release lock  

Prohibited:
- partial writes  
- writes outside lock  
- writing secrets  
- inconsistent row lengths  

---

# 3. ID Generation

Copilot must:
- generate IDs using incremental numeric, timestamp-based, or `Utilities.getUuid()`  
- never use external UUID libraries  
- never use random strings  
- never generate IDs on frontend  
- generate IDs **inside the lock**  

Rules defined in `gas-id-generation`.

---

# 4. Validation Rules

Copilot must validate:
- required fields  
- uniqueness (PIN, name)  
- session overlaps  
- age rules  
- row structure  
- required columns present  

Validation logic defined in `gas-validation-rules`.

---

# 5. Stable Range Rules (Strict)

Copilot must:
- use stable column indexes  
- never use dynamic detection  
- never use `getLastRow()` for schema  
- never rely on UI formatting  
- never reorder columns  
- never assume column order differs from `sheet-schema`  

---

# 6. Atomic Read → Validate → Write

Copilot must ensure:
- all read → validate → write sequences occur inside the same lock  
- no reads outside lock if they influence writes  
- no writes without validation  
- no multi-phase writes  

---

# 7. Interaction With Other Skills

**sheet-schema** — column order + typed rows  
**gas-locking-and-concurrency** — atomic writes  
**gas-validation-rules** — validation logic  
**gas-error-handling** — error codes  
**auth-flow** — identity + sessionToken rules  
**gas-id-generation** — ID rules  

---

# 8. Prohibited Behavior

Copilot must not:
- use `appendRow` without lock  
- assume fixed row counts  
- write partial rows  
- reorder columns  
- write secrets  
- detect schema dynamically  
- read outside lock when influencing writes  
- write inconsistent row lengths  
- generate optimistic concurrency patterns  
- generate multi-lock patterns  

---

# 9. Required Behavior for Copilot

Copilot must:
- follow `sheet-schema`  
- use stable column indexes  
- use atomic read → validate → write  
- use locks for all writes  
- validate before writing  
- write full rows  
- generate IDs inside lock  
- return errors in strict JSON format  

---

# 10. Future Extensions

Sheet structures may evolve.  
Schema changes must be reflected in `sheet-schema` and this skill before Copilot may use them.
```
