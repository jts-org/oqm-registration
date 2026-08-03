```markdown
---
name: mimir-best-practices
description: >
  Best practices for Mimir planning, review-initiation policy, checkpoint
  validation, error recovery, architecture design, documentation, and
  architecture review. Use for shaping spec.md/plan.md, pre-planning
  architecture, deciding review checkpoints, validating phase transitions,
  recovering from corrections or drift, validating scope before implementation,
  comparing options, and making plans drift-resistant with explicit constraints,
  failure modes, and verification strategy. Activate for medium/large work,
  cross-cutting changes, architecture-sensitive work, plan corrections, or
  underspecified planning.
license: Proprietary. See LICENSE.txt.
metadata:
  author: mimir-system
  version: "1.0.0"
---

# Mimir Best Practices

Use this skill to keep Mimir planning compact, explicit, and resistant to drift.

Apply it when you need to:

- Challenge scope before locking a track.
- Shape an optional `.github/mimir-workflow.md` contract without weakening Mimir invariants.
- Define architecture before planning commits to unstable boundaries or integrations.
- Compare alternatives before implementation.
- Decide review enforcement vs. consideration vs. deferral.
- Validate checkpoints before continuing execution.
- Recover cleanly from corrections, drift, or re-planning.
- Make constraints, failure modes, and verification explicit.
- Require specs to include an evaluation rubric for reviewer judgment.
- Close tracks with a user ask before optional completion review and continuous-learning.
- Design or review architecture with boring-by-default engineering lenses.

## References

### Track Management
- **create-mimir-track** — Drift-resistant tracks with scope challenge, alternatives, and verification strategy.
- **review-initiation-policy** — Review matrix, override rules, ownership boundaries, and completion handoff.
- **validate-track** — Drift and consistency validation.
- **checkpoint-validation** — Phase completion verification.
- **error-recovery** — Correction and re-planning protocol.

### Workflow Contracts
- **workflow-contract** — Canonical guidance for `.github/mimir-workflow.md`: bounded v1 semantics, safe tightening, fallback rules.
- **workflow-contract-template** — Copy-ready default template preserving dynamic mode; shows opt-in tightening patterns.
- **applying-analysis-to-workflow-contract** — Map refinement findings to minimal contract changes for stronger context or artifact requirements.
- **workflow-contract-example** — Extended example with stronger context and planning-artifact customization.

### Architecture
- **adr-process** — ADR template and process.
- **architecture-design** — Pre-planning design guidance: options, stance selection, compact planner handoff.
- **architecture-review** — Architecture review using blast radius, reversibility, and failure-mode lenses.

## Related Skills
- **requirements-engineering** — EARS-based requirements authoring and review (ambiguity, consistency, completeness). Referenced from track creation, review initiation, and error recovery.
```
