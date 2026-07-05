![Steered Starter](https://img.shields.io/badge/Steered%20Starter-%F0%9F%9A%97%20Guided-success)
![Copilot Agent](https://img.shields.io/badge/Copilot%20Agent-%F0%9F%9A%80%20Online-00bfff)
![Continuous Learning](https://img.shields.io/badge/Continuous%20Learning-%F0%9F%8D%93%20Always%20Growing-blueviolet)
![Skill System](https://img.shields.io/badge/Skill%20System-%F0%9F%94%A5%20Active-orange)
![Stack](https://img.shields.io/badge/React%20%E2%9D%A4%20GAS%20%E2%9D%A4%20Sheets-%F0%9F%8D%A9%20Full%20Stack-brightgreen)
![TDD](https://img.shields.io/badge/TDD-%F0%9F%94%8D%20Fail%E2%86%92Pass-yellow)
![No Secrets](https://img.shields.io/badge/No%20Secrets-%F0%9F%94%92%20Allowed-red)

# React + Google Apps Script + Google Sheets (Steered Starter)

A ready-to-commit starter that uses a **React (Vite)** frontend with a **Google Apps Script** web app backend over **Google Sheets**. Steering documents (AGENTS + SKILLs + Copilot instructions) keep the workflow consistent and reproducible.

## Quick Start

### 1) Backend (Apps Script)
- Follow `.github/skills/setup-gas-webapp/SKILL.md` to create and deploy a Web App; copy the `/exec` URL.
- In Apps Script **Project Settings → Script properties**, set:
  - `SHEET_ID` (Spreadsheet ID)
  - `COACH_PASSWORD` (coach password used by `coachLogin` password mode)
  - `ADMIN_PASSWORD` (admin password used by `adminLogin`)

### 2) Spreadsheet
- Create a Sheet with a tab named `Data` and headers: `id, name, email, created_at` (see `.github/skills/sheet-schema/SKILL.md`).

### 3) Frontend
- Follow `.github/skills/setup-react-vite/SKILL.md`.
- Create `web/.env.local`:
    VITE_GAS_BASE_URL=https://script.google.com/macros/s/…/exec
- Run the app: `cd web && npm run dev`.

### 4) CI & Pages (optional)
- CI builds on PRs by default.
- GitHub Pages deployment workflow is included; it automatically sets the correct `base` for Vite and creates a SPA-friendly `404.html`.

## References
- Apps Script Web Apps & `doGet/doPost` + `ContentService` JSON responses.
- CLASP for local Apps Script development.
- Vite getting started & static deploy to GitHub Pages.

See `AGENTS.md` and `.github/skills/` for the working method.

## Environment Variables
- VITE_GAS_BASE_URL: GAS web app endpoint

## Authentication Model (Current)
- Trainee routes are public (no PIN/password required).
- Coach and admin routes require a short-lived session token from:
  - `coachLogin` (PIN or password mode)
  - `adminLogin` (password mode)

## Documentation Links
- [AGENTS.md](AGENTS.md)
- [.github/skills/sheet-schema/SKILL.md](.github/skills/sheet-schema/SKILL.md)
- [.github/skills/wire-react-to-gas/SKILL.md](.github/skills/wire-react-to-gas/SKILL.md)
- [.github/skills/deploy-ci/SKILL.md](.github/skills/deploy-ci/SKILL.md)
- [.github/skills/continuous-learning/skill.md](.github/skills/continuous-learning/skill.md)
