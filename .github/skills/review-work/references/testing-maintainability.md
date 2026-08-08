---
description: 'Testing and maintainability overlay for review-work. Use when the artifact must stay easy to verify, reason about, and change without fragile side effects.'
---

# Testing and Maintainability

## Concern and Activation Cues

Use this overlay when the artifact should support confident change rather than only present a one-time implementation or decision.

- new logic, abstraction, or structure increases future change surface
- tests, fixtures, examples, or acceptance checks are added or changed
- refactoring, reuse, or modularity claims are part of the rationale
- the artifact introduces coupling, branching, or hidden assumptions that may outlive the current change
- long-term clarity matters as much as immediate correctness

## Common Failure Modes

- Tests assert proxies, internals, or snapshots that fail to prove the real behavior.
- The artifact becomes harder to change because responsibilities, states, or rules are spread across too many places.
- Duplication hides as minor variation and raises future change cost.
- Names, examples, or structure make the current path seem clear while edge behavior stays implicit.
- One-off exceptions, flags, or branches solve the current case by making the next case harder.
- A maintainability claim is made without showing how future changes stay localized and testable.

## Evidence Cues

- test intent, fixture choice, and what each check is actually proving
- boundaries between responsibilities, modules, or decision points
- examples of edge cases, failure cases, and future-variant behavior
- signs that change must be repeated in multiple places
- invariants, comments, and naming that either clarify or obscure the design
- places where verification depends on hidden environment knowledge rather than local evidence

## Adversarial Prompts or Questions

- Which future change would force the most scattered edits?
- What behavior appears covered by tests but is only weakly implied?
- Where does the artifact optimize for today's case by increasing tomorrow's complexity?
- Which branch, flag, or exception is likely to become permanent debt?
- If a new contributor had to extend this safely, what would they most likely misunderstand?

## Narrow Escalation Hints

- Escalate when the unresolved concern depends on architectural ownership, hidden coupling outside the review boundary, or verification behavior that the available evidence cannot expose.
- Escalate when the key question is whether an existing test strategy or module boundary is intentionally constrained elsewhere.
- Do not escalate just because the artifact already shows brittle tests, scattered responsibility, or obvious duplication.
