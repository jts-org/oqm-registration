# Spinner During API operations
- create a feature branch for this oepration and name it 'OQM-0005-spinner-during-api-operations'
- During API operations dimmed overlay with a centered loader should be used in order to ensure that users are aware that an operation is in progress and prevent unintended actions while waiting for a response from API.
- Apply this method to following components:
    * Register Pin Dialog when register button is clicked
    * Coach Login Dialog when verify button is clicked

Acceptance Criteria:
- Dimmed overlay with spinner activates when API operation starts and user cannot interract with the UI during the API operation is ongoing
- When API operation is finished, the dimmed overlay is dismissed and user can interract with the UI again

References:
- See copilot-instructions.md and frontend.instructions.md