---
name: sheet-schema
description: >
  Provides the complete Google Sheets schema for the OQM application.
  Copilot must use this skill whenever it needs to understand sheet
  structures, column names, datatypes, foreign keys, or constraints
  when generating Apps Script, migration steps, validation logic,
  or data processing functions.
license: MIT
---

# Sheet Schema (OQM)

This skill defines the authoritative schema for all Google Sheets used
by the OQM application. Copilot must rely on this schema when writing
Apps Script, validating data, generating migrations, or interpreting
sheet contents.

Copilot must treat this schema as the **single source of truth** for:

- column order  
- column names  
- datatypes  
- required fields  
- foreign keys  
- constraints  
- relationships between sheets  

Copilot must never infer schema dynamically or assume alternative structures.

---

# 🔒 1. Schema Usage Rules (Copilot-only)

Copilot must:

- always use the exact column order defined here  
- never reorder columns  
- never infer schema from data  
- never use dynamic column detection  
- never use `getLastColumn()` or header scanning to guess schema  
- never invent new columns  
- never omit required columns  
- always validate required fields before writing  
- always map rows to objects using this schema  
- always write full rows matching this schema  
- always treat all sheet values as untrusted until validated  

These rules ensure consistency across all backend logic.

---

# 🔒 2. Stable Range Rules (Copilot-only)

Copilot must:

- always use stable column indexes (A=0, B=1, C=2, etc.)  
- never use dynamic detection of column positions  
- never rely on Sheets UI formatting  
- never assume column order differs from this schema  
- always skip header rows  
- always read full ranges using `getDataRange().getValues()`  

Stable ranges are required for concurrency safety and deterministic behavior.

---

# 🔒 3. Read → Validate → Write Rules (Copilot-only)

When interacting with any sheet:

1. **Read** using stable ranges  
2. **Validate** using schema constraints  
3. **Write** full rows in correct order  

Copilot must ensure:

- all read → validate → write sequences occur inside a lock  
- no writes occur without validation  
- no partial writes occur  
- no writes occur outside locks  
- no schema assumptions are made beyond what is defined here  

These rules integrate with `gas-sheet-operations` and `gas-locking-and-concurrency`.

---

# 🔒 4. Foreign Key Rules (Copilot-only)

Copilot must enforce:

- `coach_registrations.session_type` must match `sessions.session_type`  
- `camp_schedules.camp_id` must match `camps.id`  
- `trainee_registrations.camp_session_id` must match `camp_schedules.id`  
- `customer_event_schedules.event_id` must match `customer_events.id`  

Copilot must never generate code that:

- writes invalid foreign keys  
- assumes foreign key existence without validation  
- deletes referenced rows without cascade logic  

---

# 🔒 5. Required Field Rules (Copilot-only)

Copilot must enforce:

- all fields marked as required must be present  
- no required field may be undefined  
- no required field may be omitted from writes  
- timestamps must always be ISO‑8601  
- boolean fields must be true/false, never strings  

---

# 6. Sheet Definitions

(Existing schema tables preserved exactly as provided.)

## Sheet: `settings`
| Column | Name       | Type      |
|--------|------------|-----------|
| A      | id         | string    |
| B      | parameter  | string    |
| C      | value      | string    |
| D      | created_at | ISO-8601  |
| E      | updated_at | ISO-8601  |
| F      | purpose    | string    |

---

## Sheet: `coach_login`
| Column | Name         | Type      |
|--------|--------------|-----------|
| A      | id           | string    |
| B      | firstname    | string    |
| C      | lastname     | string    |
| D      | alias        | string    |
| E      | pin          | string    |
| F      | created_at   | ISO-8601  |
| G      | last_activity| ISO-8601  |

---

## Sheet: `trainee_login`
| Column | Name         | Type      |
|--------|--------------|-----------|
| A      | id           | string    |
| B      | firstname    | string    |
| C      | lastname     | string    |
| D      | age          | string    |
| E      | pin          | string    |
| F      | created_at   | ISO-8601  |
| G      | last_activity| ISO-8601  |

---

## Sheet: `sessions` (OQM-0007)
| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | session_type       | string   |
| C      | session_type_alias | string   |
| D      | start_date         | ISO-8601 |
| E      | end_date           | ISO-8601 |
| F      | created_at         | ISO-8601 |
| G      | updated_at         | ISO-8601 |

