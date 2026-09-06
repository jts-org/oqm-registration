---
name: Feature Request
about: Propose a new feature or enhancement
labels: feature
---

# Feature Request

## Summary
Each customer event has a QR code printed or displayed at the gym. The trainee scans it with a phone and opens:

- https://jts-org.github.io/oqm-registration/register?customer-event=<id>

The query parameter identifies the customer event. When the event has two or more available sessions, the registration flow lets the trainee choose any non-empty subset. When exactly one session is available, it is selected automatically without presenting a session-selection control. The flow then requests confirmation and trainee identity details and completes registration.

## Problem Statement
Customer-event attendees need a direct registration entry point that identifies the intended event and supports registering for its relevant sessions without manually locating the event in the application.

## User Story
As a participant of a customer event, I want to scan its QR code and register myself for its training sessions, so that I can complete registration from my phone.

## Scope

### In Scope
- Route handling for `/register?customer-event=<id>`.
- Customer-event session resolution using the supplied identifier and customer-event schedule data.
- Selection of any non-empty subset when two or more sessions are available, or automatic selection when exactly one session is available.
- Confirmation and collection of trainee name and age before a registration attempt.
- Registration write to `trainee_registrations` only after user confirmation.
- Customer-event activity resolution subject to the clarified rules below.

### Out of Scope
- QR generation tooling itself.
- Local-storage-assisted identity reuse.
- Changes to the existing trainee identity model.
- Any frontend direct integration to Google APIs.
- PIN enquiry

## Functional Requirements

### 1. QR URL and Event Resolution
- The app must read the `customer-event` query parameter from `/register`.
- A missing, invalid, or unresolvable customer-event identifier must stop the registration flow, present a clear user-facing outcome, and cause no registration write.
- The backend must resolve the customer event and its available sessions from the identifier and schedule data; the frontend must not make this decision from Google APIs.

### 2. Session Selection
- When a resolved customer event has two or more available sessions, the app must present them for selection and allow the trainee to choose any non-empty subset.
- When a resolved customer event has exactly one available session, the app must select it automatically and must not present a session-selection control.
- When a resolved customer event has no available sessions, the app must not attempt registration.

### 3. Confirmation, Identity, and Registration
- Before sending a registration request, the app must show a summary of the resolved customer event, selected session or sessions, and collected trainee identity details.
- The app must collect the trainee's name and age before a registration attempt.
- Explicit confirmation is the sole client-side gate for sending a registration write.
- The backend must write successful registrations to `trainee_registrations` through the existing API, validation, atomic locking, and sheet-operation contracts.
- Duplicate prevention must be enforced within the atomic backend write path; a rejected duplicate must make no additional sheet write.
- The app must clearly communicate, accessibly and in the active locale, the success or failure of each requested registration.

### 4. Current-Day and Active-Event Decisions
- The backend, using its configured timezone, is authoritative for decisions that depend on the current day or event activity.
- Date comparisons and normalization must be covered on both sides of a backend-midnight boundary; browser-local time must not control eligibility.
- The detailed customer-event activity rule and its schedule/data model mapping remain open until the owning contract is clarified.

## Non-Functional Requirements
- Frontend-to-backend calls must follow the existing `wire-react-to-gas` contract; no route, payload field, or error code is introduced by this brief.
- Backend responses must use the existing `{ ok, data }` or `{ ok, error }` envelope.
- Any backend read-validate-write registration operation must follow existing atomic locking and sheet schema rules.
- User-facing registration states must be localized, accessible, and usable on a phone.
- Backend timezone is authoritative for current-day decisions; frontend behavior must not conflict with it at a day boundary.
- If implementation creates or changes a public route, payload, error code, or user-visible flow, the detailed API contract, method-qualified route inventory, and relevant user manuals must be updated together.

## Acceptance Criteria
- [ ] Opening `/register?customer-event=<id>` with an identifier that the backend resolves starts the customer-event registration flow.
- [ ] A missing, invalid, or unresolvable `customer-event` identifier shows a clear outcome, stops the flow, and produces no registration write.
- [ ] When the resolved event has two or more available sessions, they are presented for selection and a trainee can choose any non-empty subset.
- [ ] When the resolved event has exactly one available session, it is selected automatically and no session-selection control is presented.
- [ ] When the resolved event has no available sessions, the flow does not attempt registration.
- [ ] The flow collects trainee name and age and shows the resolved event, selected session or sessions, and identity summary before submission.
- [ ] No registration request is sent until the trainee explicitly confirms the summary.
- [ ] Successful registrations are written to `trainee_registrations` through the existing backend contract.
- [ ] Duplicate rejection is enforced in the atomic backend write path and leaves the sheet append count unchanged.
- [ ] The trainee receives a localized, accessible, and clear success or failure outcome for each requested registration, including multi-session results.
- [ ] Route query branches and zero-, one-, and multiple-session availability behavior are covered by validation.
- [ ] Validation confirms that explicit confirmation is required before a registration write is sent.
- [ ] Current-day and activity-dependent behavior is validated against the backend timezone, including date normalization on both sides of a backend-midnight boundary once the activity rule is defined.
- [ ] Validation covers duplicate no-write behavior and the defined multi-session outcome semantics.
- [ ] When applicable, implementation updates the detailed API contract, method-qualified route inventory, and relevant user manuals together for public contract or user-visible-flow changes.
- [ ] `learnings.md` is updated if implementation reveals a reusable pattern or constraint.

## Review-Resolved Ambiguities
- The QR parameter identifies a customer event, while the backend resolves the event and the sessions available for registration.
- For two or more available sessions, the trainee may choose any non-empty subset of the sessions made available by the resolved customer-event flow; this does not assert an undocumented schedule query or session model.
- Identity collection is limited here to the stated name and age interaction. Storage, lookup, validation, and exact payload/schema details are not defined by this brief.
- No API route names, request fields, response data fields, or error codes are specified beyond the existing contract envelope.

## Open Questions
- What data entity and stable identifier does `customer-event=<id>` reference, and where is its authoritative mapping defined?
- Which schedule rows qualify as sessions available for a resolved customer event, including any date, active-status, capacity, or eligibility rules?
- What is the precise customer-event active-resolution rule, and does it differ from existing session activity rules?
- When multiple sessions are selected, does registration result in one atomic multi-session operation or separate registration attempts, and how should partial success be represented under the existing contract?
- How are qualifying `customer_event_schedules` rows deterministically mapped to, or represented as, registrations compatible with `trainee_registrations` without relying on unverified field names or schema assumptions?
- Which existing identity and registration fields, validations, and duplicate-registration behavior apply to this flow?

## Relevant Skills
(Select all that apply)

- API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md

- Frontend Architecture  
  @see .github/skills/frontend-architecture/SKILL.md

- UX & Accessibility  
  @see .github/skills/frontend-ux-and-accessibility/SKILL.md

- Responsive Design  
  @see .github/skills/frontend-responsive-design/SKILL.md

- i18n  
  @see .github/skills/frontend-i18n/SKILL.md

- Performance  
  @see .github/skills/frontend-performance/SKILL.md

- Backend Logic  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/gas-validation-rules/SKILL.md  
  @see .github/skills/gas-date-and-time/SKILL.md  
  @see .github/skills/gas-id-generation/SKILL.md

- Continuous learning
  @see .github/skills/continuous-learning/SKILL.md  

## Additional Notes
Add screenshots, diagrams, or references if helpful.
