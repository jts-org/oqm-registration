```markdown
---
name: error-recovery
description: Error recovery protocol for Mimir agents. Immediate lesson capture when user corrects, stop-and-replan triggers for design flaws, and 2-layer learning system (lessons.md + AGENTS.md).
---

# Error Recovery Protocol

Capture learning immediately. When user corrects or tests fail, decide whether to fix-and-continue or stop-and-replan.

## Learning Triggers

Append to `lessons.md` when any occur:

- User correction  
- Design decision (choice between viable approaches)  
- Pattern discovery  
- Gotcha/workaround  
- Assumption validated/invalidated

For **user corrections**, also assess impact:

### Impact Assessment

- **Implementation Detail** (paths, typos, missed edge case, API usage)  
  → **Fix and continue**

- **Design Flaw** (architecture violation, wrong abstraction, incorrect assumption)  
  → **STOP and re-plan**

### Decision Matrix

| User Says | Category | Action |
|-----------|----------|--------|
| “Use X instead of Y” | Implementation | Continue |
| “File doesn’t exist” | Implementation | Continue |
| “Add error handling” | Implementation | Continue |
| “Breaks separation of concerns” | Design | STOP → Re-plan |
| “Wrong pattern, use Z” | Design | STOP → Re-plan |
| “Assumes X but actually Y” | Design | STOP → Re-plan |
| “Missing critical layer” | Design | STOP → Re-plan |
| “Requirement ambiguous” | Requirements | STOP → Re-plan |
| “Missing error case” | Requirements | STOP → Re-plan |
| “Requirements contradict” | Requirements | STOP → Re-plan (consider re-running requirements-engineering analysis)

## Stop Triggers (Hard Stops)

1. **Architectural Violation** — wrong boundary, abstraction, missing component  
2. **Flawed Assumptions** — spec assumption wrong, integration point missing  
3. **Wrong Pattern** — violates repo conventions, non-scalable design  
4. **Missing Clarity** — repeated corrections, user confusion

### Examples

```
❌ "Auth should be middleware, not service layer"
→ STOP: Architectural violation

❌ "DB is PostgreSQL, not MongoDB"
→ STOP: Flawed assumption

❌ "Breaks layered architecture"
→ STOP: Wrong pattern

✅ "Use getUserById not getUser"
→ CONTINUE: Implementation detail
```

## Re-Planning Process

When STOP triggered:

```markdown
1. Append lessons.md
2. Update task packet with blocking context + Board Delta
3. Assess required changes (spec.md? plan.md?)
4. Delegate to mimir-planner with correction context
5. Wait for revised plan approval
6. Resume or restart phase
```

**Orchestrator Flow**:
```
User correction (design flaw)
→ lessons.md
→ Delegate to mimir-planner
→ Planner updates spec/plan
→ Orchestrator presents revised plan
→ User approves → Resume
```

## lessons.md Format

Location: `mimir/tracks/{track-name}/lessons.md`  
Created on first correction.

Append-only:

```markdown
# Lessons Learned - {Track Name}

## YYYY-MM-DDTHH:MM:SSZ [Category]
**What went wrong**: …
**What to do instead**: …
**Prevention**: …
**Agent**: orchestrator/implement/test-engineer/mimir-planner
```

Categories: Implementation, Testing, Architecture, Planning, Integration, Configuration, Requirements, Design-Decision, Pattern-Discovery, Gotcha, Assumption-Validated, Assumption-Invalidated.

### Example

```markdown
## 2025-02-19T14:32:15Z [Architecture]
**What went wrong**: Auth logic placed in service layer
**What to do instead**: Use Fastify middleware
**Prevention**: Check existing auth patterns
**Agent**: implement
```

### Best Practices

- Keep entries scannable  
- Include file/pattern references when useful  
- Focus on prevention  
- Avoid verbosity  
- Avoid duplicates

## 2-Layer Learning System

**Layer 1 (Real-Time)**: `lessons.md` — all learning events  
**Layer 2 (Track-Close)**: continuous-learning promotes high-value patterns to `AGENTS.md` after track-close review; writes to `continuous-learning.log.md` only when durable surfaces change.

Flow:
```
Learning event
→ lessons.md
→ (Track close) completion review
→ continuous-learning → AGENTS.md
→ repo log (only if durable surfaces changed)
```

### Layer Responsibilities

**Layer 1 (all agents)**  
- Append lessons.md on any trigger  
- Timestamp + category + what/instead/prevention + agent  
- Keep entries short unless needed

**Layer 2 (continuous-learning)**  
- Runs after orchestrator asks to close track  
- Waits for completion review  
- Promotes high-value patterns  
- Writes repo log only for durable changes

## Integration with Agents

### Orchestrator

Responsibilities:
- Present plan approval  
- Detect stop triggers  
- Append lessons.md for orchestration corrections  
- Delegate to planner for design flaws  
- Reference protocol when stopping

Append lessons.md when:
- User corrects sequencing, phases, delegation, architecture  
- Design decision made  
- Pattern discovered

### Implement Agent

Responsibilities:
- Append lessons.md after each formal-track task (proactive)  
- Append on user corrections  
- Distinguish implementation vs design flaw  
- Mark task packet `blocked` for design flaws  
- Record correction context + Board Delta

STOP when:
- Architectural wrongness  
- Fundamental assumption corrected  
- Multiple corrections in same area  
- Wrong pattern

Continue when:
- Paths, names, imports  
- Edge cases  
- Syntax/API usage  
- Single-task corrections

### Test-Engineer Agent

Responsibilities:
- Append lessons.md after test tasks  
- Append when tests reveal design issues  
- Distinguish implementation bug vs design flaw  
- Report design issues to orchestrator  
- Record findings + Board Delta

Report design issue when:
- Missing architecture layer  
- Integration broken  
- Spec assumptions flawed  
- Cannot write meaningful test

Continue when:
- Implementation bug  
- Test setup issue  
- Coverage gap

## Quick Reference

- Learning trigger → append lessons.md  
- Implementation detail → continue  
- Design flaw → STOP → lessons.md → re-plan  
- lessons.md: timestamp + category + what/instead/prevention + agent  
- Track close → user ask → completion review → continuous-learning
```
