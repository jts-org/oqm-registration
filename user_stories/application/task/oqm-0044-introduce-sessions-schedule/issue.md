# Technical Task

## Summary
Replace sessions and weekly_schedule as the source for frontend session collection in GAS with sessions_schedule for:
- getCoachSessions_ in gas/Code.gs
- getTraineeSessions_(traineeIdentity) in gas/Code.gs

The migration must keep current response objects unchanged so frontend implementation does not require changes.

## Scope
Included:
- Update backend data collection logic in gas/Code.gs so sessions_schedule becomes the canonical source for regular session schedule data in getCoachSessions_ and getTraineeSessions_.
- Preserve current response contract (field names, field availability, and ordering expectations) for both routes.
- Preserve existing behavior for free/sparring and camp replacement logic.
- Add/update tests in gas/__tests__ to enforce response compatibility and prevent regressions.

Explicitly not included:
- Frontend refactors in web/src.
- Auth/session changes.
- Unrelated performance or architecture refactors outside the two target functions.
- Sheet schema redesign beyond consuming existing sessions_schedule contract.

Constraint:
- If backend-only migration cannot preserve current response contract, stop and escalate to human developer for coordinated frontend issue handling.

## Relevant Skills
(Select all that apply)

- API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md

- Backend Architecture  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/security-secrets/SKILL.md

- Date and Time Handling  
  @see .github/skills/gas-date-and-time/SKILL.md

- Schema Reference  
  @see .github/skills/sheet-schema/SKILL.md

- Continuous learning  
  @see .github/skills/continuous-learning/SKILL.md

## Acceptance Criteria
- [ ] getCoachSessions_ in gas/Code.gs uses sessions_schedule as schedule source instead of sessions + weekly_schedule.
- [ ] getTraineeSessions_(traineeIdentity) in gas/Code.gs uses sessions_schedule as schedule source instead of sessions + weekly_schedule.
- [ ] Response object contract for both routes remains unchanged for existing frontend consumers.
- [ ] Existing behavior for free/sparring inclusion remains unchanged.
- [ ] Existing behavior for camp-date replacement remains unchanged.
- [ ] Session ordering remains date asc, then start_time asc.
- [ ] Tests updated or added in gas/__tests__ to verify unchanged response contract and no regressions.
- [ ] No frontend change required in web/src; if required, escalation is documented for human developer.
- [ ] All relevant skills followed.
- [ ] learnings.md updated if a reusable migration pattern is identified.

## Additional Notes
- Current route compatibility is critical because frontend expects stable session payloads.
- Prefer introducing an internal mapping layer from sessions_schedule rows to existing response shape to minimize regression risk.
- Validate both public getTraineeSessions and coach-protected getCoachSessions route behavior after migration.