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

Sheet: `sessions`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | course      | string |
| C | start_date  | ISO-8601 |
| D | end_date    | ISO-8601 |

Sheet: `weekly_schedule`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | session     | string |
| C | weekday     | number |
| D | start_time  | time |
| E | end_time    | time |
| F | location    | string |
| G | active    | boolean |

## Changelog
Track all schema changes here with date and reason.

## Migration Steps
Document steps for migrating data when columns change.
Note how to handle deprecated fields and update affected code.

## Deprecation Policy
Mark deprecated fields in the schema table.
Remove deprecated fields only after migration and documentation.

## Localization
If storing localized content, specify language code in the schema and document fallback behavior. For columns or data that are language-dependent, clearly indicate how to store and retrieve localized values.
