---
description: 'Data and state-safety overlay for review-work. Use when the artifact changes writes, migrations, retries, state transitions, or rollback behavior.'
---

# Data and State Safety

## Concern and Activation Cues

Use this overlay when the artifact can change what state exists, when it changes, or whether it can be repaired.

- writes, deletes, migrations, or backfills are introduced or changed
- retries, asynchronous delivery, or reconciliation can replay or reorder work
- partial updates, derived state, caches, or projections can diverge from the source of truth
- rollback, restore, or recovery behavior is claimed or implied
- invariants, uniqueness rules, or lifecycle transitions matter to correctness

## Common Failure Modes

- Duplicate, reordered, or delayed work creates an unsafe state transition.
- Partial success leaves state split across stores, services, or projections.
- Rollback exists on paper but does not actually restore the prior state or semantics.
- Derived views, caches, or generated outputs drift because invalidation or rebuild rules are unclear.
- The artifact assumes a safe default for missing, null, stale, or already-processed data without proving it.
- Invariants are described informally but not protected at the decision points that matter.

## Evidence Cues

- before-and-after records, state diagrams, and transition rules
- idempotency, retry, and replay expectations
- migration, backfill, rollback, and reconciliation notes
- invariant statements, uniqueness assumptions, and failure-handling examples
- sample records that show missing, duplicated, stale, or conflicting states
- explicit ownership of the source of truth versus derived copies

## Adversarial Prompts or Questions

- What happens if the same input arrives twice, late, or out of order?
- Where could a partial failure leave state that looks valid but is semantically wrong?
- Which rollback path restores data shape but not meaning?
- What stale or derived state could survive after the main write path changes?
- If an invariant is violated once, how would the artifact detect, contain, or repair it?

## Narrow Escalation Hints

- Escalate when the unresolved question depends on storage-engine semantics, migration authority, or operational cutover knowledge that is absent from the artifact.
- Escalate when state safety depends on hidden reconciliation processes or recovery guarantees that the available evidence cannot confirm.
- Do not escalate merely because the artifact already shows missing rollback logic, unclear idempotency, or unprotected invariants.
