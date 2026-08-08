---
description: 'Security and trust-boundary overlay for review-work. Use when the artifact changes exposure, privilege, identity, secrets, or boundaries between trusted and less-trusted actors.'
---

# Security and Trust Boundaries

## Concern and Activation Cues

Use this overlay when the artifact changes who can do what, what crosses a boundary, or what is treated as trusted.

- authentication, authorization, or privilege decisions change
- data, commands, or callbacks cross service, tenant, user, or network boundaries
- secrets, tokens, claims, or identity context are introduced, forwarded, or stored
- input from a less-trusted actor can influence writes, actions, or sensitive reads
- the design assumes an internal caller, private network, or trusted upstream without proving it

## Common Failure Modes

- Boundary assumptions stay implicit, so readers cannot tell where trust actually begins or ends.
- Access checks exist in one path but not in equivalent paths, retries, or fallback behavior.
- Identity or privilege is broadened in transit, such as forwarding a caller context without narrowing it.
- Sensitive operations rely on location, naming, or obscurity rather than an explicit trust decision.
- Errors, logs, or examples leak tokens, secrets, internal structure, or policy-sensitive details.
- Validation exists for well-formed input but not for malicious, cross-tenant, or replayed input.

## Evidence Cues

- stated trust assumptions and boundary diagrams
- permission rules, role mappings, and decision points
- examples of allowed and denied behavior
- secret-handling, token-lifetime, and claim-propagation notes
- error, logging, and audit examples around sensitive paths
- places where the artifact distinguishes trusted inputs from merely authenticated ones

## Adversarial Prompts or Questions

- How could a less-trusted actor achieve the same effect as a trusted one?
- Where does the artifact assume trust instead of proving it?
- If one boundary check fails open, what sensitive action or read becomes reachable?
- What could be replayed, forwarded, or tampered with while still looking legitimate?
- Which examples accidentally teach consumers to expose secrets, identifiers, or privileged behavior?

## Narrow Escalation Hints

- Escalate when the unresolved question depends on security-control interpretation, protocol details, or authority over trust ownership.
- Escalate when the artifact references cryptography, token semantics, or cross-boundary policy that cannot be judged from the available evidence.
- Do not escalate just to restate an already visible gap such as missing boundary checks, over-broad privilege, or secret leakage in examples.