Notes:
- B: English session type name  
- C: Localized session type name  
- D/E: Active date range (YYYY-MM-DD)

---

## Sheet: `weekly_schedule` (OQM-0007)
| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | session_type       | string   |
| C      | weekdays_available | number   |
| D      | start_time         | time     |
| E      | end_time           | time     |
| F      | location           | string   |
| G      | active             | boolean  |
| H      | created_at         | ISO-8601 |
| I      | updated_at         | ISO-8601 |

Notes:
- C: Mon=0 … Sun=6, comma-separated for multiple days

---

## Sheet: `coach_registrations` (OQM-0007)
| Column | Name         | Type     |
|--------|--------------|----------|
| A      | id           | string   |
| B      | first_name   | string   |
| C      | last_name    | string   |
| D      | session_type | string   |
| E      | date         | ISO-8601 |
| F      | realized     | boolean  |
| G      | start_time   | time     |
| H      | end_time     | time     |
| I      | created_at   | ISO-8601 |
| J      | updated_at   | ISO-8601 |

Notes:
- D must match `sessions.session_type`
- G/H only for free/sparring

---

## Sheet: `camps` (OQM-0007)
| Column | Name       | Type     |
|--------|------------|----------|
| A      | id         | string   |
| B      | camp       | string   |
| C      | camp_alias | string   |
| D      | instructor | string   |
| E      | start_date | ISO-8601 |
| F      | end_date   | ISO-8601 |
| G      | created_at | ISO-8601 |
| H      | updated_at | ISO-8601 |

---

## Sheet: `camp_schedules` (OQM-0007)
| Column | Name         | Type     |
|--------|--------------|----------|
| A      | id           | string   |
| B      | camp_id      | string   |
| C      | session_name | string   |
| D      | date         | ISO-8601 |
| E      | start_time   | time     |
| F      | end_time     | time     |
| G      | created_at   | ISO-8601 |
| H      | updated_at   | ISO-8601 |

Notes:
- B references `camps.id`

---

## Sheet: `trainee_registrations` (OQM-0014)
| Column | Name            | Type     |
|--------|-----------------|----------|
| A      | id              | string   |
| B      | first_name      | string   |
| C      | last_name       | string   |
| D      | age_group       | string   |
| E      | underage_age    | number   |
| F      | session_type    | string   |
| G      | camp_session_id | string   |
| H      | date            | ISO-8601 |
| I      | start_time      | time     |
| J      | end_time        | time     |
| K      | realized        | boolean  |
| L      | created_at      | ISO-8601 |
| M      | updated_at      | ISO-8601 |

Notes:
- D: 'adult' | 'underage'
- G references `camp_schedules.id`

---

## Sheet: `customer_events` (OQM-0035)
| Column | Name        | Type     |
|--------|-------------|----------|
| A      | id          | string   |
| B      | event       | string   |
| C      | event_alias | string   |
| D      | instructor  | string   |
| E      | start_date  | ISO-8601 |
| F      | end_date    | ISO-8601 |
| G      | realized    | boolean  |
| H      | created_at  | ISO-8601 |
| I      | updated_at  | ISO-8601 |

---

## Sheet: `customer_event_schedules` (OQM-0035)
| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | event_id           | string   |
| C      | session_name       | string   |
| D      | session_name_alias | string   |
| E      | date               | ISO-8601 |
| F      | start_time         | time     |
| G      | end_time           | time     |
| H      | realized           | boolean  |
| I      | created_at         | ISO-8601 |
| J      | updated_at         | ISO-8601 |

---

# 7. Changelog, Migration, Deprecation, Localization

(Your original content preserved.)

---

# 8. Automatic References

Copilot must automatically use this sheet schema when generating or modifying
any logic that interacts with Google Sheets in the OQM application.

---

# 9. Required Behavior for Copilot

When generating code that reads or writes Sheets:

- use the correct sheet name  
- use the correct column order  
- use the correct field names  
- validate required fields  
- never invent columns  
- never assume a different schema  
- never reorder columns  
- never write partial rows  
- never read outside lock when result affects writes  
- never write secrets to Sheets  

---

# 10. Future Extensions

This schema describes the current sheet structure. Copilot must not assume
that sheets, columns, or types are fixed. New sheets or fields may be added
without breaking this skill.

