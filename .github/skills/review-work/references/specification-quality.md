---
description: 'Specification quality overlay for review-work. Use when reviewing specs, plans, requirements, or instruction artifacts that drive implementation behavior.'
---

# Specification Quality

## Concern and Activation Cues

Use this overlay when the artifact is intended to guide future implementation or review decisions.

- scope, acceptance criteria, or constraints are defined in prose
- requirements are ambiguous, conflicting, or underspecified
- quality expectations depend on rubric, examples, or edge-case handling
- downstream teams rely on this artifact as a source of truth

## Common Failure Modes

- Goals are clear but acceptance criteria are not testable.
- Acceptance criteria exist but do not map to user or system intent.
- Constraints are implicit, contradictory, or scattered across sections.
- Tasks are written as outputs, not outcomes, and permit low-quality implementations.
- Rubric criteria duplicate checklists and fail to differentiate excellent vs poor outcomes.
- Critical failure conditions are not stated, so unsafe outcomes can pass.

## Evidence Cues

- explicit success criteria and validation rules
- stated constraints and non-goals
- examples showing expected and prohibited behavior
- traceability from intent to criteria to verification
- risk statements and mitigation expectations

## Adversarial Prompts or Questions

- Could two competent implementers produce materially different behavior from this spec?
- Which acceptance item cannot be objectively verified today?
- What high-risk edge case is missing from criteria or validation rules?
- Where does this artifact allow scope creep without saying so?
- What would a low-quality but checklist-passing implementation look like?

## Narrow Escalation Hints

- Escalate when domain rules, compliance, or legal interpretation is required.
- Escalate when unresolved ambiguity changes architecture or data contracts.
- Do not escalate when gaps are local, evidence-backed, and directly fixable in the artifact.
