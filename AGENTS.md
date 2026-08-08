# AGENTS.md  
Authoritative entry point for all agents.  
Mandates first → roles → architecture → workflow → anti‑patterns → navigation.

---

# 1. Core Mandates (≤15, non‑negotiable)

1. **Strict API Contract** — All frontend↔backend calls follow `wire-react-to-gas`.  
2. **Strict Response Format** — Backend returns only `{ ok, data }` or `{ ok, error }`.  
3. **Strict Sheet Schema** — Column order, types, and validation follow `sheet-schema`.  
4. **Strict Atomicity** — All read→validate→write operations occur inside a single lock.  
5. **Strict SessionToken Rules** — Validate before handler; never bypass; never invent fields.  
6. **Strict No Secrets** — No secrets in repo; no dynamic Script Properties writes.  
7. **Strict No Global Mutable State** — No global caches, arrays, counters, or mutable objects.  
8. **Strict Architecture Boundaries** — No frontend Google API calls; backend only.  
9. **Strict No HTML/Exceptions** — Backend never returns HTML or raw exceptions.  
10. **Strict No Dynamic Schema Detection** — No `getLastRow()` inference; stable indexes only (see `sheet-schema`).  
11. **Strict No Invented Routes/Fields** — Only documented routes, payloads, and error codes.  
12. **Strict Track Ownership** — `plan.md` is topology-only (phase map, task index, dependencies, gates, pointers). `coordination.md` is Mimir orchestrator-only. Task packets are authoritative execution surfaces.  
13. **Strict Board Delta Flow** — Specialists never edit `coordination.md`; they emit `Board Delta` in task packets for Mimir to project.  
14. **Strict Documentation Updates** — Manuals + SKILL.md updated when UI/flow/API/schema change.  
15. **Strict Continuous-Learning Discipline** — Durable instruction changes logged in `continuous-learning.log.md`.

---

# 2. Agent Roles (crisp, non-overlapping)

### Orchestrator
- Sequence work, delegate tasks, maintain `coordination.md`.  
- Enforce board ownership and packet flow.

### Planner
- Create tracks, topology, gates, replans.  
- Normalize product framing into planning packets.  
- Produce thin `plan.md`.

### Implement
- Execute tasks, update packets (`Packet`, `Edges`, `Context`, `Validation`, `Handoff Contract`, `Board Delta`).  
- Never modify `coordination.md` directly.

### Test-Engineer
- Validate outcomes, tracer bullets, evidence checks.  
- Confirm alignment with spec intent and rubric.

### Continuous-Learning
- Capture learnings, compact instructions, update durable surfaces.  
- Append promotion/retraction entries when required.

### Specialists
- Domain-specific execution (frontend, backend, sheets, API).  
- Follow architecture + skill constraints exactly.

---

# 3. Architecture Summary

**Frontend (`web/`)**  
React + Vite → feature-based architecture → strict API client rules → strict i18n → strict accessibility → strict responsive design.

**Backend (`gas/`)**  
Apps Script Web App → `doGet`/`doPost` → strict JSON responses → strict sessionToken validation → strict locking → strict sheet operations.

**Data Layer**  
Google Sheets → stable column indexes → typed rows → atomic writes → no partial writes → no dynamic schema detection.

**Deployment**  
Frontend: GitHub Pages.  
Backend: manual Apps Script UI deploy.  
CLASP for sync only.

---

# 4. Workflow (canonical)

1. Create issue (required).  
2. Apply **product-framing** if problem unclear.  
3. Normalize into planning packet (planner).  
4. Create track (planner).  
5. Implement tasks (implement).  
6. PR → CI → agent review → human review.  
7. Manual backend deploy if GAS changed.  
8. Documentation updates if UI/flow/API/schema changed.  
9. Continuous-learning session if reusable patterns discovered.

---

# 5. Definition of Done

- Issue linked.  
- Tests passing (TDD: failing → implement → pass).  
- All relevant skills followed.  
- API contract unchanged or updated.  
- Docs updated (`user_manuals/*.en.md`, `user_manuals/*.fi.md`, and relevant SKILL.md).  
- No secrets leaked.  
- Backend manually deployed if changed.  
- Reusable patterns added to `learnings.md`.

---

# 6. Anti-Patterns (never do)

- Commit secrets.  
- Hardcode URLs/tokens.  
- Change sheet schema without updating `sheet-schema`.  
- Bypass PR review or CI.  
- Mix refactors into feature PRs.  
- Auto-deploy GAS in CI.  
- Invent routes, fields, or error codes.  
- Write partial rows or dynamic ranges.  
- Modify `coordination.md` directly.  
- Put business logic in pages or UI logic in hooks.  
- Treat stakeholder phrasing as the problem (use product-framing).  
- Duplicate instruction content across files.

---

# 7. Onboarding

- Read AGENTS.md (this file).  
- Read `.github/skills/` (all skills).  
- Set up environment per README.  
- Review i18n, API contract, continuous-learning, frontend architecture, backend architecture.

---

# 8. Escalation

If blocked by CI or review → tag maintainer.

---

# 9. Skills Navigation (grouped)

### Infrastructure
- setup-react-vite  
- setup-gas-webapp  
- deploy-ci  

### Backend
- wire-react-to-gas  
- sheet-schema  
- gas-backend-architecture  
- gas-route-registry  
- gas-response-format  
- gas-sheet-operations  
- gas-validation-rules  
- gas-id-generation  
- gas-date-and-time  
- gas-error-handling  
- gas-locking-and-concurrency  
- auth-flow  
- security-secrets  

### Frontend
- frontend-architecture  
- frontend-ux-and-accessibility  
- frontend-responsive-design  
- frontend-i18n  
- frontend-performance  
- vite-react-performance  
- frontend-api-client  

### PR & Docs
- pr-review  
- documentation-update  

### Planning & Diagnostics
- mimir-best-practices  
- product-framing  
- review-work  
- debug  
- techdebt-detection  

### Continuous Learning
- continuous-learning

---

# 10. Quick Reference

1. Create issue  
2. Review API contract  
3. Follow frontend architecture + UX skills  
4. Apply performance skills  
5. Deploy frontend via GitHub Pages  
6. Deploy backend manually in Apps Script UI
