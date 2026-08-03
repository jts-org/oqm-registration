```markdown
---
name: setup-react-vite
description: Minimal onboarding and setup steps for the OQM React + Vite frontend. This skill stays intentionally concise and delegates deeper guidance to performance and CI skills.
license: MIT
---

# Setup: React + Vite (Frontend)

Minimal, authoritative onboarding steps for running the OQM frontend locally.  
Production, performance, and deployment rules live in **vite-react-performance** and **deploy-ci**.

---

## 1. Quick Start

### Install dependencies
```bash
cd web && npm install
```

### Create `.env.local`
```env
VITE_GAS_BASE_URL=https://script.google.com/macros/s/<YOUR_EXEC_ID>/exec
```

Rules:
- `VITE_GAS_BASE_URL` is **required**  
- Copilot must never generate or use `VITE_API_TOKEN` (legacy)  
- Copilot must never embed the GAS URL directly in code  
- Copilot must always instruct manual update of `.env.local`  

### Start dev server
```bash
cd web && npm run dev
```

---

## 2. Required Behavior for Copilot

Copilot must:
- always reference `.env.local` for GAS URL  
- never hardcode backend URLs  
- never generate frontend code that reads Script Properties  
- never generate legacy `VITE_API_TOKEN` usage  
- always use the unified API contract (`{ route, payload, sessionToken }`)  
- always keep setup instructions minimal and consistent with CI + performance skills  

---

## 3. Interaction With Other Skills

### **vite-react-performance**
- Code splitting  
- Lazy loading  
- Bundle optimization  

### **deploy-ci**
- Build validation  
- GitHub Pages deployment  
- SPA routing + caching rules  

### **wire-react-to-gas**
- API contract  
- Request/response shapes  
- SessionToken handling  

### **security-secrets**
- Ensures no secrets leak into frontend  
- Ensures `.env.local` contains only safe values  

---

## 4. Notes

- `VITE_GAS_BASE_URL` is the only required environment variable.  
- Frontend must never store secrets or sessionToken permanently.  
- Frontend must always pass sessionToken explicitly in each request.  
- All production build and deploy rules live in **deploy-ci**.  
- All performance rules live in **vite-react-performance**.

```
