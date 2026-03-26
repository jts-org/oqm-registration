**Title:**
OQM-0032 Admin Page Shell With Dashboard, Reports, And Settings Navigation

**Description:**
The Administrator page is currently being expanded from a single placeholder view into an in-page admin shell with section navigation. The current modifications introduce a fixed top bar, permanent side navigation, dashboard action cards, report category tabs, and localized strings in English and Finnish. This issue captures and formalizes those modifications as one coherent feature scope.

**User Story:**
As an administrator, I want a structured admin page with internal sections (Dashboard, Reports, Settings), so that I can navigate key admin areas without leaving the page.

**Scope:**
- Frontend in web (Admin page):
  - Replace the previous single-content admin placeholder with an app-shell-style layout.
  - Add a fixed top app bar containing admin title and `Back to main` action.
  - Add a permanent left drawer for section navigation.
  - Add navigation sections:
    - Dashboard
    - Reports
    - Settings
  - Add dashboard cards with `Open` actions that route the user to targeted in-page sections.
  - Add reports sub-navigation tabs:
    - Logs
    - Usage reports
    - Errors
  - Show section placeholders for Reports and Settings content while preserving accessible structure.
- Localization:
  - Add all new administrator UI labels and placeholders to both locale files:
    - English (`en.json`)
    - Finnish (`fi.json`)
- Tests:
  - Extend Admin page tests to verify:
    - Default section rendering
    - Drawer navigation to Reports
    - Report tab switching behavior
    - Dashboard card action navigation
    - Back-to-main callback behavior

**Out of Scope:**
- Backend (GAS) route changes.
- Sheet schema changes.
- Real report data integration.
- Real settings form implementation.
- Admin authentication flow changes.

**Preconditions:**
- Administrator is already authenticated and routed to AdminPage.
- Localization framework is active and locale files are loaded.
- MUI components and icons are available in frontend dependencies.

**Main Flow (Admin in-page navigation):**
1. Admin opens Admin page after successful login.
2. Page renders title bar and left navigation drawer.
3. Dashboard section is selected by default.
4. Admin selects `Reports` from left navigation.
5. Reports view opens with tabs: `Logs`, `Usage reports`, and `Errors`.
6. Admin switches report tabs and sees corresponding localized placeholder content.
7. Admin returns to dashboard and can use `Open` card actions to jump directly to Reports or Settings sections.

**Alternative Flows:**
1. Admin uses dashboard `Open` action from the Reports card to navigate to Reports without using drawer navigation.
2. Admin uses `Back to main` from top bar at any point to leave Admin page.
3. If no section-specific real data exists yet, placeholder content is shown without breaking layout or navigation.

**User Feedback Messages:**
- No new error dialogs are introduced in this scope.
- New user-facing section labels and placeholders are localized in English and Finnish:
  - Dashboard
  - Reports
  - Settings
  - Open
  - Report tab labels and placeholder content

**Test Cases:**
- AdminPage renders shell heading `Administrator`, default section heading `Dashboard`, and dashboard card heading `User management`.
- Clicking drawer item `Reports` shows Reports heading and all report tabs (`Logs`, `Usage reports`, `Errors`).
- Clicking report tab `Usage reports` shows usage placeholder content.
- Clicking dashboard card `Open` for reports opens Reports section.
- Clicking `Back to main` triggers `onBack` exactly once.
- Localization regression check: new adminView keys are present in both `en.json` and `fi.json`.

**Acceptance Criteria:**
- Admin page renders as a structured shell (top bar + permanent navigation + content region).
- Dashboard is selected by default on initial render.
- Navigation supports switching between Dashboard, Reports, and Settings sections.
- Reports section includes working tabs (Logs, Usage reports, Errors) with visible content per selected tab.
- Dashboard card actions can navigate to target sections.
- `Back to main` remains visible and functional in the top bar.
- All newly introduced admin labels are localized in both English and Finnish locale files.
- Automated frontend tests cover the new navigation and section behavior.

**Linked Files/Branches:**
- [web/src/pages/Admin/AdminPage.tsx](web/src/pages/Admin/AdminPage.tsx)
- [web/src/pages/Admin/__tests__/AdminPage.test.tsx](web/src/pages/Admin/__tests__/AdminPage.test.tsx)
- [web/src/locales/en.json](web/src/locales/en.json)
- [web/src/locales/fi.json](web/src/locales/fi.json)
- Suggested branch: feature/oqm-0032-admin-page-shell-navigation

**References:**
- [AGENTS.md](AGENTS.md)
- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [.github/instructions/review-checklist.instructions.md](.github/instructions/review-checklist.instructions.md)
