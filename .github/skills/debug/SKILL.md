```markdown
---
name: debug
description: Systematic debugging workflow for root‑cause analysis, reproduction, verification, and regression coverage. Use when tests fail, runtime errors appear, integrations break, or performance/stability regress.
metadata:
  author: mimir-system
  version: "1.0.0"
---

# Debug Skill

Debugging is disciplined root‑cause work, not symptom suppression.  
Follow evidence → isolate cause → implement smallest defensible fix → verify.

---

## 1. Activation Triggers

Use this skill when:
- tests fail (local or CI)  
- runtime errors, regressions, or integration failures appear  
- logs show symptoms but cause unknown  
- performance or stability degrade  
- investigation requires reproduction + proof

Skip when:
- root cause already known  
- work is simple follow‑through  
- task is explanatory, not diagnostic  

---

## 2. Operating Rules

1. Do not implement a fix until you can state the root cause.  
2. Keep symptom → evidence → hypothesis → root cause separate.  
3. Reproduce before fixing when feasible.  
4. Check environment sanity before deep tracing.  
5. Mark assumptions as verified or assumed.  
6. Use explicit predictions to test uncertain causal links.  
7. Reproduce the same path after the fix.  
8. Add/update regression coverage for recurring risks.  
9. If hypotheses stall, diagnose the stall instead of guessing.

---

## 3. Workflow

### Step 1 — Define the Symptom
- What failed, slowed, regressed, or behaved incorrectly?  
- Where was it observed?  
- What is the smallest reliable reproduction?

### Step 2 — Gather Evidence
- Read failing output fully.  
- Check recent changes + relevant code paths.  
- Confirm environment: branch, runtime, dependencies, env vars, stale artifacts.  
- Capture logs, traces, metrics, discriminating signals.

### Step 3 — Form & Rank Hypotheses
- State leading explanations explicitly.  
- List assumptions; mark verified vs assumed.  
- Prefer hypotheses explaining **all** evidence.  
- For uncertain links, state one prediction that must also be true.  
- Eliminate hypotheses with targeted checks.

### Step 4 — Isolate Root Cause
- Reproduce with minimal setup.  
- Trace symptom → underlying defect.  
- Stop when you can explain the full causal chain.

---

## 4. When Debugging Stalls

| Stall pattern | Likely gap | Next move |
| --- | --- | --- |
| Evidence conflicts with explanation | Wrong model or unchecked assumption | Re-read code path; restate verified facts; replace assumptions with checks |
| Issue appears only in one environment | Drift, timing, config, or data mismatch | Compare failing vs non‑failing environments |
| Change removes symptom but breaks prediction | Symptom relief, not root cause | Reopen causal chain; investigate upstream |
| Too many subsystems plausible | Scope too broad | Shrink reproduction; add boundary probe; gather discriminating signal |

---

## 5. Implement the Smallest Defensible Fix

- Change the cause, not the symptom.  
- Keep fix consistent with project patterns.  
- Avoid bundling unrelated cleanup.

---

## 6. Verify the Fix

- Re-run the original reproduction.
- Run closest regression checks.  
- Confirm predictions now hold.  
- Confirm logs/behavior/output match corrected causal story.  
- Note residual risk or unverified areas.

---

## 7. Reference Map

- `references/logs-access.md` — log discovery, filtering, correlation  
- `references/java-instrumentation.md` — JVM dumps, profiling, runtime inspection  

Add references only when reusable and the file exists.

---

## 8. When to Use (Automatic + Manual)

Automatic:
- test failures  
- CI failures  
- runtime exceptions  
- repeated log errors  
- unexplained regressions  

Manual:
- “debug this”  
- “find the root cause”  
- “fix the failing test”  
- “investigate these logs”

---

## 9. Common Bug Patterns

- wrong assumptions about input shape, timing, ordering, environment  
- stale state, cache, or configuration  
- incorrect boundary handling (null, empty, retries, timeouts, partial failure)  
- mismatch between test setup and production behavior  
- symptom-only fixes hiding real defects  

---

## 10. Integration with Agents

- **implement**: debug before patching; record root cause + verification in `plan.md`.  
- **test-engineer**: use same reproduction + verification path.  
- **mimir**: delegate with failure signal, affected files, reproduction steps.

---

## 11. Debug Report Format

```markdown
## Debug Report
**Symptom**: [what failed and where]  
**Evidence**: [logs, traces, diffs, tests, observations]  
**Hypotheses Considered**: [ranked list, assumptions checked, predictions used, ruled out]  
**Root Cause**: [defect + causal chain]  
**Fix**: [what changed + why it addresses the cause]  
**Reproduction**: [how issue was reproduced]  
**Verification**: [what now passes or behaves differently]  
**Regression Coverage**: [tests added or used]  
**Residual Risk**: [remaining uncertainty]

## Files Modified
- [file:line] – [change description]
```

---

## 12. Stop Conditions

- If reproduction or narrowing fails after ~3 hypothesis cycles:  
  report strongest evidence, failed hypotheses, stall reason, missing context.  
- If fix suppresses symptoms only: continue investigating.  
- If verification cannot prove the change: call it out explicitly.

---

## 13. Extending This Skill

Add a new reference only when:
- technique is genuinely reusable  
- top-level skill stays clear by delegating  
- reference remains general and tool-honest  

---

## 14. Best Practices

Do:
- read full failure signal  
- maintain clear chain: symptom → evidence → root cause → verification  
- preserve smallest reproduction  
- prefer one defensible fix over speculative edits  

Do not:
- shotgun debug  
- rely on intuition without evidence  
- call a symptom a root cause  
- skip verification  

---

## 15. Philosophy

Debugging is disciplined evidence work.  
Goal: understand why the signal existed and prove the cause was removed.

---

## Related Skills

- `continuous-learning` — promote recurring debug lessons  
- `techdebt-detection` — identify code causing repeated hard-to-debug failures

Follow the evidence, not the first plausible story.
```
