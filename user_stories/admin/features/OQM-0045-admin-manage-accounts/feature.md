# Feature Request

## Summary
Add full admin account management so admins can list, create, edit, and delete coach and trainee login accounts from the Admin page, with backend-enforced restrictions and strict API envelope compliance.

## User Story
_As an admin, I want to manage coach and trainee accounts in one place so that I can keep account data accurate without manual sheet edits._

## Acceptance Criteria
- [x] Admin can list coach accounts and trainee accounts via admin-only routes.
- [x] Admin can create coach and trainee accounts with validation and global PIN uniqueness checks.
- [x] Admin can update and delete accounts with relation-based restrictions enforced.
- [x] Frontend account management panel is integrated into Admin page with localized EN/FI content.
- [x] Backend tests cover list/CRUD routes, auth/role guards, lock behavior, mapping, and failure modes.
- [x] Frontend tests cover account panel flows and Admin page navigation integration.
- [x] Contract and route registry docs are updated to match shipped routes.
- [x] Admin manuals reviewed/updated for account management flows.
- [x] learnings.md updated if needed.

## Relevant Skills
(Select all that apply)

- API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md

- Frontend Architecture  
  @see .github/skills/frontend-architecture/SKILL.md

- UX & Accessibility  
  @see .github/skills/frontend-ux-and-accessibility/SKILL.md

- Responsive Design  
  @see .github/skills/frontend-responsive-design/SKILL.md

- i18n  
  @see .github/skills/frontend-i18n/SKILL.md

- Performance  
  @see .github/skills/frontend-performance/SKILL.md

- Backend Logic  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/gas-validation-rules/SKILL.md  
  @see .github/skills/gas-date-and-time/SKILL.md  
  @see .github/skills/gas-id-generation/SKILL.md

- Continuous learning
  @see .github/skills/continuous-learning/SKILL.md  

## Additional Notes
- Branch: feature/oqm-0045-admin-manage-accounts
- Core implementation includes backend route additions in GAS, new frontend AdminAccountListPanel, EN/FI locale additions, and end-to-end test coverage for touched features.

## Summary
- Linked issue: OQM-0045 (replace with GitHub issue number, for example #123)
- Adds full admin account management for coach and trainee accounts end-to-end:
1. Backend: new admin list and CRUD routes with existing auth, lock, and strict response envelope behavior.
2. Frontend: new account-management panel and flows for create, edit, delete, list, and restriction feedback.
3. Tests: backend route/guard coverage and frontend component/page coverage for new flows.
4. Docs and skills: route contract and route-registry alignment, manual impact coverage, and continuous-learning promotion updates.

## Checklist
- [x] Tests added/updated and passing
- [x] No secrets committed
- [x] API contract adhered to
- [x] Updated docs/skills if schema or flows changed
- [ ] Global review checklist completed (review-checklist.instructions.md)
- [ ] Frontend review checklist completed if PR includes frontend changes (frontend.review-checklist.md)
- [ ] Discovered new reusable patterns are updated into learnings.md (.github/skills/continuous-learning/skill.md)

---

## Frontend Checklist (only if PR touches web/)
<details>
<summary>Expand frontend checklist</summary>

### 📱 Mobile-First & Responsiveness
- [ ] Layout works at 320px width without horizontal scrolling
- [ ] Uses flexible layouts (flex/grid/%/maxWidth), not fixed px widths
- [x] Uses MUI responsive props (sx={{ ... }})
- [ ] Touch targets ≥ 48×48 px
- [ ] No hover-only interactions; tap equivalents exist
- [x] Navigation adapts to mobile (hamburger, temporary drawer, bottom nav)
- [ ] Forms usable with mobile keyboard open
- [ ] Validation messages visible on small screens

### 🎨 Theme & Styling
- [x] Uses ThemeContext and theme tokens
- [x] No hardcoded colors, spacing, or fonts
- [x] Uses MUI styling system (sx, styled components)
- [x] Component supports dark/light/sport themes

### 🌍 Localization
- [x] All user-facing text uses translation keys
- [x] Finnish characters use unicode escapes (ä → \u00e4, ö → \u00f6)
- [x] No hardcoded strings

### 🧭 Accessibility
- [x] Keyboard navigation works
- [x] ARIA roles/labels applied
- [ ] Screen reader announcements for modals/loaders
- [ ] Focus management correct

### ⚙️ API & Loading
- [x] API calls use VITE_GAS_BASE_URL
- [x] UI blocked during API operations with dimmed overlay + loader
- [x] Errors use correct notification type (inline/toast/modal)

### 🧱 Architecture
- [x] Feature code under web/src/features/<feature>/
- [x] Pages contain no business logic
- [x] Shared components under web/src/shared/
- [x] No cross-feature imports

### 🧪 Testing
- [x] Tests colocated with components
- [ ] Tested on mobile, tablet, desktop

</details>

---

Suggested PR notes to include below template:
- Validation run:
1. node --test gas/__tests__/adminAccountWriteRoutes.test.js gas/__tests__/listAdminAccounts.test.js
2. cd web && npm test -- src/features/admin/components/__tests__/AdminAccountListPanel.test.tsx src/pages/Admin/__tests__/AdminPage.test.tsx
- Result:
1. Backend: 34 passed, 0 failed
2. Frontend: 18 passed, 0 failed
- Known test noise:
1. Vitest/happy-dom emits AbortError teardown logs after successful completion; all assertions still passed.