# SKILL: Pull Request Review

## Purpose
This skill defines how Copilot must analyze, review, and validate pull requests in this repository. It enforces repository‑wide coding standards, architecture rules, API contracts, sheet schemas, frontend/mobile‑first requirements, documentation expectations, and PR template compliance.

Copilot uses this skill whenever the user is:
- creating a PR
- editing a PR
- asking for a PR review
- asking for improvements to a PR
- asking whether a PR meets repository standards

---

## When to Apply
Activate this skill whenever:
- the user mentions “PR”, “pull request”, “review”, “diff”, “changes”, “merge”, or “approve”
- the context includes a GitHub PR description or diff
- the user asks Copilot to check code quality, architecture, tests, or documentation related to a PR

---

## Review Procedure

### 1. Read the PR Description
Extract:
- linked issue number
- summary of changes
- affected areas (frontend, backend, sheets, API, docs)
- whether the PR template is fully filled

If anything is missing, ask the user to complete it.

---

## 2. Enforce PR Template Compliance
Verify:
- Summary section is present and meaningful
- Linked issue is provided
- All checklist items are addressed
- Frontend checklist expanded if PR touches web/

If missing, instruct the user to fill the missing sections.

---

## 3. Repository‑Wide Required Checks

### Tests
- Confirm tests exist for new features and bugfixes.
- Confirm tests follow TDD (failing test before implementation).
- Confirm tests are colocated with components or in __tests__ folders.
- Confirm tests cover mobile, tablet, and desktop for frontend UI.

### Secrets
- Ensure no secrets are committed.
- Ensure environment variables follow VITE_ prefix rules.

### API Contracts
Validate request/response shapes against:
- .github/skills/wire-react-to-gas
- .github/skills/gas-route-registry
- .github/skills/gas-response-format

### Sheet Schemas
If PR touches sheets:
- Validate column order
- Validate schema consistency
- Validate no partial writes
- Validate operations follow .github/skills/gas-sheet-operations

### Concurrency
If backend writes occur:
- Ensure tryLock(5000) is used
- Ensure lock is released in finally
- Ensure no waitLock() usage
- Ensure atomic writes

### Documentation
If flows, schemas, or UI behavior changed:
- Ensure SKILL.md files updated
- Ensure user manuals updated (en + fi)
- Ensure PR includes “Manual impact” note

---

## 4. Frontend Review Rules (if PR touches web/)

### Mobile‑First & Responsiveness
Check:
- Layout works at 320px width
- No horizontal scrolling
- Uses flex/grid/responsive MUI props
- Touch targets ≥ 48×48 px
- No hover‑only interactions
- Navigation adapts to mobile
- Forms usable with mobile keyboard open
- Validation messages visible on small screens

### Theme & Styling
Check:
- Uses ThemeContext and theme tokens
- No hardcoded colors, spacing, fonts
- Uses MUI sx or styled components
- Supports dark/light/sport themes

### Localization
Check:
- All user‑facing text uses translation keys
- Finnish characters use unicode escapes
- No hardcoded strings

### Accessibility
Check:
- Keyboard navigation works
- ARIA roles/labels present
- Screen reader announcements for modals/loaders
- Focus management correct

### Architecture
Check:
- Feature code under web/src/features/<feature>/
- Pages contain no business logic
- Shared components under web/src/shared/
- No cross‑feature imports

### API & Loading
Check:
- API calls use VITE_GAS_BASE_URL
- UI blocked during API operations
- Errors use correct notification type

---

## 5. Code Quality & Standards

### React
- Functional components only
- Hooks for logic extraction
- Avoid unnecessary memoization
- Avoid default exports
- Remove unused imports/variables

### Vite
- ES modules only
- No unnecessary polyfills
- No secrets in env
- Use Vite asset handling

### Backend
- doGet/doPost only
- JSON responses via ContentService
- No stack traces returned
- Error codes follow gas-error-handling

---

## 6. PR Size & Structure
- PR should be <300 LOC unless explicitly justified
- Branch name must follow feature/issue-123-description
- PR title must follow conventional commits

If not, Copilot must request correction.

---

## 7. Review Output Format
Copilot must output reviews in this structure:

Summary  
A concise 2–4 sentence explanation of what the PR does.

Strengths  
List of positive aspects.

Issues  
List of all violations of:
- coding standards
- architecture rules
- API contracts
- sheet schemas
- frontend/mobile-first rules
- documentation requirements
- PR template compliance

Required Fixes  
Items that must be resolved before merge.

Optional Improvements  
Non-blocking suggestions.

---

## 8. Never Auto‑Approve
Copilot must never imply approval or readiness to merge.  
Copilot may say “After fixes, I can re-review.”

---

## 9. Ask the Two Mandatory Questions
At the end of every review, Copilot must ask:

1. Did this PR change API contracts, sheet schemas, or backend architecture?  
2. Did this PR change user-visible UI behavior requiring manual updates?

If yes, Copilot must guide the user to update:
- SKILL.md files  
- user_manuals/*.en.md  
- user_manuals/*.fi.md  

---

## 10. If Diff Is Missing
If the user asks for a review but provides no diff or code, Copilot must request:
- PR description
- PR diff or changed files
- Any relevant context

---