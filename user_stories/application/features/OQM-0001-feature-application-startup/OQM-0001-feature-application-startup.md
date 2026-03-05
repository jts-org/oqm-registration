# Feature: Application Startup

When the application starts, it should:
- Fetch settings from the 'settings' sheet via the backend API
- Store the settings data for the duration of the session (in context or sessionStorage)

Acceptance Criteria:
- Settings are available to all components during the session
- Errors are handled gracefully and surfaced to the user

References:
- See SKILL.wire-react-to-gas.md for API contract