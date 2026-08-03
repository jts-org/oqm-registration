```markdown
---
name: create-mimir-track
description: Create a drift-resistant Mimir track using canonical delegated-work topology: spec.md, plan.md, approval-ledger.md, coordination.md, tasks/*.md. Intent-first, architecture-before-action, and Phase 0 discovery are mandatory.
---

# Create Mimir Track

Use when initializing or refining a Mimir development track.

A **track** is a folder under `./mimir/tracks/{track-name}/` containing:

- `spec.md` — intent, invariants, architecture, rubric  
- `plan.md` — baseline topology: phases, tasks, dependencies, gates  
- `coordination.md` — live board projection (status, blockers, owners)  
- `tasks/*.md` — authoritative task packets  
- `approval-ledger.md` — append-only human approval evidence  
- `lessons.md` — created only after first correction

Works with `mimir-planner` and merges planner contract + track quality patterns.

## Core Principles

1. **Architecture Before Action** — Define boundaries, ports, mappings in `spec.md` before tasks.  
2. **Scope Challenge Before Commitment** — Validate framing; check “do nothing”; reuse patterns.  
3. **Intent Over Steps** — Write success criteria as verifiable questions; drift-resistant.  
4. **Mandatory Phase 0 Discovery** — Validate assumptions against codebase.  
5. **Constraint-Driven Implementation** — State forbidden actions to prevent leaks.  
6. **Verification Is Part of Design** — Track incomplete until verification defined.  
7. **Rubric as Judgment Model** — Quality evaluation beyond acceptance criteria.

## When to Create a Track

Use a formal track when work is:

- Medium (3–8 files, 2–3 concerns, discovery needed)  
- Large (>8 files, cross-cutting)  
- Architecturally sensitive  
- Delegated, approval-gated, or drift-prone

Small scope (1–3 files, single concern) may skip a track unless delegated.

## Track Naming

Pattern: `{feature-type}-{brief-description}`  
Optional suffix: `{YYYYMMDD}`

Examples:  
- `feature-context-engineering-index`  
- `fix-mkdocs-nav-regression`  
- `refactor-mimir-track-templates`

## Track Structure

```text
./mimir/tracks/{track-name}/
  spec.md
  plan.md
  approval-ledger.md
  coordination.md
  tasks/
    {task-id}-{task-name}.md
  lessons.md (optional)
```

Roles:

- `spec.md`: durable contract (scope, design, invariants, rubric)  
- `plan.md`: baseline topology (phases, tasks, gates)  
- `approval-ledger.md`: human approval evidence  
- `coordination.md`: live board (orchestrator-only)  
- `tasks/*.md`: authoritative packets  
- `lessons.md`: append-only corrections (created on first correction)

`continuous-learning.log.md` is repo-level, not part of tracks.

## lessons.md

Append-only real-time learning surface.

Format:
```markdown
# Lessons Learned - {Track Name}

## YYYY-MM-DDTHH:MM:SSZ [Category]
**What went wrong**: …
**What changed**: …
**Prevention**: …
```

Categories: Implementation, Testing, Architecture, Planning, Integration, Configuration, Requirements.

## Writing `spec.md`

Follow `mimir-planner` baseline (`Why`, `What`, `How`, `Principles`, `Design`, `Antipatterns`, `Success Criteria`, `Litmus Test`, `Rubric`, etc.).

### Canonical Section Homes

| Concern | Home | Notes |
|--------|------|-------|
| Problem framing, intent, scope challenge | `Why` | Keep rationale unified |
| Deliverables, boundaries | `What` | No verification or design rationale |
| Approach, assumptions, alternatives, risk | `How` | Assumptions must map to Phase 0 checks |
| Invariants, design rules | `Principles` | Durable rules only |
| Architecture, integration, component mapping | `Design` | Implementation-shaping structure |
| Terms, responsibilities | `Definitions` | Only when naming needs stabilization |
| Measurable outcomes | `Success Criteria` | Avoid verification steps here |
| Litmus questions | `Litmus Test` | Quick falsification questions |
| Quality judgment model | `Rubric` | Dimensions + excellent/poor + critical failures |
| Verification strategy | `Validation Rules` | How work is proven |
| Non-negotiable limits | `Constraints` | Bounds only |
| Evidence | `References` | No conclusions |

Avoid repeating concerns across sections.

### Selective Enrichments

- **Intent Statement** → `Why`  
- **Problem Breakdown** → `Why`  
- **Contextual Assumptions** → `How` (with Phase 0 verification)  
- **Scope Challenge** → `Why`  
- **Component Mapping** → `Design`  
- **Architectural Litmus Questions** → `Litmus Test`  
- **Alternative Approaches** → `How`  
- **Functional Litmus Tests** → `Litmus Test`  
- **Risk Assessment** → `How`  
- **Verification Strategy** → `Validation Rules`  
- **Rubric** → `Rubric`  
- **Requirements Quality Checkpoint** → optional (`requirements-engineering` skill)

Hard requirement: **file paths + line numbers** for patterns/integration points under `Design → Integration Points` and `References`.

## Writing `plan.md`

Planner-owned baseline topology. Not a live board.

### Requirements

- Numbered phases (`Phase 0`, `Phase 1`, …)  
- Consistent task index + dependencies  
- Each task: `Agent`, `Goal`, `Depends on`, `Outputs`, `Status: pending`

### Thin-Plan Rule

`plan.md` must NOT contain:

- execution notes  
- discovery context  
- blockers  
- validation logs  
- handoff narrative  

These belong in task packets or `coordination.md`.

## coordination.md

Live board projection (orchestrator-only). Contains:

- task status  
- owner  
- blockers  
- artifact pointers  
- next handoff

Specialists never edit it directly.

## tasks/*.md

Each task packet includes:

- `## Packet` — objective, owner, deliverables, acceptance  
- `## Edges` — dependencies, enabled tasks, governing surfaces  
- `## Context` — discovery seeds, anchors, decisions, evidence  
- `## Validation` — checks/commands/evidence  
- `## Handoff Contract` — upstream artifacts, downstream consumers, constraints  
- `## Board Delta` — status/blocker/artifact/handoff changes for projection

Keep `Board Delta` narrow; durable routing lives in `Handoff Contract`.

## Phase 0 Discovery & Drift Analysis

Mandatory first phase:

- Verify assumptions  
- Detect collisions (refactors, overlapping tracks, doc changes)  
- Replan if drift found  
- Confirm scope still valid

## Phased Execution

### Multi-layer (use tracer bullets)

**Phase 1: Tracer Bullet**  
- Full vertical slice: DB → service → API → UI → wiring  
- Wiring mandatory: API client, CORS, security, mapping  
- End with tracer validation (end-to-end)

**Phase 2: Expansion**  
- Parallel-safe; patterns proven

**Phase 3: Verification/Cleanup**

### Other work

- Phase 1: Foundation  
- Phase 2: Core  
- Phase 3: Integration  
- Phase 4: Verification

Each phase: state **Risk Level** + checkpoint task.

## Verification Planning

Add tasks that:

- Prove end-to-end path  
- Check likely regression  
- Confirm blast radius

Docs-only work still needs explicit validation (mkdocs build/serve, link check, sample agent run).

## Review & Completion Checkpoints

- Mark checkpoints as `enforce` or `consider`  
- Spec/intent review before plan hardening = enforce  
- Replan review = enforce  
- Track closure requires user ask before optional completion review + continuous-learning handoff

## Test/Verification Integration

Include explicit verification tasks even for docs-heavy work.

## Progressive Disclosure

Orchestrator:

- Keep only file paths in memory  
- Avoid loading full docs unless needed  
- Project `Board Delta` into `coordination.md`

Planner:

- Create track files  
- Return file paths + one-sentence summaries  
- Preserve discovery seeds in task packets  
- Do not create `lessons.md` upfront

Implementers:

- Read: `spec.md` → `coordination.md` → task file → dependency tasks → `plan.md` (only for baseline intent)  
- Update only assigned task packet  
- Append to `lessons.md` on correction

## Quick Checklist

- [ ] Track folder created  
- [ ] `spec.md` includes intent, invariants, assumptions, anti-patterns  
- [ ] `spec.md` includes file paths + line numbers  
- [ ] `spec.md` includes rubric  
- [ ] `plan.md` starts with Phase 0  
- [ ] `plan.md` uses phases + risk + checkpoints  
- [ ] `plan.md` stays topology-only  
- [ ] `coordination.md` exists  
- [ ] `tasks/*.md` include Packet/Edges/Context/Board Delta  
- [ ] `lessons.md` created on first correction  
- [ ] Planner output returns file paths only
```
