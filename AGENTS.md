# AGENTS.md

This repository follows **issue-driven scoped autonomy**. Agents (including GitHub Copilot) must follow these rules.

## Golden Rules
1. **Issue First**: No work without a GitHub issue linked to a branch/PR.
2. **Tests Before Code (TDD)**: Fail → implement → pass.
3. **One Thing Per PR**: Scope PRs to a single issue/feature.
4. **No Secrets In Repo**: Use environment variables / Script Properties.
5. **Debug Efficiently**: Reproduce once, capture output, analyze.
6. **Contract First**: Backend routes + payloads are declared in `skills/SKILL.wire-react-to-gas.md`.

## Architecture Overview

| Component | Tech | Location | Purpose |
|---|---|---|---|
| Frontend | React + Vite | `web/` | UI SPA that calls GAS web APIs |
| Backend | Google Apps Script Web App | `gas/` | JSON API proxy over Google Sheets |
| Data | Google Sheets | (external) | Single sheet per bounded context |

**Apps Script Web App** is deployed with `doGet/doPost` and returns JSON using `ContentService`.

## Workflow
- Create issue → assign skill(s) → branch → PR → automated checks → code review agent checklist → human review → merge.
- For GAS, use **CLASP** to edit/deploy; keep script sources under `gas/`.

## Negative Guardrails (Never Do This)
- ❌ Commit secrets, tokens, or script IDs in plain text.
- ❌ Change Sheet structure without updating `skills/SKILL.sheet-schema.md`.
- ❌ Bypass PR review or CI failures.
- ❌ Add cross-cutting refactors inside a feature PR.

## Definition of Done (per PR)
- [ ] Linked issue closed by PR
- [ ] Unit tests added/updated; pass locally & in CI
- [ ] No secrets; `.env.example` updated if needed
- [ ] API contract unchanged or documented migration
- [ ] Checked against `review-checklist.instructions.md`
