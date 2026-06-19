```md
---
name: gas-id-generation
description: >
  Rules for generating stable, predictable IDs for rows in Google Sheets in the
  OQM backend. Copilot must use this skill whenever generating or modifying ID
  logic.
license: MIT
---

# GAS ID Generation

This skill defines how IDs must be generated for all Sheets.  
ID generation must be **deterministic**, **atomic**, **collision‑free**, and **consistent**.

Copilot must treat ID generation as a critical part of backend data integrity.

---

# 1. ID Format (Strict)

Copilot must use one of the approved ID formats below.

Valid formats:

- **UUID**: `"3d7f2a8b-9c1e-4d5f-8a3b-7e9f4c2a1b6d"` (Google native)
- **Timestamp**: `"1718294400000"` (Date.now() as string)
- **Incremental**: `"1023"` (sequential integer)

Invalid formats:

- `"random_12345"` (custom random strings)
- `"id_" + Math.random()` (Math.random-based)
- `"frontend_" + something` (frontend-generated)
- Non-deterministic custom patterns

---

# 2. ID Generation Patterns (Strict)

Copilot must use one of the following patterns based on requirements:

## A) UUID-based (recommended for most use cases)

```js
const id = Utilities.getUuid();
```

**When to use:**
- Default choice for new implementations
- When collision-free uniqueness is paramount
- When foreign key relationships exist
- When sortability is not required (use `created_at` for sorting)

**Rules:**
- must be generated **once per row**
- must not be modified after creation
- generation can occur inside or outside lock (UUIDs are inherently unique)
- must use Google's native `Utilities.getUuid()` (not external libraries)

**Advantages:**
- Zero collision risk without coordination
- No race conditions possible
- Works across distributed contexts
- Native Google Apps Script support

**Trade-offs:**
- Not human-readable
- Not sortable by ID alone (use `created_at` for chronological order)
- Larger string storage (36 chars)

---

## B) Timestamp-based

```js
const id = Date.now().toString();
```

**When to use:**
- When IDs must be sortable without additional fields
- When chronological ordering by ID is a hard requirement
- When readability is important

**Rules:**
- must be generated **inside the lock**
- must be generated **once per row**
- must not be modified after creation
- must implement collision detection for concurrent writes

**Collision handling:**
If multiple writes occur in the same millisecond:
```js
let id = Date.now().toString();
while (existingIds.includes(id)) {
  id = (parseInt(id) + 1).toString();
}
```

**Trade-offs:**
- Risk of collision in high-frequency writes
- Requires lock coordination
- Less robust than UUIDs for distributed systems

---

## C) Incremental numeric

```js
const id = (lastId + 1).toString();
```

**When to use:**
- When sequential IDs are explicitly required
- When ID gaps are unacceptable
- When debugging by ID order is important

**Rules:**
- must read lastId **inside the lock**
- must compute next ID **inside the lock**
- must write new ID before dependent fields
- requires careful lock management

**Trade-offs:**
- Highest lock contention
- Complex error recovery
- Not suitable for batch operations

---

## D) Hybrid (timestamp + counter)

Allowed only if explicitly requested by user for specific use cases.

---

# 3. Atomicity Requirements

### For UUID-based IDs:
- Generate before or inside the lock (both acceptable)
- Generate **once per row**
- Write before dependent fields

### For timestamp/incremental IDs:
- Generate **inside the lock**
- **After** reading existing rows
- **Before** writing the row
- **After** validating uniqueness

Copilot must never:
- generate IDs after writing partial data
- regenerate IDs for existing rows
- generate IDs before reading existing rows (timestamp/incremental only)

---

# 4. Uniqueness Rules

Copilot must ensure:

- IDs are unique within each sheet
- IDs are never reused
- IDs are never overwritten
- IDs are never regenerated for existing rows

**UUID approach:**
- Uniqueness is guaranteed by algorithm
- No collision detection needed
- No lock coordination required for uniqueness

**Timestamp/incremental approach:**
- Uniqueness must be validated inside lock
- Collision detection required
- Never fallback to random strings on collision

---

# 5. Current Implementation Status

The OQM backend currently uses **UUID-based IDs** via `Utilities.getUuid()` throughout.

**Foreign key relationships:**
- `camp_schedules.camp_id` → `camps.id`
- `trainee_registrations.camp_session_id` → `camp_schedules.id`
- `customer_event_schedules.event_id` → `customer_events.id`

Copilot must maintain consistency with this pattern unless explicitly directed to migrate.

---

# 6. Interaction With Other Skills

### **sheet-schema**
- Defines which column is the ID column
- Defines datatype (string)
- Defines required fields

### **gas-sheet-operations**
- Ensures IDs are written in correct column order
- Ensures IDs are written before dependent fields

### **gas-locking-and-concurrency**
- Ensures appropriate lock usage based on ID pattern
- UUIDs: locks optional for ID generation alone
- Timestamps: locks mandatory for ID generation

### **gas-validation-rules**
- Ensures ID uniqueness is validated (timestamp/incremental)
- Validates foreign key references

### **gas-backend-architecture**
- Ensures IDs are included in JSON responses

---

# 7. Prohibited Behavior

Copilot must not:

- generate IDs using Math.random()
- generate IDs using external UUID libraries (use Utilities.getUuid())
- generate IDs on the frontend for backend storage
- reuse IDs across different rows
- generate IDs based on user input
- generate IDs based on sheet row count alone
- modify existing IDs
- use non-deterministic custom patterns

---

# 8. Required Behavior for Copilot

When generating ID logic, Copilot must:

### For UUIDs:
- use `Utilities.getUuid()` exactly
- generate once per row
- write IDs before dependent fields
- return IDs as strings

### For timestamp/incremental:
- always generate inside lock
- always read existing IDs first
- always validate uniqueness
- always write IDs before dependent fields
- always return IDs as strings
- implement collision handling

### For all patterns:
- never modify existing IDs
- maintain consistency with current codebase pattern
- document pattern choice in code comments

---

# 9. Migration Guidance

**Changing ID patterns in production is high-risk.**

If migration is required:

1. Create backup of all sheets
2. Document all foreign key relationships
3. Write migration script with lock
4. Test on sheet copy first
5. Update all foreign keys atomically
6. Verify referential integrity
7. Update this SKILL.md to reflect new pattern

**Recommendation:** Only migrate if there is a compelling business requirement (e.g., sortable IDs without timestamps).

---

# 10. Future Extensions

ID formats may evolve. Copilot must not assume fixed patterns.

Any change to ID format must be reflected in this SKILL.md before Copilot is allowed to generate new ID logic.

When adding new patterns:
- Document trade-offs clearly
- Specify when to use
- Define atomicity requirements
- Update prohibited behaviors section

```