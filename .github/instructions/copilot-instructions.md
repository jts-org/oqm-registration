# Copilot — Repository-wide Instructions

You are collaborating on a React (Vite) + Google Apps Script + Google Sheets system. Follow these instructions for both frontend and backend development. Update documentation and skills when code changes affect contracts, schemas, or architecture.

## Coding Standards
- React: Use functional components and hooks. Colocate component-specific CSS/TS. Extract repeated logic into reusable hooks. Avoid class components.
- Memoization: Use React.memo, useMemo, and useCallback only when profiling shows benefit. Avoid unnecessary re-renders by keeping state local and passing stable props.
- Error boundaries: Wrap critical UI sections to prevent full-app crashes.
- Vite: Use ES modules everywhere. Avoid unnecessary polyfills. Use plugins for SVG imports, environment variables, or testing setups. Prefix environment variables with VITE_ and store in .env files. Never commit secrets.
- Imports: Prefer direct imports over index barrels. Use index files sparingly.
- Assets: Store images, icons, and fonts in __web/src/assets/__.
- Code splitting: Use dynamic imports for large or rarely used components.
- Image optimization: Use modern formats (WebP/AVIF) and Vite’s asset handling.
- Bundle analysis: Use Vite plugins to inspect bundle size and dependencies.
- Architecture: Organize by domain/feature, not technical type. Build a shared UI component library for common elements.
- API layer: Centralize fetch logic using a service layer or React Query. Frontend must only call GAS web app endpoints, never Google APIs directly.
- State management: Use React context sparingly. Prefer local state or lightweight libraries (Zustand, Jotai) when needed.
- Data fetching: Use fetch with redirect: "follow" and Content-Type: text/plain;charset=utf-8 for POST to Apps Script. Parse JSON responses.
- Error handling: Show user-visible messages and log context to console.
- Copyright/JSDoc: Every new file/module must have a copyright header and a brief JSDoc comment describing its purpose. See copyright header template below
- Styling: Use CSS Modules or inline styles only. No global CSS.
- ESLint: Enable React-specific, type-aware, and modern best-practice rulesets.
- Exports: Avoid default exports for better discoverability and refactoring safety.
- JSX: Keep components small. Avoid inline functions that cause re-renders. Use descriptive prop names.
- Backend: Use TypeScript or ES2022+ JS. Organize gas/ by feature. Update skills/ docs when contracts or schemas change.
- Testing: Use test-first development (TDD) for new features and bugfixes. Use Jest or equivalent for frontend; Apps Script built-in testing for backend. Place tests next to source files or in __tests__ folders.
- Deployment: Use clasp for backend code upload. Deploy web app via Apps Script UI. Document deployment steps in skills/SKILL.deploy-ci.md.
- Documentation: Update skills/ and instructions when code changes affect contracts, schemas, or architecture. Add rationale and test outline to PRs.
- In skill docs, always define or explain custom types used in code examples to ensure copy/paste usability.

### Copyright Header Template
- 2026 is replaced with the current year when creating new files. Update the year in existing files if they are modified after 2026 or differ otherwise from the template.
```js
/**
* @copyright 2026 Jouni Sipola by OQM. All rights reserved.
* Permission granted for personal/internal use only. Commercial
* use prohibited except by copyright holder. See LICENSE for details.
*/
```

## Architectural Rules
- Frontend must only call GAS web app endpoints; never call Google APIs directly.
- Backend (gas/): Expose doGet and doPost, returning JSON via ContentService. Access spreadsheets only through SpreadsheetApp with stable ranges. Document all API contracts in skills/SKILL.wire-react-to-gas.md.
- Update skills/ documentation when backend routes, payloads, or sheet schemas change.

## Conventions
- Test-first development (TDD) is required for new features and bugfixes. Write failing tests before implementation.
- Use conventional commits: feat:, fix:, chore:, etc.
- Keep PRs focused and small (max one feature or fix per PR; <300 lines preferred).
- Update documentation and skills/ when code changes affect contracts, schemas, or architecture.
- Use the review checklist before merging.
- For each issue, create a dedicated branch named after the issue (e.g., feature/issue-123-description). Implement the feature or fix in this branch. Open a PR to merge into main/master only after review and CI checks pass.
- Remove unused imports and variables before committing changes into the repository to keep code clean and maintainable.

## User Manuals Maintenance (user-visible features)
- If a feature changes anything a user can see or do in the UI (new page, dialog, button behavior, labels/messages, flows, error handling), create or update manuals in `user_manuals/` as part of the same task.
- Maintain both languages when applicable:
	- English manuals: `*.en.md`
	- Finnish manuals: `*.fi.md`
- Keep manuals user-focused and non-technical:
	- Describe what the user clicks, enters, and sees.
	- Include expected outcomes and error recovery steps.
	- Do not include backend/API/sheet/deployment details.
- Keep terminology aligned with current UI localization text.
- When behavior is intentionally not yet implemented, state it clearly in manuals (for example: "not yet available").
- In each PR that changes user-visible behavior, include a short "Manual impact" note listing which manual files were created/updated.

## Output Expectations
- When generating code, include a brief rationale and a test outline in PRs and comments.
- Reference the relevant SKILL doc in code comments, PRs, and documentation updates.