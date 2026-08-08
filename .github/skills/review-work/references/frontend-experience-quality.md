---
description: 'Frontend experience and quality overlay for review-work. Use when the artifact changes user flows, interaction states, accessibility, or the clarity of the interface.'
---

# Frontend Experience and Quality

## Concern and Activation Cues

Use this overlay when people interact directly with the artifact through screens, flows, forms, navigation, or content.

- the change alters user journeys, UI states, copy, or interaction patterns
- accessibility, responsive behavior, or keyboard and touch use matter to success
- the artifact depends on empty, loading, error, success, or recovery states
- trust, clarity, or user decision-making is shaped by what the interface shows or hides
- frontend behavior is documented through mocks, screenshots, components, or experience narratives

## Common Failure Modes

- The happy path is clear, but empty, loading, error, and recovery states are underspecified or misleading.
- Interface language, hierarchy, or feedback causes users to misunderstand what will happen next.
- Important actions or state changes are hard to notice, reverse, or confirm.
- Interaction works for one input mode, viewport, or ability level but degrades for others.
- Validation or guardrails appear only after the user has already made an avoidable mistake.
- The interface optimizes visual neatness while hiding operational risk, latency, or loss of work.

## Evidence Cues

- screen states, flow diagrams, annotated mocks, or component behavior notes
- copy, labels, validation messages, and confirmation text
- accessibility intent, focus order, input-mode coverage, and responsive behavior
- examples of success, empty, loading, error, and recovery paths
- places where users must trust hidden logic or inferred state
- evidence that the interface helps users avoid, detect, and recover from mistakes

## Adversarial Prompts or Questions

- Where does the user get surprised, trapped, or silently lose confidence?
- Which state is easiest to overlook but most likely to cause a bad decision?
- What happens when the user is slow, interrupted, offline, or wrong?
- Which action looks reversible but is not, or looks safe but has hidden cost?
- How would a keyboard-only, touch-only, or low-context user experience this path?

## Narrow Escalation Hints

- Escalate when the unresolved question depends on deeper accessibility, design-system, legal-content, or audience-research expertise that the artifact does not include.
- Escalate when the tradeoff is genuinely between competing user outcomes and the available evidence cannot establish which one matters more.
- Do not escalate just because the artifact already shows missing states, unclear feedback, or an obviously fragile user flow.
