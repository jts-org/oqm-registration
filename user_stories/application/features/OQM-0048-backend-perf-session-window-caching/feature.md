---
name: Feature Request
about: Propose a new feature or enhancement
labels: feature
---

# Feature Request

## Summary
Reduce backend response latency for session-window routes by eliminating redundant `SpreadsheetApp.openById()` calls and caching computed session-window output. Users reported slowness in the app; review of `gas/Code.gs` found `getCoachSessions_`/`getTraineeSessions_` reopening the spreadsheet 4-5 times per request despite a misleading "cached" comment, plus per-request logging overhead. Introduce a request-scoped sheet reader (no global mutable state) and short-TTL `CacheService` caching for the two read-only session-window routes.

## User Story
_As a coach or trainee using the registration app, I want the session schedule to load quickly so that I don't experience delays when checking or registering for sessions._

## Acceptance Criteria
- [x] `getSpreadsheet()`/`getSheetByName()`/`getSheetData()` redundant `openById()` calls eliminated via a request-scoped `createSheetReader_()` factory, threaded explicitly as a function parameter (no top-level/global mutable state introduced).
- [x] `getCoachSessions_`, `getTraineeSessions_`, `registerCoachForSession_`, `removeCoachFromSession_` updated to accept and use the reader.
- [x] Computed session-window output cached in `CacheService` (25s TTL, fail-open via try/catch) for `getCoachSessions_`/`getTraineeSessions_` read paths only; write routes (`registerCoachForSession_`/`removeCoachFromSession_`) continue to perform fresh atomic reads under lock.
- [x] Cache key excludes any identity fields; `getTraineeSessions_` caches only the identity-independent base session array, with `trainee_registered` enrichment always computed fresh per request/identity.
- [x] `logToSheet`/`json_` no longer open the spreadsheet or read `Logs!A1` on every request when logging is disabled (gated by cached `isLoggingEnabled_()` flag); `json_` avoids double `JSON.stringify`.
- [x] No API contract, response envelope, sheet schema, or route changes.
- [x] Existing backend test suite passes unmodified in behavior; new tests added asserting `openById` call-count reduction and cache hit/miss/fail-open behavior.
- [x] `learnings.md` updated if needed — captured in track `lessons.md` and promoted to `.github/skills/gas-backend-architecture/SKILL.md` and `.github/instructions/backend.instructions.md`.

## Relevant Skills
(Select all that apply)

- Backend Logic  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/gas-backend-architecture/SKILL.md

- Continuous learning
  @see .github/skills/continuous-learning/SKILL.md  

## Additional Notes
Implemented via track `tracks/feature-backend-perf-session-window-caching/` (spec.md, plan.md, lessons.md). Sheet archiving of old registration rows and any frontend changes were explicitly evaluated and deferred as out of scope — frontend already fetches once on mount with no polling and does client-side grouping/sorting. Backend change requires manual Apps Script UI deploy (no CI auto-deploy) before reaching production.