---
name: setup-gas-webapp
description: >
  Setup instructions and architectural rules for the Google Apps Script backend
  used by the OQM Registration system. Copilot must use this skill whenever
  generating or modifying GAS project structure, CLASP workflows, or Web App
  deployment steps.
license: MIT
---

# Setup: Apps Script Web App + CLASP (gas/)

This skill defines the **only valid** setup, deployment, and configuration
model for the OQM Google Apps Script backend.  
Copilot must treat this skill as authoritative for:

- CLASP usage  
- project structure  
- Web App deployment  
- Script Properties configuration  
- frontend environment variable setup  
- backend/frontend integration boundaries  

---

# 1. Install & Login CLASP

Copilot must always use this pattern:

```bash
npm i -g @google/clasp
clasp login
```

Rules:

- CLASP is used **only** for pushing code, never for publishing or deploying.  
- Copilot must never generate automated CLASP login or token scripts.  
- Copilot must never generate CI workflows that run CLASP.  

---

# 2. Initialize Local GAS Project

Required pattern:

```bash
mkdir gas && cd gas
clasp create --title "OQM Registration" --type standalone
```

Rules:

- Project type must be **standalone**.  
- Copilot must never generate container-bound scripts.  
- Copilot must never generate multiple clasp.json files.  

---

# 3. Push & Version

Required pattern:

```bash
clasp push
clasp version "initial"
```

Rules:

- `clasp push` uploads code to Apps Script.  
- `clasp version` creates a version label.  
- Copilot must never generate `clasp deploy`.  
- Copilot must never generate automated versioning.  

---

# 4. Deploy as Web App (Apps Script UI)

Deployment must always be done **manually** in the Apps Script UI.

Required settings:

- Execute as: **Me**  
- Who has access: **Anyone** (or domain)  

Required steps:

1. Open Apps Script UI  
2. Deploy → New Deployment → Web App  
3. Set correct permissions  
4. Copy the `/exec` URL  
5. Paste it into frontend `.env.local` as:

```
VITE_GAS_BASE_URL="https://script.google.com/macros/s/.../exec"
```

Rules:

- Copilot must never generate automated Web App deployment.  
- Copilot must never assume the structure of the Web App URL.  
- Copilot must never embed the URL directly in code.  
- Copilot must always instruct the user to update `.env.local` manually.  

---

# 5. Script Properties (Apps Script → Project Settings)

Required Script Properties:

- `SHEET_ID` — Spreadsheet ID  
- `COACH_PASSWORD` — Coach password  
- `ADMIN_PASSWORD` — Admin password  

Legacy (must not be used):

- `API_TOKEN`  

Rules:

- Copilot must never generate code that writes Script Properties programmatically.  
- Copilot must never log Script Properties.  
- Copilot must never expose Script Properties in API responses.  
- Copilot must never store Script Properties in frontend code.  

---

# 6. Backend Project Structure (gas/)

Copilot must enforce this structure:

```
gas/
  main.gs
  routes/
    coach.gs
    trainee.gs
    admin.gs
  core/
    auth.gs
    errors.gs
    locking.gs
    sheets.gs
    utils.gs
```

Rules:

- Route handlers must live in `routes/`.  
- Shared logic must live in `core/`.  
- No circular dependencies.  
- No global mutable state.  
- No HTML output.  
- No alternative routing models.  

---

# 7. Frontend Integration Rules

Copilot must enforce:

- Only `VITE_GAS_BASE_URL` is required in `.env.local`.  
- Frontend must never store secrets.  
- Frontend must never store sessionToken permanently.  
- Frontend must always pass `sessionToken` explicitly in each request.  
- Frontend must never validate PINs or passwords locally.  

Rules:

- Copilot must always generate fetch() calls using the unified API contract:  
  ```
  { route, payload, sessionToken }
  ```
- Copilot must never generate direct Google API calls from frontend.  
- Copilot must never generate frontend code that reads Script Properties.  

---

# 8. Interaction With Other Skills

### **security-secrets**
Ensures Script Properties are secure and never exposed.

### **wire-react-to-gas**
Ensures API contract matches deployed backend.

### **gas-backend-architecture**
Ensures doGet/doPost follow correct routing and response format.

### **deploy-ci**
Ensures GAS deployment is always manual.

### **sheet-schema**
Ensures backend connects to correct Sheets via `SHEET_ID`.

---

# 9. Required Behavior for Copilot

When generating setup or deployment instructions, Copilot must:

- treat GAS as a **separate deploy target**  
- never generate automated GAS deployment  
- always instruct manual Web App deployment  
- always instruct copying `/exec` URL to `.env.local`  
- always instruct setting Script Properties manually  
- always use CLASP only for pushing code  
- never generate CI workflows that deploy GAS  
- never combine frontend and backend deploys  

---

# 10. Prohibited Behavior

Copilot must not:

- generate CI workflows that deploy GAS  
- generate automated versioning or publishing  
- generate code that modifies Script Properties  
- generate Web App URLs  
- assume Web App URL structure  
- generate container-bound scripts  
- generate alternative deployment models  
- generate backend code that depends on frontend build steps  

---

# 11. Future Extensions

This skill describes the current GAS setup model.  
Copilot must not assume Apps Script, CLASP, or Web App deployment are fixed.  
New backend platforms or deployment strategies may be added without breaking this skill.

