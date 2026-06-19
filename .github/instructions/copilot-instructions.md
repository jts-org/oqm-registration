# Copilot — Repository-wide Instructions

These instructions are for **developers**.  
Copilot’s behavior is defined in `.github/skills/*` SKILL.md files.

Whenever code changes affect API contracts, sheet schemas, or backend architecture, update both:
- the relevant SKILL.md files, and  
- this instructions document (if developer-facing behavior changes).

---

## Coding Standards (Frontend)

### React
- Use functional components and hooks.
- Colocate component-specific CSS/TS.
- Extract repeated logic into reusable hooks.
- Avoid class components.
- Keep components small and focused.

### Memoization
- Use React.memo, useMemo, and useCallback **only when profiling shows benefit**.
- Avoid unnecessary re-renders by keeping state local and passing stable props.

### Error Boundaries
- Wrap critical UI sections to prevent full-app crashes.

### Vite
- Use ES modules everywhere.
- Avoid unnecessary polyfills.
- Prefix environment variables with `VITE_`.
- Never commit secrets.
- Use Vite plugins for SVG imports, env vars, and bundle analysis.

### Imports
- Prefer direct imports over index barrels.
- Use index files sparingly.

### Assets
- Store images, icons, and fonts in `web/src/assets/`.

### Code Splitting & Performance
- Use dynamic imports for large or rarely used components.
- Use modern image formats (WebP/AVIF).
- Use Vite’s asset handling for optimization.
- For deeper performance rules, see `.github/skills/vite-react-performance`.

### State Management
- Prefer local state.
- Use React Context sparingly.
- Use lightweight libraries (Zustand, Jotai) when needed.

### Data Fetching
- Use fetch with:
  - `redirect: "follow"`
  - `Content-Type: text/plain;charset=utf-8` for POST
- Parse JSON responses.
- Follow API contract defined in `.github/skills/wire-react-to-gas`.

### Error Handling
- Show user-visible messages.
- Log context to console.
- Follow backend error codes defined in `.github/skills/gas-error-handling`.

### Styling
- Use CSS Modules or inline styles.
- Avoid global CSS.

### ESLint
- Enable React-specific, type-aware, and modern best-practice rulesets.

### Exports
- Avoid default exports for better discoverability.

---

## Coding Standards (Backend — gas/)

### Architecture
- Backend exposes `doGet` and `doPost` and returns JSON via `ContentService`.
- All backend architectural rules are defined in:
  - `.github/skills/gas-backend-architecture`
  - `.github/skills/gas-response-format`

### Secrets
- Store secrets in Script Properties.
- Never hardcode secrets.
- See `.github/skills/security-secrets`.

### Concurrency
- All write operations must be atomic.
- Use `tryLock(5000)` and release in `finally`.
- Do **not** use `waitLock()`.
- See `.github/skills/gas-locking-and-concurrency`.

### Sheets
- Follow sheet schemas and column order.
- Never write partial rows.
- See `.github/skills/gas-sheet-operations` and `.github/skills/sheet-schema`.

### Error Handling
- Return `{ ok: false, error: "<error_code>" }`.
- Never return stack traces.
- See `.github/skills/gas-error-handling`.

### API Contracts
- All route names, payloads, and response formats are defined in:
  - `.github/skills/wire-react-to-gas`
  - `.github/skills/gas-route-registry`

---

## Testing

- Use TDD for new features and bugfixes.
- Write failing tests before implementation.
- Use Jest (or equivalent) for frontend.
- Use Apps Script built-in testing for backend.
- Place tests next to source files or in `__tests__` folders.

---

## Deployment

- Use `clasp push` for backend code upload.
- Deploy Web App via Apps Script UI (not via `clasp deploy`).
- Document deployment steps in `.github/skills/deploy-ci`.

---

## Documentation

- Update SKILL.md files when code changes affect:
  - API contracts
  - sheet schemas
  - backend architecture
- Add rationale and test outline to PRs.
- Keep instructions developer-focused; keep skills Copilot-focused.

---

## User Manuals

- Update `user_manuals/*.en.md` and `*.fi.md` when UI behavior changes.
- Manuals must be user-focused, not technical.
- Include expected outcomes and error recovery steps.
- Include a “Manual impact” note in PRs.

---

## Conventions

- Use conventional commits (`feat:`, `fix:`, `chore:`).
- Keep PRs small (<300 lines).
- Remove unused imports and variables before committing.
- Use issue-based branches (`feature/issue-123-description`).

---

## Copyright Header

Use this header in all new files:

```js
/**
* @copyright 2026 Jouni Sipola by OQM. All rights reserved.
* Permission granted for personal/internal use only. Commercial
* use prohibited except by copyright holder. See LICENSE for details.
*/
```

Update the year when modifying files after 2026.

---