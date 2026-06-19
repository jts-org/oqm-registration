---
name: deploy-ci
description: >
  CI, build validation, and GitHub Pages deployment rules for the OQM
  Registration frontend. Copilot must use this skill whenever generating or
  modifying CI workflows, build pipelines, caching rules, or deployment steps.
license: MIT
---

# SKILL: CI & GH Pages Deploy

This skill defines the **only valid** CI/CD and deployment model for the OQM
Registration frontend.  
Copilot must treat this skill as authoritative for:

- GitHub Actions workflows  
- Vite build validation  
- GitHub Pages deployment  
- SPA routing rules  
- caching strategy  
- separation of frontend and backend deploys  

---

# 1. CI Build Validation

Before pushing to production, Copilot must always include a local build
validation step:

```bash
cd web
npm run build    # TypeScript check + Vite build
npm run preview  # Serve dist/ locally
# Test thoroughly before pushing
```

Rules:

- CI must run TypeScript checks and Vite build.  
- CI must never skip build validation.  
- CI must never deploy unvalidated builds.  

---

# 2. GitHub Pages Deployment (Frontend Only)

The frontend is deployed to GitHub Pages.  
The backend (GAS) is **never** deployed via CI.

Copilot must enforce:

- frontend and backend are separate deploy targets  
- GitHub Pages deploy affects only the Vite SPA  
- GAS deploy is always manual  

---

# 3. SPA Client-Side Routing Configuration

GitHub Pages does not support server-side routing.  
Copilot must always generate SPA rewrite rules.

## Required 404.html Redirect

```yaml
- name: Setup GitHub Pages SPA redirects
  run: |
    echo '<!DOCTYPE html>
    <html>
      <head>
        <script>
          sessionStorage.redirect = location.pathname;
          location.replace("/");
        </script>
      </head>
    </html>' > dist/404.html
```

## Alternative (index.html)

```html
<script>
  (function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.pathname) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

Rules:

- Copilot must always include SPA rewrite logic.  
- Copilot must never generate server-side routing for GitHub Pages.  

---

# 4. Caching Strategy

Vite uses content-hashed assets.  
Copilot must enforce correct caching:

## Entry Point (`index.html`)

```http
Cache-Control: no-cache, no-store, must-revalidate
```

## Hashed Assets (`/assets/*.js`, `/assets/*.css`)

```http
Cache-Control: public, max-age=31536000, immutable
```

Rules:

- index.html must never be cached aggressively  
- hashed assets must use long-term immutable caching  
- Copilot must never generate caching rules that break SPA routing  

---

# 5. Deployment Steps (Frontend + Backend Separation)

## 1. Validate locally

```bash
cd web
npm run build && npm run preview
```

## 2. Frontend build

```bash
cd web && npm run build
```

## 3. Backend push (manual step)

```bash
cd gas && clasp push
```

## 4. Web App deploy (manual)

- Deploy via Apps Script UI  
- Copy new `/exec` URL  
- Paste into `.env.local` as `VITE_GAS_BASE_URL`  

Rules:

- Copilot must never generate automated GAS deployment.  
- Copilot must never combine frontend and backend deploys.  

---

# 6. Troubleshooting

Copilot must include these rules when generating troubleshooting steps:

- **404 on refresh** → SPA rewrites missing  
- **Old code after deploy** → index.html cached  
- **clasp auth issues** → run `clasp login`  
- **Vite build errors** → run `tsc --noEmit`  
- **CORS issues** → check GAS Web App permissions  

---

# 7. Rollback

Copilot must generate rollback steps in this form:

- Restore from git:  
  `git checkout <previous-commit>`  
- Re-deploy old build from `dist/` backup  
- Revert GAS deployment via Apps Script UI version history  

Rules:

- Copilot must never generate automated rollback for GAS.  

---

# 8. Required Behavior for Copilot

When generating CI/CD or deployment logic, Copilot must:

- treat frontend and backend as separate deploy targets  
- never deploy GAS automatically  
- never generate workflows that push GAS code  
- never generate workflows that modify Apps Script versions  
- always include SPA rewrite rules  
- ensure index.html is not cached  
- ensure hashed assets use immutable caching  
- never leak environment variables or secrets  
- always include local build validation  
- never assume GitHub Pages is the only hosting target  

---

# 9. Prohibited Behavior

Copilot must not:

- generate CI workflows that deploy GAS  
- combine frontend and backend deploy steps  
- generate caching rules that break SPA routing  
- skip build validation  
- expose `.env` values in CI logs  
- assume a fixed hosting provider  
- generate alternative deployment models  

---

# 10. Interaction With Other Skills

### **vite-react-performance**
Ensures build output is optimized; this skill ensures it is deployed correctly.

### **wire-react-to-gas**
Ensures correct GAS URL is propagated to `.env.local`.

### **security-secrets**
Ensures no secrets leak in CI logs or artifacts.

### **auth-flow**
Ensures login/session flows work after deploy.

### **setup-gas-webapp**
Ensures backend deploy remains manual and separate.

---

# 11. Future Extensions

This skill describes the current CI/CD model.  
Copilot must not assume GitHub Pages, GAS, or Vite are fixed deployment tools.  
New hosting providers or pipelines may be added without breaking this skill.

