---
name: gas-id-generation
description: Deterministic, atomic, collision-safe ID generation rules for Google Sheets rows in the OQM GAS backend. Copilot must apply this skill whenever generating or modifying ID logic.
license: MIT
---

# GAS ID Generation

Authoritative ID generation model for OQM backend rows and foreign-key references.

## 1. Approved Formats

Use one of these string formats only:
- UUID (`Utilities.getUuid()`) - default
- Timestamp (`Date.now().toString()`) - only when sortable IDs are required
- Incremental (`(lastId + 1).toString()`) - only when strict sequencing is required
- Hybrid timestamp+counter - only when explicitly requested

Do not use random strings, `Math.random()`, frontend-generated IDs, or non-deterministic custom patterns.

## 2. Pattern Selection Rules

- Prefer UUID unless ordering/sequencing requirements force timestamp or incremental IDs.
- Keep IDs immutable after creation.
- Keep IDs as strings in storage and API responses.

## 3. Atomicity and Uniqueness

UUID:
- generate once per row
- write before dependent fields
- no collision loop required

Timestamp / Incremental:
- generate inside lock
- read existing IDs first
- validate uniqueness before write
- use collision handling for timestamp-based IDs

Never regenerate IDs for existing rows or generate IDs after partial writes.

## 4. Current Repository Default

Current implementation uses UUIDs (`Utilities.getUuid()`). Keep this default unless migration is explicitly requested.

Foreign-key consistency must be preserved for:
- `camp_schedules.camp_id` -> `camps.id`
- `trainee_registrations.camp_session_id` -> `camp_schedules.id`
- `customer_event_schedules.event_id` -> `customer_events.id`

## 5. Interaction With Other Skills

- `sheet-schema`: ID columns and types
- `gas-sheet-operations`: write ordering and row integrity
- `gas-locking-and-concurrency`: lock rules for timestamp/incremental patterns
- `gas-validation-rules`: uniqueness and foreign-key checks
- `gas-backend-architecture`: response-level ID exposure

## 6. Prohibited Behavior

Do not:
- use external UUID libraries
- generate IDs on frontend
- derive IDs from row count alone
- reuse or modify existing IDs
- fallback to random IDs when collisions occur

## 7. Migration Guidance

Changing ID patterns in production is high-risk. Minimum sequence:
1. Backup sheets
2. Map foreign keys
3. Implement lock-protected migration
4. Test on a copy
5. Apply atomic FK updates
6. Verify referential integrity
7. Update this skill

Migrate only for compelling business requirements.

## 8. Future Extensions

ID formats may evolve, but new patterns must be documented here before use.
