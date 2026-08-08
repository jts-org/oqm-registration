```markdown
---
name: pr-review
description: Authoritative rules for Copilot PR reviews.
license: MIT
---

# SKILL: pr-review
Authoritative rules for Copilot PR reviews.

## Purpose
Used when user creates/edits/reviews PRs or asks about PR quality, standards, architecture, tests, docs, or merge readiness.

## When to Apply
Activate when user mentions PR, pull request, review, diff, merge, approve, or provides PR description/diff.

---

# 1. Read PR Description
Extract:
- linked issue  
- summary of changes  
- affected areas (frontend/backend/sheets/API/docs)  
- PR template completeness  

If missing → request completion.

---

# 2. PR Template Compliance
Verify:
- meaningful summary  
- linked issue  
- checklist completed  
- frontend checklist expanded if touching `web/`  

If missing → request fixes.

---

# 3. Repository‑Wide Checks

## Tests
- Tests exist for new features/bugfixes  
- TDD followed  
- Tests colocated  
- Frontend tests cover mobile/tablet/desktop  

## Secrets
- No secrets committed  
- Env vars follow `VITE_` rules  

## API Contracts
Validate shapes against:
- `wire-react-to-gas`  
- `gas-route-registry`  
- `gas-response-format`  

## Sheet Schemas
If sheets touched:
- Column order correct  
- Schema consistent  
- No partial writes  
- Operations follow `gas-sheet-operations`  

## Concurrency
If backend writes:
- `tryLock(5000)`  
- release lock in `finally`  
- no `waitLock()`  
- atomic writes only  

## Documentation
If flows/schemas/UI changed:
- `SKILL.md` updated  
- manuals updated (en + fi)  
- PR includes “Manual impact”  

---

# 4. Frontend Review Rules (web/)

Use canonical frontend skills as source of truth:

- `frontend.review-checklist.instructions.md` for mobile-first UX checks
- `frontend-architecture` for folder boundaries and ownership
- `frontend-i18n` for localization and unicode rules
- `frontend-ux-and-accessibility` for keyboard/ARIA/focus behavior
- `frontend-api-client` and `wire-react-to-gas` for API contract behavior

---

# 5. Backend Review Rules (GAS)

## Response Format
- Must match `gas-response-format` exactly

## Authentication
- Follow `auth-flow` and `security-secrets`

## Route Contracts
- Shapes and route names must match `wire-react-to-gas` and `gas-route-registry`

## Concurrency
- Must match `gas-locking-and-concurrency`

## Sheets
- Must match `sheet-schema` and `gas-sheet-operations`

---

# 6. Architecture & Code Quality

## General
- No dead code  
- No unused imports  
- No console.logs in production  
- Clear naming  
- Small, composable functions  

## Separation of Concerns
- No business logic in UI  
- No UI logic in hooks  
- No API logic in pages  
- No cross-feature imports  

## Performance
- Avoid unnecessary re-renders  
- Use React.memo where appropriate  
- Use correct dependency arrays  

---

# 7. Merge Readiness

Copilot must check:
- PR description complete  
- All checklists complete  
- Tests passing  
- Manual impact documented  
- No architectural violations  
- No API contract drift  
- No sheet schema drift  
- No concurrency violations  
- No secrets  
- No missing translations  
- No accessibility regressions  

If any critical issue → request fixes before approval.

---

# 8. Required Behavior for Copilot

Copilot must:
- read PR description carefully  
- summarize changes  
- identify risks  
- check architecture rules  
- check API contract rules  
- check sheet schema rules  
- check concurrency rules  
- check docs/manual impact  
- provide actionable, concise review comments  
- never approve PRs with critical issues  

---

# 9. Future Extensions
PR review rules may expand; structure must remain stable.
```
