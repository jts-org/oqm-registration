---
description: 'Direct code review overlay for review-work. Use when the artifact is a diff, patch, or changed-file set and behavior impact must be evaluated from code evidence.'
---

# Direct Code Review

## Concern and Activation Cues

Use this overlay when review input is primarily executable changes.

- pull request diff or patch is the main artifact
- behavior change is inferred from code and tests
- risk depends on boundary interactions, not only local correctness
- verification claims rely on automated checks or repro steps

## Review Focus

Anchor findings to changed behavior, not style preference.

- intent vs implementation alignment
- boundary safety (APIs, schemas, auth, concurrency, side effects)
- failure modes and rollback expectations
- verification sufficiency (tests, logs, reproduction evidence)

## Common Failure Modes

- Correct local logic but broken contract at integration boundary.
- Happy-path tests pass while error and edge paths regress.
- Partial updates violate atomicity or leave state drift.
- Refactors alter behavior without explicit intent or tests.
- Validation occurs after side effects, enabling unsafe writes.

## Evidence Cues

- changed files and symbols with line anchors
- tests added/updated and observed failures before fix
- explicit mapping between acceptance criteria and assertions
- runtime logs, snapshots, or command output for risky paths

## Adversarial Prompts or Questions

- Which unchanged consumer breaks first if this contract shifts subtly?
- What state can become inconsistent if execution stops mid-path?
- Which error path is now reachable but untested?
- What regression would pass existing tests but fail in production?

## Narrow Escalation Hints

- Escalate to architecture review when boundary ownership is unclear.
- Escalate to test engineering when confidence depends on missing execution evidence.
- Do not escalate when a concrete, evidence-backed fix is already clear.
