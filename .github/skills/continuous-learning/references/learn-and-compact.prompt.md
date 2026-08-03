```markdown
---
name: learn-and-compact
description: Capture learnings from development sessions and compact instructions for optimal AI context.
---

# Learn and Compact

Skill-local reference copy of `ai-enabled-kickstart/learn-and-compact.prompt.md`.  
Used when continuous-learning is activated and detailed compaction workflow is required.

---

# Trust-Based Optimization Principle

**Instruction quality = (Correctness × Completeness) / Token Count**

Optimal instructions are:
- **Mandate-first** — front-load constraints  
- **Scannable** — tables + bullets  
- **Verification-enabled** — include runnable checks  
- **Trust-based** — “what/why”, not step-by-step scripts  

---

# Purpose

Continuous improvement loop that:
1. Captures learnings  
2. Updates mandates, patterns, anti-patterns  
3. Compacts instructions  
4. Validates quality  
5. Logs promoted/retracted changes in `continuous-learning.log.md`

---

# Optimization Priority Order

| Priority | Issue | Action |
|----------|-------|--------|
| 1 | Incorrect/outdated | Fix immediately |
| 2 | Missing critical context | Add |
| 3 | Redundant/verbose | Compact |
| 4 | Unclear trajectory | Improve actionability |

---

# Instruction File Locations

| Location | Purpose | Update When |
|----------|---------|-------------|
| `AGENTS.md` | Entry point: mandates + workflows | High-level changes |
| `[component]/AGENTS.md` | Component overrides | Component-specific |
| `.github/instructions/general/` | Enterprise standards | Stack/framework updates |
| `.github/instructions/project-specific/` | Project context | Architecture/domain changes |

**Rule:** `AGENTS.md` = navigation + mandates only. Details live in instruction files.

---

# CRITICAL: Read Instructions First

Before compacting:
1. Read root `AGENTS.md` (or legacy `.github/copilot-instructions.md`)  
2. Read component-specific `AGENTS.md`  
3. Read all `project-specific` instruction files  
4. Read all `general` instruction files  

Build full picture:
- List all instruction files  
- Identify gaps/overlaps  
- Note technologies/frameworks  
- Respect component overrides  

Do **not** skip — compaction requires full context.

---

# Workflow: Learn and Compact

## Phase 1: Capture Session Context
Gather 5–10 bullets:
- What was worked on  
- Problems encountered  
- Patterns discovered  
- Mandates violated/missing  
- Anti-patterns worth documenting  

---

## Phase 2: Categorize by Priority

| Type | Indicators | Action |
|------|-----------|--------|
| A Incorrect | Deprecated/wrong approach | Fix now |
| B Missing Mandate | Repeated constraint violations | Add to `AGENTS.md` |
| C Missing Anti-pattern | AI didn’t know to avoid something | Add to architecture instructions |
| D Clarification | Concept unclear | Enhance existing content |
| E Nice-to-have | Slight improvement | Add only if space allows |
| F Noise | Redundant/verbose | Remove |

---

## Phase 3: Map to Instruction Files

Decision tree:

```text
LEARNING
│
├─ Component-specific? → [component]/AGENTS.md
│
└─ Enterprise-wide?
    ├─ YES → .github/instructions/general/
    │     ├─ stack-specific
    │     ├─ testing
    │     └─ process
    │
    └─ Project-specific?
          ├─ architecture
          ├─ domain-model
          ├─ conventions
          └─ new category if needed
```

Multi-file updates allowed when perspectives differ.

---

## Phase 3.5: Repo Logging Rules

Append to `continuous-learning.log.md` **only when durable instruction surfaces changed**.

Append when:
- `AGENTS.md` or instruction files changed  
- Skill entrypoints updated  
- Durable rules added/removed/clarified  

Do **not** append when:
- No-op  
- Only track-local artifacts changed (`lessons.md`, `plan.md`, reviews)  
- Formatting-only edits  

### Log Format

Monthly buckets:

```markdown
## 2026-04

- 2026-04-09T14:32:00Z | event=promotion | track=mimir/tracks/{track} |
  lessons=mimir/tracks/{track}/lessons.md |
  surfaces=AGENTS.md;skills/example/SKILL.md |
  summary=Short description |
  why=Compressed reason |
  invoker=mimir
```

Rules:
- `event`: promotion | retraction  
- `surfaces`: only durable instruction/skill surfaces  
- `summary` + `why`: compressed  
- Never rewrite earlier entries; append corrections  

---

## Phase 4: Apply Updates with Compacting

### Pre-Edit Checks
- Check `.github/instructions/` standards  
- Remove duplication from `AGENTS.md`  
- Ensure `AGENTS.md` has Core Mandates section  

### Update Types

**Fix Incorrect**
```
Find outdated → replace → verify consistency
```

**Add Missing Mandate**
```
Add to AGENTS.md Core Mandates
Keep total mandates < 15
```

**Add Anti-pattern**
```
Add to architecture instructions:
- [Anti-pattern]: [Why] – [How to recognize]
```

**Clarify**
```
Enhance existing content
Compact while adding
```

**Remove Noise**
- Reduce verbose prose  
- Remove repeated concepts  
- Delete off-topic content  

### Compacting Rules

| Rule | Bad | Good |
|------|-----|------|
| One location per concept | Same info in 3 files | One file + references |
| Minimal examples | 10-line example | 1-line or none |
| Actionable > explanatory | Long rationale | Clear constraint |
| Hierarchy > flat | Many bullets | Grouped |
| Token budget | 50 tokens minor value | Add only if value > cost |

**Target:** ≥30% token reduction where feasible.

---

## Phase 5: Validation

Checklist:
- [ ] Correctness  
- [ ] Completeness  
- [ ] Compactness  
- [ ] Repo log appended only when required  
- [ ] `AGENTS.md` < 200 lines  
- [ ] Verification commands still valid  

---

# Special Cases

| Case | Action |
|------|--------|
| Conflicting info | Update all files to current reality |
| Enterprise standard changed | Update general → project-specific → entry point |
| File > 400 lines | Compact then split |
| New pattern | Add to conventions; update entry point only if fundamental |
| No-op | Do not log |
| Temporary workaround | Prefix `TEMPORARY:` + removal condition |
| New mandate | Add to `AGENTS.md` and remove duplicates |

---

# Output Format

```markdown
## Session: [summary]

### Changes Made
| File | Change | Net Lines |
|------|--------|----------|
| AGENTS.md | Added mandate #N | +2 |
| architecture.instructions.md | Added anti-pattern | +3 |
| continuous-learning.log.md | Promotion entry | +3 |
| conventions.instructions.md | Compacted naming | -15 |

**Total**: [+/- N lines]

### Deferred
- [Low priority item] – reason

### Verify
- [ ] Test AI on similar task
- [ ] AGENTS.md < 200 lines
- [ ] Repo log untouched for no-op
- [ ] No contradictions
```

---

# When to Run

| Must | Should | Don’t |
|------|--------|-------|
| After >2 days feature work | End of sprint | Trivial changes |
| AI repeatedly fails same concept | After onboarding gaps | No AI issues |
| Important gotchas discovered | Instructions feel bloated | Just to “review” |

---

# Success Metrics

**Good session:** 2–5 learnings captured, net token neutral/negative, no incorrect info.  
**Great session:** Same + significant token savings + clearer entry points + improved future agent performance.
```
