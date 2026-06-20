---
name: gas-date-and-time
description: >
  Rules for handling dates, times, timestamps, timezones, and ISO-8601
  serialization in the OQM Google Apps Script backend. Copilot must use this
  skill whenever generating or modifying date/time logic.
license: MIT
---

# GAS Date & Time Rules

This skill defines how Copilot must handle dates, times, timestamps, and
timezone‑sensitive operations in the OQM backend.  
All date/time logic must be **deterministic**, **ISO‑8601 compliant**, and
**Europe/Helsinki** aware.

Copilot must treat this skill as the authoritative source for all temporal
behavior.

---

# 1. Timezone Rules (Strict)

Copilot must:

- always assume **Europe/Helsinki** as the business timezone  
- never rely on the server’s default timezone  
- never assume UTC unless explicitly converting  
- always convert Date objects to ISO‑8601 strings before writing to Sheets  
- always parse ISO‑8601 strings when reading from Sheets  

### Required timezone behavior:

```js
const tz = "Europe/Helsinki";
```

Copilot must use this timezone for:

- formatting  
- parsing  
- comparisons  
- validation  
- session overlap checks  

---

# 2. ISO‑8601 Serialization Rules

All dates and times written to Sheets must be:

- ISO‑8601 date: `"YYYY-MM-DD"`  
- ISO‑8601 datetime: `"YYYY-MM-DDTHH:mm:ss.sssZ"`  
- time: `"HH:mm"` or `"HH:mm:ss"` depending on schema  

Copilot must never write:

- locale‑formatted dates  
- GAS Date objects directly  
- timestamps without timezone  
- ambiguous formats like `"1/2/2026"`  

### Required serialization pattern:

```js
// If you need an ISO Zulu (UTC) timestamp:
const isoUtc = Utilities.formatDate(dateObj, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");
// If you need Europe/Helsinki-local ISO datetime (no Z suffix):
const isoLocal = Utilities.formatDate(dateObj, "Europe/Helsinki", "yyyy-MM-dd'T'HH:mm:ss");
```

For date‑only fields:

```js
const isoDate = Utilities.formatDate(dateObj, "Europe/Helsinki", "yyyy-MM-dd");
```

---

# 3. Parsing Rules

When reading from Sheets:

- if value is a string → treat as ISO‑8601  
- if value is a number → treat as Google Sheets serial date  
- if value is empty → treat as null  

### Required parsing pattern:

```js
function parseSheetDate(value) {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "number") return new Date(Math.round((value - 25569) * 86400 * 1000));
  return null;
}
```

Copilot must never:

- assume Sheets stores dates as strings  
- assume Sheets stores dates as numbers  
- parse using locale formats  

---

# 4. Date & Time Validation Rules

Copilot must validate:

- date format is valid ISO‑8601  
- time format is valid (`HH:mm` or `HH:mm:ss`)  
- start_time < end_time  
- start_date ≤ end_date  
- date is within session/camp/event ranges  
- no overlapping sessions for same trainee/coach  

### Required behavior:

- all comparisons must use Date objects  
- all comparisons must be timezone‑aware  
- all validation must occur **inside locks** when writes occur  

---

# 5. Overlap Detection Rules

Copilot must detect overlaps using:

```js
const overlap = (startA < endB) && (startB < endA);
```

Rules:

- comparisons must use Date objects  
- comparisons must use Europe/Helsinki timezone  
- comparisons must include both date and time  
- comparisons must be strict (no equal endpoints unless allowed)  

Copilot must never:

- compare raw strings  
- compare times without dates  
- compare dates without times  

---

# 6. Timestamp Rules

Copilot must:

- always write `created_at` and `updated_at` in ISO‑8601  
- always update `updated_at` on modification  
- never modify `created_at`  
- generate timestamps **inside locks**  

### Required pattern:

```js
const now = new Date();
// Prefer explicit UTC for Z-suffixed timestamps:
const createdAtUtc = Utilities.formatDate(now, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");
// Or use Helsinki-local ISO without Z when storing local business-time:
const createdAtLocal = Utilities.formatDate(now, "Europe/Helsinki", "yyyy-MM-dd'T'HH:mm:ss");
```

---

# 7. Interaction With Other Skills

### **sheet-schema**
- Defines which fields are dates, times, or timestamps  
- Defines required formats  

### **gas-sheet-operations**
- Ensures dates/times are written in correct order  
- Ensures read → validate → write atomicity  

### **gas-validation-rules**
- Uses date/time rules for session overlap, age groups, and ranges  

### **gas-locking-and-concurrency**
- Ensures timestamp generation happens inside locks  

### **gas-response-format**
- Ensures date/time values in responses are ISO‑8601  

### **wire-react-to-gas**
- Ensures frontend receives consistent date/time formats  

---

# 8. Prohibited Behavior

Copilot must not:

- write locale-formatted dates  
- write GAS Date objects directly  
- write timestamps without timezone  
- write ambiguous formats  
- parse using locale formats  
- compare raw strings  
- generate timestamps outside locks  
- assume server timezone  
- assume Sheets stores dates in a specific format  

---

# 9. Required Behavior for Copilot

When generating date/time logic, Copilot must:

- always use Europe/Helsinki timezone  
- always serialize to ISO‑8601  
- always parse Sheets values safely  
- always validate date/time ranges  
- always detect overlaps correctly  
- always generate timestamps inside locks  
- always return ISO‑8601 values in API responses  

---

# 10. Future Extensions

Date/time rules may expand.  
Any change to date formats, timezone handling, or serialization must be added
here before Copilot is allowed to generate new date/time logic.

