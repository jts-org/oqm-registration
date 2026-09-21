---
name: OQM-0051 - Sparring as scheduled session
about: Allow admins to schedule free/sparring sessions through sessions_schedule
labels: feature
---

# OQM-0051 - Sparring as Scheduled Session

## Summary
As an admin, I want to schedule free/sparring sessions in `sessions_schedule` alongside advanced, fitness, basic, and joint sessions, so that sparring follows the same schedule-management flow while remaining available for its existing registration and setup behavior.

Free/sparring must not overlap another training session when both `location` and `location_alias` identify the same location. The conflict rule must be enforced by GAS in the atomic schedule write path; the frontend must present the backend validation result without duplicating business logic.

## Problem Statement
The schedule-management flow already exposes free/sparring-compatible fields, but schedule conflict detection does not consistently include `location_alias`. Existing reads and registration logic also use data from `sessions_schedule`, `trainee_registrations`, and `coach_registrations` in different ways. This task must establish the correct impact before changing any sheet schema or public API contract.

## Scope
Included:
- Confirm and preserve the existing `sessions_schedule` schema and admin CRUD routes.
- Allow `free/sparring` / `sparring` schedule rows to be added, edited, listed, activated, and deleted through the existing admin schedule panel and routes.
- Enforce overlap validation for active schedule rows using the existing date-range, weekday, and time-window semantics.
- Treat `location` and `location_alias` together as the location identity for conflict detection: matching both values is required for a conflict; a difference in either value permits the schedule.
- Update add and update validation so the composite location identity is applied consistently, including self-exclusion during update.
- Trace consumers that read `sessions_schedule` and registration sheets to ensure free/sparring scheduling does not regress trainee or coach session resolution and registration behavior.
- Add focused backend and frontend tests for successful scheduling, conflict rejection, update behavior, and unchanged registration contracts.
- Update API/schema skill documentation and both relevant admin/coach/trainee manuals if the implemented flow or user-visible behavior changes.

Explicitly not included:
- Redesigning `sessions_schedule`, `trainee_registrations`, or `coach_registrations` columns.
- Adding new routes, payload fields, or error codes unless an existing contract is proven insufficient and separately approved.
- Changing the existing free/sparring setup, coach-registration eligibility rule, or trainee-registration identity model without evidence from the contract review.
- Frontend direct access to Google Sheets or client-only enforcement of the overlap rule.
- Unrelated schedule, registration, or performance refactors.

## Dependencies and Investigation Gates
- OQM-0044 schedule migration: `sessions_schedule` is the canonical source for regular scheduled-session data.
- OQM-0049 sparring registration: preserve the existing same-day free/sparring coach-registration requirement unless the contract review identifies a contradiction.
- Verify whether `trainee_registrations` and `coach_registrations` contain enough location context for any requested overlap behavior. Do not add columns merely to mirror `sessions_schedule`.
- Confirm the existing normalization rules for dates, weekdays, times, location, and location alias before implementation.
- Resolve whether legacy active rows with the same location but different aliases remain valid. The default planning assumption is yes; only new or edited writes must apply the corrected composite key unless migration is explicitly requested.

## Relevant Skills
(Select all that apply)

- API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md  
  @see .github/skills/gas-route-registry/SKILL.md  
  @see .github/skills/gas-response-format/SKILL.md

- Backend Architecture and Sheet Operations  
  @see .github/skills/gas-backend-architecture/SKILL.md  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/sheet-schema/SKILL.md  
  @see .github/skills/gas-locking-and-concurrency/SKILL.md

- Validation and Date/Time Handling  
  @see .github/skills/gas-validation-rules/SKILL.md  
  @see .github/skills/gas-date-and-time/SKILL.md

- Frontend Architecture and UX  
  @see .github/skills/frontend-architecture/SKILL.md  
  @see .github/skills/frontend-ux-and-accessibility/SKILL.md  
  @see .github/skills/frontend-i18n/SKILL.md

- Documentation and Continuous Learning  
  @see .github/skills/documentation-update/SKILL.md  
  @see .github/skills/continuous-learning/SKILL.md

## Acceptance Criteria
- [ ] An admin can add an active or inactive free/sparring schedule through the existing `sessions_schedule` CRUD flow using the same editable fields as other scheduled session types.
- [ ] Free/sparring schedules are returned by the existing admin list route and remain editable and deletable without changing the response envelope or existing field names.
- [ ] An add or update is rejected when another active training schedule has overlapping date range, weekday, and time window and matching `location` and `location_alias`.
- [ ] An add or update is allowed when either `location` or `location_alias` differs, even when all other schedule values overlap.
- [ ] Updating a schedule does not conflict with its own existing row, but does conflict with another matching row.
- [ ] Inactive rows do not block a new or updated schedule unless existing contract rules explicitly state otherwise.
- [ ] Conflict checks run inside the existing atomic read-validate-write lock and no partial sheet row is written after rejection.
- [ ] Date, weekday, time, location, and location-alias comparisons use the repository's established normalization rules and timezone behavior.
- [ ] Existing advanced, fitness, basic, joint, camp, and free/sparring session resolution remains compatible for coach and trainee session reads.
- [ ] Existing `trainee_registrations` and `coach_registrations` payloads, duplicate behavior, and sparring eligibility behavior remain unchanged unless a documented contract gap is found and approved.
- [ ] Backend tests cover add and update conflict rejection, differing aliases/locations, inactive rows, self-update exclusion, and no-write-on-rejection behavior.
- [ ] Tests cover at least one end-to-end consumer path proving a scheduled free/sparring row is handled correctly by session resolution and registration eligibility.
- [ ] Admin UI tests cover submitting free/sparring schedule data and displaying the existing localized backend error state for a rejected conflict.
- [ ] If API routes, payloads, error codes, sheet schemas, or user-visible flow change, the corresponding skill documents and `user_manuals/*.en.md` / `user_manuals/*.fi.md` files are updated in the same change.
- [ ] `learnings.md` and the continuous-learning log are updated if implementation reveals a reusable scheduling or sheet-concurrency pattern.

## Additional Notes
Known implementation anchors:
- Schedule CRUD: `gas/Code.gs` functions `addSessionSchedule_`, `updateSessionSchedule_`, `listSessionsSchedule_`, and `deleteSessionSchedule_`.
- Admin UI: `web/src/features/admin/components/AdminSessionsSchedulePanel.tsx` and `web/src/features/admin/api/admin.api.ts`.
- Schedule tests: `gas/__tests__/addSessionSchedule.test.js` and `gas/__tests__/updateSessionSchedule.test.js`.
- Session consumers: `getCoachSessions_`, `getTraineeSessions_`, and `registerCoachForSession_` in `gas/Code.gs`.

The cheapest discriminating test is a pair of otherwise identical active schedules: one with the same `location` and `location_alias` must be rejected, while changing only `location_alias` must be accepted. The same pair must be exercised for both add and update routes.
