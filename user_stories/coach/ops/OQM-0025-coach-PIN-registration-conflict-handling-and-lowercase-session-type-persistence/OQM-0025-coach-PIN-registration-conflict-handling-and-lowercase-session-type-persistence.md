**Title:**
OQM-0025 Coach PIN registration conflict handling and lowercase session type persistence

**Description:**
Improve coach PIN registration conflict behavior to handle same-name rows safely, and normalize coach session registrations so session_type is always stored in lowercase.

**User Story:**
As a coach, I want clear and correct responses when registering my PIN, so that duplicate-name situations are handled predictably and I get understandable feedback in the UI.

**Scope:**
- Backend in gas:
	- Update registerCoachPin_(payload) with same-name handling and new error codes.
	- Update registerCoachForSession_(payload) so appended session_type is always lowercase in coach_registrations.
- Frontend in web:
	- Ensure registerCoachPin(data: RegisterPinData) returns new backend error codes to caller.
	- Show new user-facing error messages for the new error codes.
- Contract/docs:
	- Update API contract documentation for registerCoachPin route error cases.

**Out of Scope:**
- Changes to Google Sheet schema.
- New routes or payload fields.
- UI redesign beyond error handling for this flow.

**Preconditions:**
- Existing registerCoachPin route and frontend API call are already in use.
- Existing coach_login and coach_registrations sheets follow current schema.
- Token validation and existing response envelope remain unchanged.

**Main Flow (registerCoachPin):**
1. Client sends route registerCoachPin with firstname, lastname, alias, pin.
2. Backend validates token and payload as today.
3. Backend checks whether a matching firstname + lastname row exists in coach_login.
4. If no matching name row exists, backend keeps current behavior (existing add-row path unchanged).
5. If matching name row exists, backend applies alias comparison.
6. If row alias and payload alias both have values and they differ, return error mismatching_aliases.
7. If row alias has value and payload alias is empty, return error mismatching_aliases.
8. If alias check passes, backend checks row pin.
9. If row pin has value and equals payload.pin, return error already_registered.
10. If row pin has value and does not equal payload.pin, return error pins_do_not_match.
11. If row pin is empty, backend updates row and sets value to last_activity (G-column), then returns success.

**Alternative Flows:**
1. PIN is reserved by existing rules (if currently implemented): return existing error pin_reserved.
2. Unauthorized or missing token: return Unauthorized.
3. Payload validation failure: return existing validation error behavior.

**Main Flow (registerCoachForSession):**
1. Client sends route registerCoachForSession.
2. Before append to coach_registrations, backend converts session_type to lowercase.
3. Row is appended with normalized lowercase session_type.

**User Feedback Messages:**
- mismatching_aliases: Coach with same name already registered but aliases differ.
- already_registered: You are already registered.
- pins_do_not_match: Coach with the same name already registered but pins unmatch.
- Existing messages for other errors remain unchanged.

**Test Cases:**
- Backend unit test: matching firstname+lastname, row alias populated, payload alias empty returns mismatching_aliases.
- Backend unit test: matching firstname+lastname, both aliases populated but different returns mismatching_aliases.
- Backend unit test: matching firstname+lastname, row pin populated and equal returns already_registered.
- Backend unit test: matching firstname+lastname, row pin populated and different returns pins_do_not_match.
- Backend unit test: matching firstname+lastname, row pin empty updates last_activity in G-column and returns success.
- Backend unit test: no matching name keeps existing add-row path behavior unchanged.
- Backend unit test: registerCoachForSession stores lowercase session_type in coach_registrations.
- Frontend test: registerCoachPin propagates mismatching_aliases to caller.
- Frontend test: registerCoachPin propagates already_registered to caller.
- Frontend test: registerCoachPin propagates pins_do_not_match to caller.
- Frontend UI test: each new error code renders the specified localized user message.

**Acceptance Criteria:**
- registerCoachPin returns mismatching_aliases exactly for alias mismatch conditions described in scope.
- registerCoachPin returns already_registered when same-name row has same pin.
- registerCoachPin returns pins_do_not_match when same-name row has different pin.
- registerCoachPin updates last_activity G-column when same-name row exists with empty pin.
- Existing add-row behavior for no matching firstname+lastname remains unchanged.
- Frontend caller receives and handles new error codes without swallowing or remapping them unexpectedly.
- UI shows exact specified messages for the three new error codes.
- registerCoachForSession persists session_type in lowercase in coach_registrations.
- Tests cover all listed scenarios and pass.

**Linked Files/Branches:**
- [gas/Code.gs](gas/Code.gs)
- [web/src/api.ts](web/src/api.ts)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- Suggested branch: feature/oqm-0025-coach-pin-conflict-and-session-type-normalization

**References:**
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
- [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
