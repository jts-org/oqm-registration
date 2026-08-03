```markdown
---
name: checkpoint-validation
description: Phase completion checkpoint validation for Mimir orchestrator. Ensures plans are executed end-to-end with full stack coverage before proceeding to next phase.
---

# Checkpoint Validation

Run a checkpoint **whenever a phase completes** (all tasks marked completed). Purpose: catch missing layers early; unit tests may pass while integration is broken.

## Core Rules

### After Phase N Completes
1. **Assess Risk**: What changed? How many layers?  
2. **Check Stack Completeness**: Multi-layer work must include all layers.  
3. **Decide Verification**: Determine if test-engineer validation is required.

### Stack Completeness
Verify all layers for multi-layer features:

- **Data**: DB schema, migrations, models  
- **Logic**: Services, handlers, business rules  
- **API**: Endpoints, routes, contracts  
- **UI**: Components, forms, views  
- **Wiring**: Integration configured  
  - API client  
  - CORS  
  - Request/response mapping  
  - Error propagation  
  - Security/auth  
- **Validation**: End-to-end path testable

**Red Flags**
- API without UI  
- UI without backend wiring  
- Services without DB schema  
- Unit tests only, no integration/e2e  
- Missing CORS for FE/BE communication

### Verification Matrix
| Scenario | Verification? | Reason |
|----------|---------------|--------|
| Single layer, unit tests passing | NO | Low integration risk |
| 2–3 layers modified | MAYBE | Check wiring |
| Tracer bullet completed | **YES** | Must validate end-to-end |
| Multiple implement tasks in related areas | **YES** | Integration risk |
| Critical path (auth/payments/data) | **YES** | High impact |
| UI changes | **YES** | UI exploration needed |
| Wiring/integration tasks | **YES** | Must prove end-to-end

### Checkpoint Pattern
```markdown
Phase [N] completed. Evaluating checkpoint:
- Tasks: [summary]
- Layers modified: [data/logic/API/UI/wiring]
- Risk level: [HIGH/MED/LOW] – [reason]
- Stack complete: [YES/NO/PARTIAL] – [missing if any]
- Verification needed: [YES/NO] – [reason]

[If YES] → Delegating to test-engineer for [test type]  
[If NO] → Proceeding to Phase [N+1]  
[If PARTIAL] → Blocking: Missing [layers]
```

## Examples

### Complete Stack (Good)
```
Phase 1 (Tracer) completed. Evaluating checkpoint:
- Tasks: DB schema, service, API endpoint, UI component, API client, CORS
- Layers: data, logic, API, UI, wiring
- Risk: HIGH – first vertical slice
- Stack complete: YES
- Verification: YES – tracer must validate end-to-end

→ Delegating to test-engineer for e2e validation
```

### Incomplete Stack (Bad)
```
Phase 1 completed. Evaluating checkpoint:
- Tasks: services, API endpoints, unit tests
- Layers: logic, API
- Risk: HIGH – multi-layer
- Stack complete: NO – missing UI, wiring, DB
- Verification: BLOCKED

→ STOP: Add DB schema, UI components, API client config, CORS, e2e validation
```

### Missing Wiring (Caught)
```
Phase 1 completed. Evaluating checkpoint:
- Tasks: API endpoints, React components
- Layers: API, UI
- Risk: HIGH – FE/BE integration
- Stack complete: PARTIAL – no wiring
- Verification: BLOCKED

→ STOP: Add API client config, CORS, request/response mapping
```

## Tracer Bullets (Special Case)

Tracer bullets **must** validate end-to-end before expansion:

1. Phase 1 completes  
2. Mandatory checkpoint  
3. test-engineer validates UI → API → Service → DB  
4. Fix issues, re-validate  
5. Only then proceed to Phase 2

Reason: Expanding on broken patterns compounds debt.

## Responsibilities
- **Orchestrator**: Run checkpoint after phase completion  
- **Planner**: Ensure stack-complete plans  
- **test-engineer**: Validate end-to-end  
- **No assumptions**: Verify suspicious integration

## Anti-Patterns
- ❌ “Unit tests pass, ship it”  
- ❌ Assuming layers auto-connect  
- ❌ Skipping validation to “save time”  
- ❌ Expanding on unvalidated tracer  
- ❌ Trusting implementation without verification

## Success Indicators
- All layers implemented  
- Wiring explicit and complete  
- Integration failures caught at boundaries  
- test-engineer validates at correct moments  
- Expansion only after tracer validated
```
