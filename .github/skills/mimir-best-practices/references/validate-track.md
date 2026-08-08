```markdown
---
name: validate-track
description: Validate a canonical Mimir track (spec.md, plan.md, approval-ledger.md, coordination.md, tasks/*.md) for drift, thin-plan discipline, packet continuity, and board-ownership alignment.
---

# Validate Track

Use to **evaluate** (and optionally **repair**) an existing Mimir track.

Common when:
- Track resumed after delay  
- Track edited manually  
- Track created outside `mimir-planner`

Aligned with canonical track contract:
- Lives under `./mimir/tracks/{track-name}/`  
- `spec.md`: durable intent + invariants + rubric  
- `plan.md`: thin topology (phases, tasks, dependencies, gates, replans)  
- `approval-ledger.md`: append-only human approval evidence  
- `coordination.md`: orchestrator-only board projection  
- `tasks/*.md`: authoritative packets (`Packet`, `Edges`, `Context`, `Validation`, `Handoff Contract`, `Board Delta`)  
- Packet-local detail stays in task files; `Board Delta` is the only path into `coordination.md`  
- Duplicate-semantic `spec.md` guidance = repairable defect  
- Generic handoff placeholders = repairable defect

## Inputs

Track argument: name or path.  
If none: pick active track (incomplete tasks) or most recently modified.

## Validation Goals

1. **Completeness** — canonical artifacts exist and executable  
2. **Drift awareness** — assumptions match repo  
3. **Alignment** — track matches principles + ownership contract  
4. **Packet continuity** — discover → planner → packets preserve same model  
5. **Board/evidence integrity** — thin plan, orchestrator-only board, approval-only ledger

## Phases

### Phase 0: Locate Track + Baseline

#### Task 0.1: Identify track folder
- Agent: discover  
- Output: track_name, track_path, existence of canonical artifacts, summary

#### Task 0.2: Fast integrity scan
- Agent: discover  
- Output: missing files, broken links, empty docs, thin-plan check, board ownership check, packet schema check, lessons.md presence, review artifacts presence

### Phase 1: Classify Track State

States:
- **FULLY_DONE** — all work done + verification complete  
- **PARTIALLY_DONE** — mixed completion  
- **NOT_STARTED** — artifacts exist, no execution  
- **NEEDS_REPAIR** — missing artifacts, wrong ownership, unstructured packets

#### Task 1.1: Determine completion shape
- Agent: discover  
- Output: task counts, incomplete tasks, status encoding, Board Delta usability

### Phase 1.5: Drift Detection

#### Task 1.5: Drift check
- Agent: discover  
- Output: drift_detected, affected tasks, what changed, recommended repairs

### Phase 2: Alignment Checks

#### Task 2.1: Architecture & boundary alignment
- Agent: discover  
- Output: violations, ownership-model issues, recommended changes

#### Task 2.2: Repo principle alignment
- Agent: discover  
- Output: missing constraints, mismatches with conventions

#### Task 2.3: Spec quality
- Agent: discover  
- Output:
  - canonical section ownership  
  - duplicate-semantic defect check  
  - presence of assumptions, anti-patterns, success criteria, litmus tests, rubric  
  - rubric distinction + completeness  
  - vertical-stack completeness  
  - wiring explicitness  
  - artifact-contract clarity  
  - improvements needed

#### Task 2.4: lessons.md validation (optional)
- Agent: discover  
- Output: format correctness, required fields, valid categories, advisory notes

#### Task 2.5: Packet-contract & evidence-boundary validation
- Agent: discover  
- Output:
  - thin-plan discipline  
  - approval-ledger correctness  
  - orchestrator-only coordination  
  - packet schema continuity  
  - exact artifact refs in `Handoff Contract`  
  - no generic placeholders  
  - Board Delta projectability  
  - review artifacts under `reviews/`  
  - lessons.md primary learning artifact  
  - continuous-learning log used only for durable-surface changes  
  - evidence shape compatible with future workflow

### Phase 3: State-Specific Validation

#### FULLY_DONE / PARTIALLY_DONE — Task 3.1: Implementation verification
- Agent: discover / test-engineer  
- Output: file existence, outcome alignment, packet evidence continuity, missing verification steps

#### NOT_STARTED — Task 3.2: Plan readiness
- Agent: discover  
- Output: Phase 0 presence, delegable tasks, explicit verification, thin-plan discipline, packet schema, exact artifact refs, Board Delta flow, stack completeness, wiring explicitness

#### NEEDS_REPAIR — Task 3.3: Repair-to-minimum-viable-track
- Agent: mimir-planner / discover  
- Output: minimally viable canonical artifacts, Phase 0, rebuilt packets, restored ownership boundaries

## Repair Rules (Minimal Changes)

1. Add missing canonical structure  
2. Make drift explicit  
3. Restore thin-plan discipline  
4. Restore orchestrator-only coordination  
5. Repair canonical section ownership  
6. Add/repair rubric  
7. Rebuild task packets  
8. Do not rewrite entire spec unless superseded  
9. Route closure-review repairs to owning slice first

If superseded: mark track and propose new one.

## Output Format (Validation Report)

1. **Validation Summary**  
2. **Track State**  
3. **Drift Analysis**  
4. **Alignment Scores** (Architecture, Principles, Spec Quality, Overall)  
5. **Issues & Recommendations**  
6. **Recommended Actions**  
7. **Packet Model Verdict**

Also confirm narrow evidence model:
- thin plan  
- approval-only ledger  
- orchestrator-only coordination  
- packet schema continuity  
- review artifacts under `reviews/`  
- lessons.md primary learning artifact  
- continuous-learning log used only for durable-surface changes

Record validation evidence in task packet or `reviews/` artifact; let Mimir project board changes.  
Do **not** append validation history into `plan.md`.

## Repo Context Files to Check

Discover dynamically:
- `docs/`  
- `README.md`  
- `AGENTS.md`  
- `coordination.md`  
- `tasks/*.md`  
- `mimir-orchestrator/agents/`  
- `skills/mimir-best-practices/references/create-mimir-track.md`

## Anti-Patterns

- Skipping drift analysis  
- Declaring “done” without verification  
- Treating `plan.md` as execution log  
- Accepting duplicate-semantic `spec.md` guidance  
- Missing/weak rubric  
- Generic task notes instead of packet schema  
- Generic handoff placeholders  
- Specialists editing `coordination.md`  
- Widening closure-review sweep before repairing owning slice  
- Vague verbs in plan  
- Plans without phases or parallel-work support
```
