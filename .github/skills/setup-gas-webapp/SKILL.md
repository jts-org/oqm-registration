```markdown
---
name: setup-gas-webapp
description: Setup instructions and architectural rules for the OQM Google Apps Script backend. Copilot must apply this skill whenever generating or modifying GAS project structure, CLASP workflows, or Web App deployment steps.
license: MIT
---

# Setup: Apps Script Web App + CLASP (gas/)

Authoritative setup and deployment model for the OQM GAS backend.  
Defines CLASP usage, project structure, Web App deployment, Script Properties, and frontend integration boundaries.

Copilot must follow these rules for all backend setup or deployment logic.

---

## 1. Install & Login CLASP

Required pattern:

```bash
npm i -g @google/clasp
clasp login
```

Rules:
- CLASP is used **only** for pushing code, never for publishing or deploying.  
- never generate automated CLASP login/token scripts  
- never generate CI workflows that run CLASP  

---

## 2. Initialize Local GAS Project

Required pattern:

```bash
mkdir gas && cd gas
clasp create --title "OQM Registration" --type standalone
```

Rules:
- project type must be **standalone**  
- never generate container-bound scripts  
- never generate multiple `clasp.json` files  

---

## 3. Push & Version

Required pattern:

```bash
clasp push
clasp version "initial"
```

Rules:
- `clasp push` uploads code  
- `clasp version` creates version labels  
- never generate `clasp deploy`  
- never generate automated versioning  

---

## 4. Deploy as Web App (Manual Only)

Deployment must always be done **manually** in the Apps Script UI.

Required settings:
- Execute as: **Me**  
- Who has access: **Anyone** (or domain)

Required steps:
1. Open Apps Script UI  
2. Deploy → New Deployment → Web App  
3. Set correct permissions  
4. Copy `/exec` URL  
5. Paste into `.env.local`:

```
VITE_GAS_BASE_URL="https://script.google.com/macros/s/.../exec"
```

Rules:
- never generate automated Web App deployment  
- never assume URL structure  
- never embed URL directly in code  
- always instruct manual update of `.env.local`  

---

## 5. Script Properties (Project Settings)

Required Script Properties:
- `SHEET_ID`  
- `COACH_PASSWORD`  
- `ADMIN_PASSWORD`

Legacy (must not be used):
- `API_TOKEN`

Rules:
- never write Script Properties programmatically  
- never log Script Properties  
- never expose Script Properties in API responses  
- never store Script Properties in frontend code  

---

## 6. Backend Project Structure (gas/)

Required structure:

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
- route handlers live in `routes/`  
- shared logic lives in `core/`  
- no circular dependencies  
- no global mutable state  
- no HTML output  
- no alternative routing models  

---

## 7. Frontend Integration Rules

Copilot must enforce:
- only `VITE_GAS_BASE_URL` is required in `.env.local`  
- frontend must never store secrets  
- frontend must never store sessionToken permanently  
- frontend must always pass sessionToken explicitly  
- frontend must never validate PINs or passwords locally  

Rules:
- always generate fetch calls using unified API contract:
  ```
  { route, payload, sessionToken }
  ```
- never generate direct Google API calls from frontend  
- never generate frontend code that reads Script Properties  

---

## 8. Interaction With Other Skills

### security-secrets
Protects Script Properties and sessionToken handling.

### wire-react-to-gas
Defines canonical API contract and request/response shapes.

### gas-backend-architecture
Ensures correct routing, doGet/doPost behavior, and response format.

### deploy-ci
Ensures GAS deployment is always manual and separate from frontend.

### sheet-schema
Ensures backend connects to correct Sheets via `SHEET_ID`.

---

## 9. Required Behavior for Copilot

Copilot must:
- treat GAS as a **separate deploy target**  
- never generate automated GAS deployment  
- always instruct manual Web App deployment  
- always instruct copying `/exec` URL to `.env.local`  
- always instruct manual Script Properties setup  
- use CLASP only for pushing code  
- never generate CI workflows that deploy GAS  
- never combine frontend + backend deploys  

---

## 10. Prohibited Behavior

Copilot must not:
- generate CI workflows that deploy GAS  
- generate automated versioning or publishing  
- generate code that modifies Script Properties  
- generate Web App URLs  
- assume URL structure  
- generate container-bound scripts  
- generate alternative deployment models  
- generate backend code depending on frontend build steps  

---

## 11. Future Extensions

Setup rules may expand.  
Copilot must not assume Apps Script, CLASP, or Web App deployment are fixed.  
New backend platforms or deployment strategies may be added without breaking this skill.
```
