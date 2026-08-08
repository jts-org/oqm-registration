---
description: 'Contracts and compatibility overlay for review-work. Use when the artifact defines or changes behavior that other humans or systems rely on.'
---

# Contracts and Compatibility

## Concern and Activation Cues

Use this overlay when the artifact changes the meaning, shape, or guarantees of an interface or published behavior.

- API, event, schema, configuration, or document examples define expected behavior
- field meaning, defaults, optionality, ordering, or error semantics change
- old and new producers or consumers may coexist during rollout
- examples, documentation, or migration notes function as part of the contract
- backward compatibility, versioning, or deprecation is relevant to safety

## Common Failure Modes

- A change looks additive but silently breaks existing consumers or author expectations.
- Absent, null, empty, and default values are treated as interchangeable when they are not.
- Examples contradict the stated contract and become the behavior people actually implement against.
- The artifact widens accepted input without preserving output or error guarantees.
- Compatibility is claimed globally even though it only holds for one rollout path or one consumer class.
- Migration or deprecation guidance exists, but the safe coexistence window is undefined.

## Evidence Cues

- previous and proposed contract shape or example pairs
- compatibility notes, versioning statements, and deprecation language
- sample requests, responses, events, records, or configuration snippets
- explicit error behavior, status behavior, and fallback expectations
- rollout assumptions about mixed-version producers or consumers
- statements that distinguish supported behavior from incidental behavior

## Adversarial Prompts or Questions

- What breaks for a consumer that does nothing and keeps its current assumptions?
- Which value combinations still parse but now mean something different?
- Where do the examples teach a behavior the formal contract does not actually guarantee?
- Which mixed-version path is least obvious and most likely to fail silently?
- If compatibility depends on rollout order, where is that dependency made explicit?

## Narrow Escalation Hints

- Escalate when compatibility depends on external consumer behavior, domain ownership, or rollout guarantees that are not visible in the artifact.
- Escalate when the unresolved question is whether a behavior is intentionally supported or merely tolerated by current implementations.
- Do not escalate when the breaking change is already evident from contradictory examples, incompatible semantics, or missing coexistence guidance.
