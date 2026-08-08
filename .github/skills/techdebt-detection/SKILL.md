```markdown
# Tech‑Debt Detection Workflow (React + Vite + GAS)

Authoritative workflow for detecting technical debt in the OQM Registration System.  
Tailored to the exact repo structure:

```plaintext
web/   # React + Vite SPA
gas/   # Google Apps Script backend
```

Frontend uses automated tooling.  
Backend uses rule‑based/manual checks aligned with GAS skill constraints.

---

## 1. Frontend (React + Vite) — Automated Suite

### 1.1 Duplication (jscpd)
```bash
npx jscpd web/src --min-lines 5 --min-tokens 50 --reporters markdown
```
Detects copy‑paste React components, hooks, dialogs, forms.

---

### 1.2 Circular Dependencies (madge)
```bash
npx madge --circular --extensions ts,tsx web/src
```
Detects cycles that break Vite HMR, lazy loading, and tree‑shaking.

---

### 1.3 Dependency Graph Health (dependency-cruiser)
```bash
npx dependency-cruiser web/src --config .dependency-cruiser.js
```
Detects cross‑feature leakage, forbidden imports, feature coupling.

---

### 1.4 Complexity (ESLint)
Enable:
```json
"complexity": ["error", { "max": 10 }],
"max-depth": ["error", 4],
"max-lines-per-function": ["error", 50],
"max-nested-callbacks": ["error", 3]
```
Run:
```bash
npx eslint web/src
```
Detects oversized components, deeply nested logic, unmaintainable hooks.

---

### 1.5 Bundle Size Analysis (rollup-plugin-visualizer)
```bash
npm run build
npx rollup-plugin-visualizer --open dist/stats.html
```
Detects accidental full MUI imports, duplicated dependencies, dist imports.

---

### 1.6 Test Coverage (Vitest)
```bash
npm run test -- --coverage
```
Detects untested hooks, API clients, business logic.

---

### 1.7 Performance Regression (Lighthouse)
```bash
npm run build && npm run preview
lighthouse http://localhost:4173 --quiet --chrome-flags="--headless"
```
Detects slow initial load, missing lazy loading, unoptimized images.

---

## 2. Backend (GAS) — Rule‑Based Detection

Automated tools are limited.  
Backend tech‑debt detection follows GAS skill rules:

- **sheet-schema**  
- **gas-locking-and-concurrency**  
- **gas-date-and-time**  
- **gas-id-generation**  
- **gas-error-handling**  
- **security-secrets**

---

### 2.1 Duplication (jscpd)
```bash
npx jscpd gas/ --min-lines 5 --min-tokens 50
```

---

### 2.2 Concurrency Safety
```bash
grep -R "tryLock" gas/
grep -R "releaseLock" gas/
```
Manual checks:
- no writes outside locks  
- no nested locks  
- full read → validate → write inside lock  
- correct `concurrent_request` / `concurrent_operation` mapping  

---

### 2.3 Date/Time Correctness
```bash
grep -R "Utilities.formatDate" gas/
grep -R "new Date(" gas/
```
Manual checks:
- Europe/Helsinki timezone  
- ISO‑8601 serialization  
- correct overlap detection  
- correct serial date parsing  

---

### 2.4 ID Generation Correctness
Manual checks:
- UUIDs via `Utilities.getUuid()`  
- no Math.random  
- no timestamp IDs outside locks  
- no regeneration of existing IDs  

---

### 2.5 Error Handling Correctness
Manual checks:
- strict `{ ok: false, error: "<code>" }`  
- only allowed error codes  
- no nested error objects  
- no raw exceptions returned  

---

### 2.6 Secret Handling
Manual checks:
- no Script Properties logged  
- no secrets written to Sheets  
- no secrets in frontend  
- no sessionToken stored permanently  

---

### 2.7 Schema Drift (Critical)
Manual checks:
- column order matches **sheet-schema**  
- required fields present  
- foreign keys valid  
- no dynamic column detection  
- no partial writes  

---

## 3. Combined Pipeline (Full Run)

### Frontend
```bash
npx jscpd web/src
npx madge --circular web/src
npx dependency-cruiser web/src
npx eslint web/src
npm run test -- --coverage
npm run build
npx rollup-plugin-visualizer
lighthouse http://localhost:4173
```

### Backend
```bash
npx jscpd gas/
grep -R "tryLock" gas/
grep -R "Utilities.formatDate" gas/
grep -R "new Date(" gas/
```

Manual checks:
- schema alignment  
- concurrency correctness  
- date/time correctness  
- ID generation correctness  
- error handling correctness  
- secret handling correctness  

---

## 4. Required Report Format

```markdown
## Techdebt Detection Results

**Stack**: React + Vite + GAS  
**Tools Used**: <list>  
**Analyzed**: <files/lines>

### Critical Issues (Fix Now)
1. <description>  
   - <lines>  
   - Refactor: <suggestion>

### High Priority (Fix Soon)
- <items>

### Medium Priority (Technical Debt)
- <items>

### Metrics
- Duplication: X%  
- High Complexity: Y  
- Coverage: Z%  
- Outdated Dependencies: N  

### Recommendations
1. <action>  
2. <action>  
3. <action>
```

---

## 5. PR Gate Rules

Block PRs if:
- new duplication introduced  
- new circular deps  
- complexity increased  
- coverage decreased  
- GAS logic violates any skill rules  
- schema drift detected  

---

## 6. Weekly Trend Tracking

Track:
- duplication %  
- complexity hotspots  
- coverage %  
- bundle size  
- GAS violations  

---

# Summary

Frontend → automated detection  
Backend → rule‑based detection aligned with GAS skills  
Unified report → PR gating + weekly trends

This workflow is optimized, mandate‑first, and tailored exactly to your repo.
```