# AGENTS.md

This repository follows **issue-driven scoped autonomy**.  
Agents (including GitHub Copilot) must follow these rules.

---

# Golden Rules

1. **Issue First**  
   No work without a GitHub issue linked to a branch/PR.

2. **Tests Before Code (TDD)**  
   Fail → implement → pass.

3. **One Thing Per PR**  
   Scope PRs to a single issue/feature.

4. **No Secrets In Repo**  
   Use environment variables or Script Properties.

5. **Debug Efficiently**  
   Reproduce once, capture output, analyze.

6. **Contract First**  
   Backend routes + payloads are defined in  
   `.github/skills/wire-react-to-gas/SKILL.md`.

7. **Implement in Branch**  
   Create a branch per issue (e.g., `feature/oqm-123-description`).  
   Open a PR only after review + CI pass.

---

# Architecture Overview

| Component | Tech | Location | Purpose |
|----------|------|----------|---------|
| Frontend | React + Vite | `web/` | SPA calling GAS backend |
| Backend | Google Apps Script | `gas/` | JSON API over Google Sheets |
| Data | Google Sheets | external | Domain data storage |

Backend is deployed as a Web App using `doGet/doPost` and returns JSON.

---

# Workflow

Issue → assign skills → branch → PR → CI → agent review (PR Review + Documentation Update) → human review → merge.

Backend uses **CLASP** for code sync; deployment is manual via Apps Script UI.

---

# Negative Guardrails (Never Do This)

- ❌ Commit secrets or Script Property values  
- ❌ Change sheet structure without updating `.github/skills/sheet-schema/SKILL.md`  
- ❌ Bypass PR review or CI failures  
- ❌ Add cross-cutting refactors inside a feature PR  
- ❌ Deploy GAS automatically in CI  
- ❌ Hardcode API URLs or tokens  

---

# Definition of Done (per PR)

- Issue linked  
- Tests written and passing  
- Relevant skills followed  
- API contract unchanged or updated in skills  
- Documentation updated when UI behavior, flows, schemas, or API contracts change (see documentation-update skill)  
- No secrets leaked  
- Manual GAS deploy instructions followed (if backend changed)  

---

# Onboarding New Contributors

- Read **AGENTS.md**, `.github/skills/`, and instructions before coding  
- Set up local environment per README.md  
- Review localization rules in  
  `.github/skills/frontend-i18n/SKILL.md`  
- Review API contract in  
  `.github/skills/wire-react-to-gas/SKILL.md`  

---

# Escalation Process

If blocked by CI or review, tag a maintainer and describe the issue.

---

# Skills Summary

## Infrastructure & Setup

- `.github/skills/setup-react-vite/SKILL.md`  
- `.github/skills/setup-gas-webapp/SKILL.md`  
- `.github/skills/deploy-ci/SKILL.md`  

---

## Backend Architecture & Contracts

- `.github/skills/wire-react-to-gas/SKILL.md`  
- `.github/skills/sheet-schema/SKILL.md`  
- `.github/skills/gas-sheet-operations/SKILL.md`  
- `.github/skills/gas-validation-rules/SKILL.md`  
- `.github/skills/gas-id-generation/SKILL.md`  
- `.github/skills/gas-date-and-time/SKILL.md`  
- `.github/skills/security-secrets/SKILL.md`  

---

## Frontend Architecture & UX

- `.github/skills/frontend-architecture/SKILL.md`  
- `.github/skills/frontend-ux-and-accessibility/SKILL.md`  
- `.github/skills/frontend-responsive-design/SKILL.md`  
- `.github/skills/frontend-i18n/SKILL.md`  
- `.github/skills/frontend-performance/SKILL.md`  
- `.github/skills/frontend-api-client/SKILL.md`  

---

## PR Quality & Documentation

- `.github/skills/pr-review/SKILL.md`  
- `.github/skills/documentation-update/SKILL.md`  

---

# Quick Reference (For New Features)

1. Create GitHub issue  
2. Review API contract:  
   `.github/skills/wire-react-to-gas/SKILL.md`  
3. Follow frontend architecture + UX rules:  
   `.github/skills/frontend-architecture/SKILL.md`  
   `.github/skills/frontend-ux-and-accessibility/SKILL.md`  
   `.github/skills/frontend-responsive-design/SKILL.md`  
4. Apply performance patterns:  
   `.github/skills/frontend-performance/SKILL.md`  
5. Deploy frontend via GitHub Pages  
6. Deploy backend manually via Apps Script UI
