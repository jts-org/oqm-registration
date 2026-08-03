```markdown
---
name: continuous-learning
description: Capture high‑value learnings, promote reusable patterns into durable instruction surfaces, retract invalid guidance, and append compressed repo‑level promotion evidence when durable surfaces change.
license: Proprietary. LICENSE.txt has complete terms.
metadata:
  author: mimir-system
  version: "1.0.0"
---

# Continuous Learning

Entry point for converting session learnings into durable, compact guidance.  
Detailed compaction workflow lives in `references/learn-and-compact.prompt.md`.

Keep this skill short, mandate‑first, and composable.

---

## 1. When To Use

Trigger this skill when:

- Non‑trivial feature or refactor work completed  
- Agents repeated the same mistake or violated a constraint  
- New reusable pattern, convention, or gotcha discovered  
- Instructions feel outdated, noisy, contradictory, or duplicated  
- Track completion produced `lessons.md` with reusable learnings  

---

## 2. What This Skill Does

1. Captures learnings in `mimir/tracks/{track}/lessons.md`  
2. Filters for reusable, high‑signal guidance  
3. Promotes compact rules into `AGENTS.md` or instruction files  
4. Retracts outdated or invalidated guidance  
5. Appends one compressed event to repo‑root `continuous-learning.log.md` when durable surfaces changed  
6. Creates or updates skills when a pattern deserves its own reusable reference  

---

## 3. Two Layers

### Layer 1: Capture
- Record corrections, decisions, discoveries, and gotchas in `lessons.md` during execution.  
- Capture proactively, not only after user corrections.

### Layer 2: Curate
- Promote only reusable patterns into instruction files.  
- Keep `lessons.md` as the primary learning artifact.  
- Repo‑root log is for **promotion/retraction evidence only**.

---

## 4. Core Decision Rules

- Promote rules that prevent repeated mistakes or clarify constraints.  
- Retract rules that are outdated, disproven, or replaced.  
- Do not promote one‑off fixes unless they generalize.  
- One authoritative location per concept; reference instead of duplicating.  
- Append repo‑log entry **only** when durable surfaces changed.  
- No repo‑log entries for:
  - no‑op runs  
  - track‑only captures  
  - review artifacts  
  - formatting‑only churn  

---

## 5. References

- **learn-and-compact.prompt.md**  
  Full workflow: read instructions → categorize learnings → compact → validate → log.

- **mimir-best-practices/references/error-recovery.md**  
  Protocol for proactive lesson capture, stop‑and‑replan triggers, and re‑entry cycles.

---

## 6. Minimal Workflow

1. Gather input from:
   - `lessons.md`  
   - session observations  
   - current instruction surfaces  

2. Separate reusable guidance from track‑local noise.  
3. Run the learn‑and‑compact workflow.  
4. Append one compressed repo‑log entry **only** if durable surfaces changed.  
5. Update only the correct files; keep entry points lean.  
6. Report what changed and what was intentionally deferred.

---

## 7. Outputs

- Updated `AGENTS.md` or instruction files  
- New or revised skills when patterns deserve a home  
- Updated repo‑root `continuous-learning.log.md` when promotion/retraction occurred  
- Compacted guidance with reduced duplication  
- Short summary of promoted, removed, or deferred items  

---

## 8. Integration Notes

- This skill pairs with Mimir’s mandatory Learning Phase at track completion.  
- All orchestrators invoking this skill must follow the same repo‑log behavior.  
- Agents should capture learnings proactively during execution.  
- Re‑entry cycles process only new learnings since the previous pass.

---

## 9. Success Criteria

- Instruction quality improves without expanding into noisy prose.  
- Entry‑point files remain concise and navigational.  
- High‑value learnings become easier for future agents to apply.  
- Repo‑log stays append‑only, month‑bucketed, and limited to durable changes.  
- Invalid guidance does not remain in circulation.

Keep the entry point compact. Put detailed execution guidance in `references/`.
```
