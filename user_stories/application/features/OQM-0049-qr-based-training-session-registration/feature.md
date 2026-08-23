---
name: OQM-0049 - QR-based training session registration
about: Register trainee to a specific same-day session via QR URL that encodes session selector
labels: feature
---

# Feature Request

## Summary
Each training session has its own QR code printed/displayed at the gym.
The trainee scans QR with a phone and opens:

- https://jts-org.github.io/oqm-registration/register?session=advanced
- https://jts-org.github.io/oqm-registration/register?session=fitness
- https://jts-org.github.io/oqm-registration/register?session=joint
- https://jts-org.github.io/oqm-registration/register?session=sparring
- https://jts-org.github.io/oqm-registration/register?session=basic

The session query parameter selects the target training session for registration.
This removes ambiguity when multiple sessions exist on the same day.

## Problem Statement
Current registration flow is ambiguous on days with multiple sessions.
Users need a deterministic way to register into the intended session without manual session picking.

## User Story
As a trainee, I want to scan a session QR code and register quickly, so that I am recorded in the correct training session for today.

## Scope

### In Scope
- Route handling for /register?session=<selector>.
- Session resolution based on selector and schedule data.
- Local storage assisted identity reuse (optional by user consent).
- Registration write to trainee_registrations after user confirmation.
- Special eligibility rule for sparring.
- Special active-course resolution rule for basic.

### Out of Scope
- QR generation tooling itself.
- Changes to existing trainee identity model fields.
- Any frontend direct integration to Google APIs.

## Functional Requirements

### 1. QR URL Contract
- App must parse required query parameter session from /register.
- Missing or unsupported session parameter must show clear user-facing error and stop registration flow.
- Session selector handling must be data-driven and extensible for future selectors.

### 2. Local Storage Branching

If local storage does not contain a valid saved trainee identity:
- App asks for trainee PIN, or name and age when PIN is not available/used.
- App fetches trainee identity data from GAS when PIN path is used.
- App asks explicit consent before storing identity (name and age) in local storage for future use.
- Saved local storage identity schema is fixed as:
  - pin (only when provided)
  - name
  - age
- If user declines consent, registration still proceeds for this session.
- If user accepts consent, app stores identity and shows privacy notice:
  - avoid storing on shared devices
  - data can be removed by user/browser cleanup/low-disk privacy actions
  - private/incognito mode data does not persist beyond session

If local storage contains a valid saved trainee identity:
- App does not ask for PIN/name/age again.
- App does not create a new local storage identity record.
- App uses saved identity for registration attempt.

### 3. Session Existence and Activity Checks (today only)
- For standard selectors (for example advanced, fitness, joint):
  - sessions_schedule must contain a row for current day where session_type matches selector mapping.
  - matched row active value must be active.
- If no eligible row exists for today, app informs user there is no training session to register today.

### 4. Sparring Rule
- For selector sparring, standard checks apply and additionally:
  - corresponding free/sparring coach registration must exist in coach_registrations for current day.
- If coach registration requirement is not met, registration must be rejected with clear reason.

### 5. Basic Course Rule
- For selector basic:
  - app resolves currently active basic course by finding active sessions_schedule row for current day where session_type starts with basic_.
  - trainee is registered to the resolved active basic course session type (not literal selector basic).
- If no active basic_ session exists for today, app informs user there is no basic course to register today.

### 6. Registration Confirmation and Write
- Before write, app shows resolved session and trainee identity summary.
- App sends registration to GAS only after explicit user confirmation.
- Backend stores registration in trainee_registrations using existing backend contract and validation rules.
- Backend must forbid duplicate registration for same trainee + same resolved session + same day.
- Duplicate registration attempt must return deterministic non-success response and must not write a new row.
- App must inform user clearly whether registration succeeded or failed.
- On failure, app must show actionable reason when available (for example no session today, duplicate registration, or eligibility failure).

### 6.1 Timezone Source of Truth
- Backend timezone is the source of truth for current-day checks.
- Frontend must not decide day validity independently when it can conflict with backend day resolution.
- Session existence and eligibility checks for current day use backend-resolved day.

### 7. Extensibility Requirement
- Implementation must not hardcode logic to only current selectors.
- Additions of future session selectors must be possible by extending a selector-to-resolution mapping and/or data configuration without redesigning flow.

## Non-Functional Requirements
- Contract compliance: frontend/backend API follows wire-react-to-gas.
- Response format: GAS follows strict ok/data or ok/error envelope.
- Atomic backend writes with existing lock/concurrency rules.
- User-facing messages are localized and accessible.
- Verification must include day-boundary tests around local midnight and backend timezone midnight.

## Acceptance Criteria
- [ ] Opening /register with supported session selector starts registration flow for that selector.
- [ ] Missing/invalid session selector shows deterministic error and no write occurs.
- [ ] Without saved local storage identity, app requests identity input and optional consent for storage.
- [ ] With saved local storage identity, app reuses it and skips PIN/name/age prompts.
- [ ] For standard selectors, registration proceeds only when today has active matching session.
- [ ] For sparring, registration additionally requires today coach registration in coach_registrations.
- [ ] For basic, registration resolves to active today basic_ session and writes resolved session type.
- [ ] If no eligible session exists for today, app shows no-session message and no write occurs.
- [ ] App shows confirmation summary before sending registration.
- [ ] Backend stores successful registration into trainee_registrations.
- [ ] Duplicate registration for same trainee + same resolved session + same day is rejected with no additional write.
- [ ] User is informed when registration succeeds.
- [ ] User is informed when registration fails, with reason when available.
- [ ] Privacy notice is shown when user is asked to persist identity.
- [ ] Local storage identity contains only pin (if provided), name, and age.
- [ ] Current-day session checks use backend timezone as source of truth.
- [ ] Boundary tests cover day-transition cases to verify timezone correctness.
- [ ] Session-selector handling is implemented so future selectors can be added without rewriting core flow.
- [ ] learnings.md updated if reusable patterns or constraints are discovered.

## Review Findings Addressed In This Spec

### High
- Ambiguity in basic session target resolved by explicit mapping to active basic_ session row for today.
- Ambiguity in sparring eligibility resolved by explicit dependency on same-day coach_registrations entry.

### Medium
- Ambiguity in invalid session query handling resolved with explicit fail-fast requirement.
- Ambiguity in local storage consent behavior resolved with explicit consent branch and decline path.
- Extensibility risk resolved by requiring selector-resolution mapping instead of fixed if-else tied to current set.

## Open Questions
- Whether saved local storage identity has a version marker for future schema changes.

## Relevant Skills
- API Contract
  - @see .github/skills/wire-react-to-gas/SKILL.md
- Frontend Architecture
  - @see .github/skills/frontend-architecture/SKILL.md
- UX and Accessibility
  - @see .github/skills/frontend-ux-and-accessibility/SKILL.md
- Responsive Design
  - @see .github/skills/frontend-responsive-design/SKILL.md
- i18n
  - @see .github/skills/frontend-i18n/SKILL.md
- Backend Route and Validation
  - @see .github/skills/gas-route-registry/SKILL.md
  - @see .github/skills/gas-validation-rules/SKILL.md
  - @see .github/skills/gas-date-and-time/SKILL.md
  - @see .github/skills/gas-sheet-operations/SKILL.md
  - @see .github/skills/gas-locking-and-concurrency/SKILL.md
  - @see .github/skills/gas-response-format/SKILL.md
- Continuous learning
  - @see .github/skills/continuous-learning/SKILL.md

## Additional Notes
This feature intentionally uses QR URL session selectors to disambiguate multi-session days with minimal user interaction.
