# SKILL: Sheet Schema (example)

Sheet: `settings`

| Column | Name   | Type   |
|---|-------------|--------|
| A | id          | string |
| B | parameter   | string |
| C | value       | string |
| D | created_at  | ISO-8601 |

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

- `id` is UUIDv4 generated server-side.
- Update this doc if headers change.
