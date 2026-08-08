```markdown
---
name: deploy-ci
description: CI, build validation, and GitHub Pages deployment rules for the OQM Registration frontend. Authoritative model for CI workflows, Vite builds, SPA routing, caching, and separation of frontend/backend deploys.
license: MIT
---

# CI & GitHub Pages Deploy

Authoritative CI/CD model for the OQM Registration frontend.  
Defines build validation, GitHub Pages deploy, SPA routing, caching, troubleshooting, rollback, and strict separation of frontend and backend deploys.

---

## 1. CI Build Validation

Local validation before pushing:

```bash
cd web
npm run build      # TypeScript + Vite build
npm run preview    # Serve dist/ locally
```

Rules:
- CI must run TypeScript checks + Vite build.  
- CI must never skip build validation.  
- CI must never deploy unvalidated builds.

---

## 2. GitHub Pages Deployment (Frontend Only)

Frontend deploys to GitHub Pages.  
Backend (GAS) is **always manual**.

Rules:
- Frontend and backend are separate deploy targets.  
- GitHub Pages deploy affects only the Vite SPA.  
- GAS deploy is never automated.

---

## 3. SPA Routing (GitHub Pages)

GitHub Pages has no server-side routing.  
Copilot must always generate SPA rewrite logic.

### Required `404.html` Redirect

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

### Optional `index.html` Redirect

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
- SPA rewrite logic is mandatory.  
- Never generate server-side routing for GitHub Pages.

---

## 4. Caching Strategy

Vite uses content-hashed assets.  
Copilot must enforce correct caching.

### `index.html`
```
Cache-Control: no-cache, no-store, must-revalidate
```

### Hashed Assets (`/assets/*.js`, `/assets/*.css`)
```
Cache-Control: public, max-age=31536000, immutable
```

Rules:
- `index.html` must never be cached aggressively.  
- Hashed assets must use immutable caching.  
- Never generate caching rules that break SPA routing.

---

## 5. Deployment Steps (Frontend + Backend Separation)

### 1. Validate locally
```bash
cd web
npm run build && npm run preview
```

### 2. Frontend build
```bash
cd web && npm run build
```

### 3. Backend push (manual)
```bash
cd gas && clasp push
```

### 4. Web App deploy (manual)
- Deploy via Apps Script UI  
- Copy new `/exec` URL  
- Update `.env.local` → `VITE_GAS_BASE_URL`

Rules:
- Never automate GAS deployment.  
- Never combine frontend + backend deploys.

---

## 6. Troubleshooting

Copilot must include:

- **404 on refresh** → SPA rewrites missing  
- **Old code after deploy** → `index.html` cached  
- **clasp auth issues** → `clasp login`  
- **Vite build errors** → `tsc --noEmit`  
- **CORS issues** → check GAS Web App permissions

---

## 7. Rollback

Rollback steps:

- Restore via git:  
  `git checkout <previous-commit>`  
- Re-deploy old `dist/` build  
- Revert GAS deployment via Apps Script UI version history  

Rules:
- Never generate automated GAS rollback.

---

## 8. Required Behavior for Copilot

Copilot must:

- treat frontend + backend as separate deploy targets  
- never deploy GAS automatically  
- never generate workflows that push GAS code  
- never modify Apps Script versions in CI  
- always include SPA rewrite rules  
- ensure correct caching (index.html no-cache, assets immutable)  
- never leak env vars or secrets  
- always include local build validation  
- never assume GitHub Pages is the only hosting provider

---

## 9. Prohibited Behavior

Copilot must not:

- deploy GAS in CI  
- combine frontend + backend deploy steps  
- generate caching rules that break SPA routing  
- skip build validation  
- expose `.env` values in CI logs  
- assume fixed hosting provider  
- generate alternative deployment models

---

## 10. Interaction With Other Skills

- **vite-react-performance** — ensures optimized build output  
- **wire-react-to-gas** — ensures correct GAS URL in `.env.local`  
- **security-secrets** — prevents secret leakage in CI  
- **auth-flow** — ensures login/session flows work after deploy  
- **setup-gas-webapp** — enforces manual backend deploy

---

## 11. Future Extensions

This skill describes the current CI/CD model.  
Copilot must not assume GitHub Pages, GAS, or Vite are fixed.  
New hosting providers or pipelines may be added without breaking this skill.
```
