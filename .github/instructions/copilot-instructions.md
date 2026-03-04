# Copilot — Repository-wide Instructions

You are collaborating on a React (Vite) + Google Apps Script + Google Sheets system.

## Coding Standards
- Use TypeScript where present; otherwise modern JS (ES2022+).
- React: functional components + hooks; colocate component-specific CSS/TS.
- Data fetching: `fetch` with `redirect: "follow"` and `Content-Type: text/plain;charset=utf-8` when POSTing to Apps Script; parse JSON response.
- Handle errors with user-visible messages + console context.

## Architectural Rules
- Frontend calls only the GAS web app endpoints; no direct Google APIs.
- Backend (`gas/`) exposes `doGet` and `doPost` returning JSON via `ContentService`.
- Spreadsheet access only through `SpreadsheetApp` with stable ranges.

## Conventions
- Test-first where feasible.
- Conventional commits: `feat:`, `fix:`, `chore:` etc.
- Keep PRs focused and small.

## Output Expectations
- When generating code, include brief rationale and a test outline.
- Reference applicable SKILL doc in responses.
