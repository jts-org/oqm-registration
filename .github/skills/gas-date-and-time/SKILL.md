```markdown
---
name: gas-date-and-time
description: Rules for handling dates, times, timestamps, timezones, and ISO‑8601 serialization in the OQM GAS backend. Copilot must apply this skill whenever generating or modifying date/time logic.
license: MIT
---

# GAS Date & Time Rules

Authoritative temporal model for the OQM backend.  
All date/time logic must be **deterministic**, **ISO‑8601 compliant**, and **Europe/Helsinki** aware.

---

## 1. Timezone Rules (Strict)

Copilot must:
- always use **Europe/Helsinki** as business timezone  
- never rely on server default timezone  
- never assume UTC unless explicitly converting  
- always convert Date objects to ISO‑8601 before writing to Sheets  
- always parse ISO‑8601 when reading from Sheets  

Required timezone constant:
```js
const tz = "Europe/Helsinki";
```

Timezone applies to:
- formatting  
- parsing  
- comparisons  
- validation  
- session overlap checks  

---

## 2. ISO‑8601 Serialization Rules

All dates/times written to Sheets must be:

- date: `"YYYY-MM-DD"`  
- datetime (UTC): `"YYYY-MM-DDTHH:mm:ss.sssZ"`  
- datetime (local): `"YYYY-MM-DDTHH:mm:ss"`  
- time: `"HH:mm"` or `"HH:mm:ss"` per schema  

Copilot must never write:
- locale-formatted dates  
- raw GAS Date objects  
- timestamps without timezone  
- ambiguous formats (`"1/2/2026"`, `"2.1.26"`, etc.)

Required patterns:
```js
// UTC Zulu timestamp
const isoUtc = Utilities.formatDate(dateObj, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");

// Helsinki-local ISO datetime (no Z)
const isoLocal = Utilities.formatDate(dateObj, "Europe/Helsinki", "yyyy-MM-dd'T'HH:mm:ss");

// Date-only
const isoDate = Utilities.formatDate(dateObj, "Europe/Helsinki", "yyyy-MM-dd");
```

---

## 3. Parsing Rules

When reading from Sheets:

- string → treat as ISO‑8601  
- number → treat as Google Sheets serial date  
- empty → null  

Required parsing:
```js
function parseSheetDate(value) {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  return null;
}
```

Copilot must never:
- assume Sheets stores dates as strings  
- assume Sheets stores dates as numbers  
- parse using locale formats  

---

## 4. Date & Time Validation Rules

Copilot must validate:
- ISO‑8601 date format  
- ISO‑8601 time format  
- `start_time < end_time`  
- `start_date ≤ end_date`  
- date within session/camp/event ranges  
- no overlapping sessions for same trainee/coach  

Rules:
- comparisons must use Date objects  
- comparisons must be timezone-aware  
- validation must occur **inside locks** when writes occur  

---

## 5. Overlap Detection Rules

Required overlap logic:
```js
const overlap = (startA < endB) && (startB < endA);
```

Rules:
- comparisons must use Date objects  
- comparisons must use Europe/Helsinki timezone  
- comparisons must include both date and time  
- comparisons must be strict unless schema allows equality  

Copilot must never:
- compare raw strings  
- compare times without dates  
- compare dates without times  

---

## 6. Timestamp Rules

Copilot must:
- always write `created_at` and `updated_at` in ISO‑8601  
- always update `updated_at` on modification  
- never modify `created_at`  
- generate timestamps **inside locks**  

Required patterns:
```js
const now = new Date();

// UTC Z-suffix
const createdAtUtc = Utilities.formatDate(now, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");

// Helsinki-local business-time
const createdAtLocal = Utilities.formatDate(now, "Europe/Helsinki", "yyyy-MM-dd'T'HH:mm:ss");
```

---

## 7. Interaction With Other Skills

### sheet-schema
Defines which fields are dates, times, timestamps, and required formats.

### gas-sheet-operations
Ensures correct read → validate → write order and atomicity.

### gas-validation-rules
Uses date/time rules for session overlap, age groups, ranges.

### gas-locking-and-concurrency
Ensures timestamp generation and writes occur inside locks.

### gas-response-format
Ensures API responses return ISO‑8601 values.

### wire-react-to-gas
Ensures frontend receives consistent date/time formats.

---

## 8. Prohibited Behavior

Copilot must not:
- write locale-formatted dates  
- write raw GAS Date objects  
- write timestamps without timezone  
- write ambiguous formats  
- parse using locale formats  
- compare raw strings  
- generate timestamps outside locks  
- assume server timezone  
- assume Sheets stores dates in a specific format  

---

## 9. Required Behavior for Copilot

Copilot must:
- always use Europe/Helsinki timezone  
- always serialize to ISO‑8601  
- always parse Sheets values safely  
- always validate date/time ranges  
- always detect overlaps correctly  
- always generate timestamps inside locks  
- always return ISO‑8601 values in API responses  

---

## 10. Future Extensions

Date/time rules may expand.  
Any change to formats, timezone handling, or serialization must be added here before Copilot may generate new date/time logic.
```
