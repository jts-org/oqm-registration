# SKILL: Sheet Schema

Sheet: `settings`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | parameter   | string |
| C | value       | string |
| D | created_at  | ISO-8601 |
| E | updated_at  | ISO-8601 |
| f | purpose  | string |

Sheet: `coach_login`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | firstname   | string |
| C | lastname    | string |
| D | alias       | string |
| E | pin         | string |
| F | created_at  | ISO-8601 |
| G | last_activity | ISO-8601 |

Sheet: `trainee_login`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | firstname   | string |
| C | lastname    | string |
| D | age         | string |
| E | pin         | string |
| F | created_at  | ISO-8601 |
| G | last_activity | ISO-8601 |

Sheet: `sessions` (updated OQM-0007)

| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | session_type       | string   |
| C      | session_type_alias | string   |
| D      | start_date         | ISO-8601 |
| E      | end_date           | ISO-8601 |
| F      | created_at         | ISO-8601 |
| G      | updated_at         | ISO-8601 |

- B: English session type name
- C: Localized session type name (e.g. Finnish)
- D/E: Session active date range in format 'YYYY-MM-DD'

Sheet: `weekly_schedule` (updated OQM-0007)

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

- B: English session type name (matches session_type in sessions sheet)
- C: Weekday(s) as Mon=0…Sun=6; comma-separated for multiple days (e.g. "1,3" = Tue+Thu)

Sheet: `coach_registrations` (new OQM-0007)

| Column | Name          | Type     |
|--------|---------------|----------|
| A      | id            | string   |
| B      | first_name    | string   |
| C      | last_name     | string   |
| D      | session_type  | string   |
| E      | date          | ISO-8601 |
| F      | realized      | boolean  |
| G      | start_time    | time     |
| H      | end_time      | time     |
| I      | created_at    | ISO-8601 |
| J      | updated_at    | ISO-8601 |

- D: must match a session_type value in the `sessions` sheet
- E: date in 'YYYY-MM-DD' format
- G/H: only set for free/sparring sessions; empty for regular scheduled sessions

Sheet: `camps` (new OQM-0007)

| Column | Name          | Type     |
|--------|---------------|----------|
| A      | id            | string   |
| B      | camp          | string   |
| C      | camp_alias    | string   |
| D      | instructor    | string   |
| E      | start_date    | ISO-8601 |
| F      | end_date      | ISO-8601 |
| G      | created_at    | ISO-8601 |
| H      | updated_at    | ISO-8601 |

- B: English camp name
- C: Localized camp name (e.g. Finnish)

Sheet: `camp_schedules` (new OQM-0007)

| Column | Name          | Type     |
|--------|---------------|----------|
| A      | id            | string   |
| B      | camp_id       | string   |
| C      | session_name  | string   |
| D      | date          | ISO-8601 |
| E      | start_time    | time     |
| F      | end_time      | time     |
| G      | created_at    | ISO-8601 |
| H      | updated_at    | ISO-8601 |

- B: foreign key referencing `camps.id`
- D: date in 'YYYY-MM-DD' format

## Changelog
Track all schema changes here with date and reason.

| Date       | Sheet              | Change                                      | Reason    |
|------------|--------------------|---------------------------------------------|-----------|
| 2026-03-09 | sessions           | Added session_type_alias, created_at, updated_at; renamed course→session_type | OQM-0007  |
| 2026-03-09 | weekly_schedule    | Renamed session→session_type, weekday→weekdays_available (now comma-sep); added created_at, updated_at | OQM-0007  |
| 2026-03-09 | coach_registrations | New sheet                                  | OQM-0007  |
| 2026-03-09 | camps              | New sheet                                   | OQM-0007  |
| 2026-03-09 | camp_schedules     | New sheet                                   | OQM-0007  |

## Migration Steps
Document steps for migrating data when columns change.
Note how to handle deprecated fields and update affected code.

## Deprecation Policy
Mark deprecated fields in the schema table.
Remove deprecated fields only after migration and documentation.

## Localization
If storing localized content, specify language code in the schema and document fallback behavior. For columns or data that are language-dependent, clearly indicate how to store and retrieve localized values.
