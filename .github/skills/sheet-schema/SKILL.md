```markdown
---
name: sheet-schema
description: Authoritative Google Sheets schema for the OQM backend. Copilot must use this skill whenever generating Apps Script, validation logic, migrations, or data-processing functions.
license: MIT
---

# Sheet Schema (OQM)

Single source of truth for all Google Sheets used by the OQM backend.  
Defines column order, names, datatypes, required fields, foreign keys, and constraints.  
Copilot must never infer schema dynamically.

---

## 1. Schema Usage Rules (Copilot-only)

Copilot must use exact column order from this file, map rows using stable indexes, validate required
fields before writes, and write full rows only.

Copilot must not reorder/invent/omit columns, infer schema from data, or use dynamic detection
(`getLastColumn()`, header scans).

---

## 2. Stable Range Rules (Copilot-only)

Use stable column indexes (A=0, B=1, ...), skip header rows, and read full ranges via
`getDataRange().getValues()`.

Do not rely on UI formatting or alternative column order assumptions.

Stable ranges ensure deterministic, concurrency-safe behavior.

---

## 3. Read → Validate → Write Rules (Copilot-only)

All sheet interactions must follow:

1. **Read** using stable ranges  
2. **Validate** using schema constraints  
3. **Write** full rows in correct order  

Rules:
- read → validate → write must occur **inside one lock**
- no writes without validation
- no partial writes
- no writes outside locks
- no schema assumptions beyond this file

Integrates with `gas-sheet-operations` and `gas-locking-and-concurrency`.

---

## 4. Foreign Key Rules (Copilot-only)

Enforce:

- `coach_registrations.session_type` → `sessions.session_type`  
- `camp_schedules.camp_id` → `camps.id`  
- `trainee_registrations.camp_session_id` → `camp_schedules.id`  
- `customer_event_schedules.event_id` → `customer_events.id`  

Do not write invalid foreign keys, assume key existence without validation, or delete referenced rows
without cascade logic.

---

## 5. Required Field Rules (Copilot-only)

Enforce:
- required fields present and non-undefined
- timestamps in ISO-8601
- booleans as true/false, never strings

---

# 6. Sheet Definitions

All schemas preserved exactly.

---

## Sheet: `settings`
| Col | Name       | Type     |
|-----|------------|----------|
| A   | id         | string   |
| B   | parameter  | string   |
| C   | value      | string   |
| D   | created_at | ISO-8601 |
| E   | updated_at | ISO-8601 |
| F   | purpose    | string   |

---

## Sheet: `coach_login`
| Col | Name         | Type     |
|-----|--------------|----------|
| A   | id           | string   |
| B   | firstname    | string   |
| C   | lastname     | string   |
| D   | alias        | string   |
| E   | pin          | string   |
| F   | created_at   | ISO-8601 |
| G   | last_activity| ISO-8601 |

---

## Sheet: `trainee_login`
| Col | Name         | Type     |
|-----|--------------|----------|
| A   | id           | string   |
| B   | firstname    | string   |
| C   | lastname     | string   |
| D   | age          | string   |
| E   | pin          | string   |
| F   | created_at   | ISO-8601 |
| G   | last_activity| ISO-8601 |

---

## Sheet: `Messages` (OQM-0046)
| Col | Name      | Type     |
|-----|-----------|----------|
| A   | id        | string   |
| B   | timestamp | ISO-8601 |
| C   | type      | string   |
| D   | from      | string   |
| E   | message   | string   |

---

## Sheet: `sessions` (OQM-0007)
| Col | Name               | Type     |
|-----|--------------------|----------|
| A   | id                 | string   |
| B   | session_type       | string   |
| C   | session_type_alias | string   |
| D   | start_date         | ISO-8601 |
| E   | end_date           | ISO-8601 |
| F   | created_at         | ISO-8601 |
| G   | updated_at         | ISO-8601 |

---

## Sheet: `weekly_schedule` (OQM-0007)
| Col | Name               | Type     |
|-----|--------------------|----------|
| A   | id                 | string   |
| B   | session_type       | string   |
| C   | weekdays_available | number   |
| D   | start_time         | time     |
| E   | end_time           | time     |
| F   | location           | string   |
| G   | active             | boolean  |
| H   | created_at         | ISO-8601 |
| I   | updated_at         | ISO-8601 |

---

## Sheet: `coach_registrations` (OQM-0007)
| Col | Name         | Type     |
|-----|--------------|----------|
| A   | id           | string   |
| B   | first_name   | string   |
| C   | last_name    | string   |
| D   | session_type | string   |
| E   | date         | ISO-8601 |
| F   | realized     | boolean  |
| G   | start_time   | time     |
| H   | end_time     | time     |
| I   | created_at   | ISO-8601 |
| J   | updated_at   | ISO-8601 |

---

## Sheet: `camps` (OQM-0007)
| Col | Name       | Type     |
|-----|------------|----------|
| A   | id         | string   |
| B   | camp       | string   |
| C   | camp_alias | string   |
| D   | instructor | string   |
| E   | start_date | ISO-8601 |
| F   | end_date   | ISO-8601 |
| G   | created_at | ISO-8601 |
| H   | updated_at | ISO-8601 |

---

## Sheet: `camp_schedules` (OQM-0007)
| Col | Name         | Type     |
|-----|--------------|----------|
| A   | id           | string   |
| B   | camp_id      | string   |
| C   | session_name | string   |
| D   | date         | ISO-8601 |
| E   | start_time   | time     |
| F   | end_time     | time     |
| G   | created_at   | ISO-8601 |
| H   | updated_at   | ISO-8601 |

---

## Sheet: `trainee_registrations` (OQM-0014)
| Col | Name            | Type     |
|-----|-----------------|----------|
| A   | id              | string   |
| B   | first_name      | string   |
| C   | last_name       | string   |
| D   | age_group       | string   |
| E   | underage_age    | number   |
| F   | session_type    | string   |
| G   | camp_session_id | string   |
| H   | date            | ISO-8601 |
| I   | start_time      | time     |
| J   | end_time        | time     |
| K   | realized        | boolean  |
| L   | created_at      | ISO-8601 |
| M   | updated_at      | ISO-8601 |

---

## Sheet: `customer_events` (OQM-0035)
| Col | Name        | Type     |
|-----|-------------|----------|
| A   | id          | string   |
| B   | event       | string   |
| C   | event_alias | string   |
| D   | instructor  | string   |
| E   | start_date  | ISO-8601 |
| F   | end_date    | ISO-8601 |
| G   | realized    | boolean  |
| H   | created_at  | ISO-8601 |
| I   | updated_at  | ISO-8601 |

---

## Sheet: `customer_event_schedules` (OQM-0035)
| Col | Name               | Type     |
|-----|--------------------|----------|
| A   | id                 | string   |
| B   | event_id           | string   |
| C   | session_name       | string   |
| D   | session_name_alias | string   |
| E   | date               | ISO-8601 |
| F   | start_time         | time     |
| G   | end_time           | time     |
| H   | realized           | boolean  |
| I   | created_at         | ISO-8601 |
| J   | updated_at         | ISO-8601 |

---

## Sheet: `sessions_schedule` (OQM-0042)
| Col | Name               | Type     |
|-----|--------------------|----------|
| A   | id                 | string   |
| B   | session_type       | string   |
| C   | session_type_alias | string   |
| D   | start_date         | ISO-8601 |
| E   | end_date           | ISO-8601 |
| F   | weekdays_available | string   |
| G   | start_time         | time     |
| H   | end_time           | time     |
| I   | location           | string   |
| J   | location_alias     | string   |
| K   | active             | boolean  |
| L   | created_at         | ISO-8601 |
| M   | updated_at         | ISO-8601 |

---

## 7. Changelog, Migration, Deprecation, Localization

(Original content preserved.)

---

## 8. Automatic References

Copilot must automatically use this schema for all backend logic interacting with Sheets.

---

## 9. Required Behavior for Copilot

Copilot must use correct sheet names/field names/column order, validate required fields, and avoid
partial writes.

Copilot must not invent/reorder columns, read outside locks when read results affect writes, or write
secrets to Sheets.

---

## 10. Future Extensions

Schema may expand.  
Copilot must not assume sheets, columns, or types are fixed.

```
