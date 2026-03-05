# React + Google Apps Script + Google Sheets (Steered Starter)

A ready-to-commit starter that uses a **React (Vite)** frontend with a **Google Apps Script** web app backend over **Google Sheets**. Steering documents (AGENTS + SKILLs + Copilot instructions) keep the workflow consistent and reproducible.

## Quick Start

### 1) Backend (Apps Script)
- Follow `skills/SKILL.setup-gas-webapp.md` to create and deploy a Web App; copy the `/exec` URL.
- In Apps Script **Project Settings → Script properties**, set:
  - `SHEET_ID` (Spreadsheet ID)
  - `API_TOKEN` (shared token)

### 2) Spreadsheet
- Create a Sheet with a tab named `Data` and headers: `id, name, email, created_at` (see `skills/SKILL.sheet-schema.md`).

### 3) Frontend
- Follow `skills/SKILL.setup-react-vite.md`.
- Create `web/.env.local`:
  ```env
  VITE_GAS_BASE_URL=https://script.google.com/macros/s/…/exec
  VITE_API_TOKEN=replace-with-your-token
  ```
- Run the app: `cd web && npm run dev`.

### 4) CI & Pages (optional)
- CI builds on PRs by default.
- GitHub Pages deployment workflow is included; it automatically sets the correct `base` for Vite and creates a SPA-friendly `404.html`.

## References
- Apps Script Web Apps & `doGet/doPost` + `ContentService` JSON responses.
- CLASP for local Apps Script development.
- Vite getting started & static deploy to GitHub Pages.

See `AGENTS.md` and `skills/` for the working method.
## Environment Variables
- VITE_GAS_BASE_URL: GAS web app endpoint
- VITE_API_TOKEN: Shared secret for API access

## Documentation Links
- [AGENTS.md](AGENTS.md)
- [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [skills/SKILL.deploy-ci.md](skills/SKILL.deploy-ci.md)
