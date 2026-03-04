# SKILL: Setup Apps Script Web App + CLASP (gas/)

## Steps
1. Install & login clasp
   ```bash
   npm i -g @google/clasp
   clasp login
   ```
2. Initialize local project
   ```bash
   mkdir gas && cd gas
   clasp create --title "OQM Registration" --type standalone
   ```
3. Push & version
   ```bash
   clasp push
   clasp version "initial"
   ```
4. Deploy as **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or your domain)
   - Copy `/exec` URL and set it as `VITE_GAS_BASE_URL` on the frontend.

5. Script Properties (Apps Script → Project Settings)
   - `SHEET_ID` (Spreadsheet ID)
   - `API_TOKEN` (shared token)
