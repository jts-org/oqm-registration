Implement the feature described in GitHub issue #48 (OQM-0025: Coach PIN registration conflict handling and lowercase session_type persistence).

Requirements:
- Follow API and payload/response conventions from [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md).
- Follow sheet behavior expectations from [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md).
- Follow repository instructions from:
	- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
	- [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
	- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- Use TDD: write failing tests first, implement, then make tests pass.

Backend tasks:
1. Update registerCoachPin_(payload) in [gas/Code.gs](gas/Code.gs).
2. If matching firstname+lastname exists:
	 - Alias checks:
		 - If row alias and payload alias both exist and differ, return mismatching_aliases.
		 - If row alias exists and payload alias is empty, return mismatching_aliases.
	 - Pin checks:
		 - If row pin exists and equals payload.pin, return already_registered.
		 - If row pin exists and differs from payload.pin, return pins_do_not_match.
		 - If row pin is empty, update row and set last_activity (G-column), then return success.
3. If no matching firstname+lastname exists, keep current add-row behavior unchanged.
4. Preserve existing response envelope and non-related errors.
5. Update registerCoachForSession_(payload) so session_type is lowercased before appending to coach_registrations.

Frontend tasks:
1. Update registerCoachPin(data: RegisterPinData) in [web/src/api.ts](web/src/api.ts) to return/propagate new error codes to caller modules.
2. Update UI error handling to show:
	 - mismatching_aliases: Coach with same name already registered but aliases differ.
	 - already_registered: You are already registered.
	 - pins_do_not_match: Coach with the same name already registered but pins unmatch.
3. Keep localization approach consistent with project i18n rules.

Documentation tasks:
1. Update [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md) with new registerCoachPin error cases.
2. If user-visible behavior changes in manuals, update:
	 - [user_manuals/coach-manual.en.md](user_manuals/coach-manual.en.md)
	 - [user_manuals/coach-manual.fi.md](user_manuals/coach-manual.fi.md)

Validation checklist:
1. Backend tests cover all new branches and regressions.
2. Frontend tests confirm new error-code propagation and user messages.
3. Existing flows remain intact when no name match is found.
4. registerCoachForSession stores lowercase session_type consistently.
5. No schema changes introduced.
