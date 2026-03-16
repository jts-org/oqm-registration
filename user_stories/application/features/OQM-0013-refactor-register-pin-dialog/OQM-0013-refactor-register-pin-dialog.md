**Title:**
Refactor Register PIN Dialog for Trainee PIN Registration

**Description:**  
Register PIN Dialog to support also trainee PIN registration. In order to do that the dialog should show different content when registering PIN for trainee than when registering PIN for coach.

**User Story:**  
As a trainee, I want to register personal PIN code so that I can register to training sessions more easily.

**Preconditions:**  
- User clicked "Register PIN" button on Trainee Page or "Register PIN code" link on Manual Trainee Registration Dialog
    - these dialogs do not exists at the moment but will be implemented later
- Register PIN Dialog is shown.

**Refactoring content**
- Register PIN Dialog
  - Dialog should support receiving following props in addition to those it currently does
      - initialIsUnderage
          - boolean value
          - by default value is false
      - initialAge
          - age of the underage trainee, integer value between 0-17
          - by default value is not set
  - When called from Trainee Page or Manual Trainee Registration Dialog
      - props values
        - showAlias=false
        - initialUnderAge may be set to true if user has checked the checkbox on Manual Trainee Registration Dialog before clicking the link
        - initialAge may be set to values between 0-17 if user has entered age value on Manual Trainee Registration Dialog before clicking the link
            - can only have value if initialUnderage prop value is true
  - When showAlias=false
      - Show FormControlLabel inside FormGroup containing only one CheckBox component below register-pin-lastname TextField component
          - all MUI components
          - FormControlLabel
              - label="I'm under 18 years old"
              - not required
          - if checkbox is checked show NumberSpinner on the left side of the checkbox
            - NumberSpinner MUI component
                - Label="Age:"
                - min={1}
                - max={17}
                - size="small"
                - defaultValue={15}
                - requied only if checkbox is checked
          - if checkbox is unchecked then hide the NumberSpinner and unset the age value
  - Enter new pin and Enter pin again input TextFields are arranged on the same row
      - Place both input TextFields inside Grid MUI component
          - Grid container spacing={2}
              - Grid size={{ xs: 12, sm: 6 }}
                  - Enter new pin code input TextField
                  - Enter pin again input TextField
  - TextField content validation rules should allow also point ('.') character in the first name.
  - Add Support to new Alerts
      - name_already_exists error
          - Text content: "Trainee with the same name already exists. Try adding your second first name initial into your first name, For example: 'John J.' and try again."
      - concurrent_request error
          - Text content: "Concurrent operation ongoing. Please try again."

**Operation Flow:**  
1. User fills the required fields
2. User clicks 
    1. "Register" button
        - Show toast message: "Registration ongoing. Please wait."
        - Trainee PIN registration data is sent to backend via GAS API using the `onRegister` prop function and the result is shown to the user
          - in case of error
              - pin_reserved error: "PIN code reserved. Choose different PIN code."
              - concurrent_request error: "Concurrent operation ongoing. Please try again."
              - name_already_exists error: "Trainee with the same name already exists. Try adding your second first name initial into your first name, For example: 'John J.' and try again."
              - fields are not emptied and user can try registering PIN code again
          - on success show toast message: "PIN code registered successfully"
    2. "Cancel" button
        - Show toast message "Registration cancelled"
        - As per 'onCancel' prop function

**Dialog/Page Content:**
- Title (unchanged)
- First name input TextField (unchanged)
- Last name input TextField (unchanged)
- If showAlias=true
    - Alias input TextField (unchanged)
- If showAlias=false
    - Show FormControlLabel inside FormGroup containing only one CheckBox component below register-pin-lastname TextField component
        - all MUI components
        - FormControlLabel
            - label="I'm under 18 years old"
            - not required
        - if checkbox is checked show NumberSpinner on the left side of the checkbox
          - NumberSpinner MUI component
              - Label="Age:"
              - min={1}
              - max={17}
              - size="small"
              - defaultValue={15}
              - requied only if checkbox is checked
        - if checkbox is unchecked then hide the NumberSpinner and unset the age value
  - Enter new pin code and Enter pin again input TextFields inside Grid MUI component
    - Grid container spacing={2}
        - Grid size={{ xs: 12, sm: 6 }}
            - Enter new pin code input TextField
            - Enter pin again input TextField
- "Cancel" and "Register" buttons

**Data Handling:**
- GAS functionality for registering trainee pin code be defined and implemented later
- GAS API function for registering trainee pin code mockup for testing purpose could be used as this point. Actual calling of backend will be implemented later.
- Registering coach PIN code unchanged for now

**User Feedback:**
- pin_reserved error: "PIN code reserved. Choose different PIN code."
- concurrent_request error: "Concurrent operation ongoing. Please try again."
- name_already_exists error: "Trainee with the same name already exists. Try adding your second first name initial into your first name, For example: 'John J.' and try again."
- Toast message: "Registration ongoing. Please wait."
- Toast message: "Registration cancelled"
- Toast message: "PIN code registered successfully"

**Test Cases:**  
- Rendering and layout
    - Verify Alias input is shown when showAlias=true and hidden when showAlias=false.
    - Verify Enter new PIN code and Enter PIN again are rendered inside one MUI Grid container on the same row for sm and larger viewports.
    - Verify the two PIN fields stack vertically on xs viewport when Grid size is xs=12.
    - Verify trainee-specific underage controls are shown only when showAlias=false.
- Trainee underage controls
    - Verify the checkbox "I'm under 18 years old" is unchecked by default when initialIsUnderage is not provided.
    - Verify the checkbox is preselected when initialIsUnderage=true.
    - Verify NumberSpinner is hidden when the checkbox is unchecked.
    - Verify NumberSpinner is shown to the left of the checkbox when the checkbox is checked.
    - Verify NumberSpinner defaults to age 15 when checkbox is checked and no initialAge is provided.
    - Verify NumberSpinner is prefilled with initialAge when initialIsUnderage=true and initialAge is between 1 and 17.
    - Verify unchecking the checkbox hides NumberSpinner and clears the age value from submitted payload.
    - Verify age cannot be submitted outside range 1-17.
- Validation
    - Verify first name accepts alphabetic characters, spaces, hyphens, Nordic characters, and dot character in values such as John J.
    - Verify last name validation remains unchanged unless explicitly expanded in implementation.
    - Verify first name still rejects digits and invalid punctuation.
    - Verify Register remains disabled when required fields are empty.
    - Verify Register remains disabled when PIN is shorter than 4 digits, longer than 6 digits, contains non-numeric characters, or PIN fields do not match.
    - Verify age becomes required only when the underage checkbox is selected.
- Submission behavior
    - Verify clicking Register shows toast message "Registration ongoing. Please wait." before awaiting onRegister.
    - Verify trainee registration submits firstname, lastname, pin, and when applicable isUnderage and age.
    - Verify coach registration payload remains unchanged when showAlias=true.
    - Verify successful registration shows toast message "PIN code registered successfully" and calls onSuccess with the registered PIN.
    - Verify clicking Cancel shows toast message "Registration cancelled" and calls onCancel.
- Error handling
    - Verify pin_reserved shows the existing modal error and keeps name fields intact while clearing PIN fields after dismiss.
    - Verify concurrent_request shows the specified error message and preserves entered form values.
    - Verify name_already_exists shows the specified error message and preserves entered form values.
    - Verify unexpected/network errors continue to use generic error toast behavior unless explicitly changed by implementation.
- State reset and initialization
    - Verify reopening the dialog resets transient validation state and PIN fields.
    - Verify initialFirstname, initialLastname, initialIsUnderage, and initialAge are reapplied each time the dialog is opened.

**Acceptance Criteria:**  
- RegisterPinDialog supports trainee PIN registration without breaking the existing coach PIN registration flow.
- The component accepts new props initialIsUnderage and initialAge, where initialIsUnderage defaults to false and initialAge is optional.
- When showAlias=true, the dialog behavior and fields remain backward compatible with the current coach registration use case.
- When showAlias=false, the Alias field is hidden and trainee-specific underage controls are shown below the lastname field.
- The trainee-specific underage controls use MUI FormGroup, FormControlLabel, and Checkbox components.
- The underage checkbox label is "I'm under 18 years old".
- When the underage checkbox is unchecked, the age spinner is hidden and no age value is submitted.
- When the underage checkbox is checked, a NumberSpinner labeled "Age:" is shown on the left side of the checkbox.
- The age spinner uses min=1, max=17, size="small", and defaultValue=15 unless initialAge is provided.
- The age spinner value is required only when the underage checkbox is checked.
- The Enter new PIN code and Enter PIN again fields are placed in a single MUI Grid container with spacing=2 and Grid size xs=12, sm=6 so they appear on one row on small-and-up screens.
- First name validation allows a dot character in addition to the currently supported valid name characters.
- Submitting the form shows toast message "Registration ongoing. Please wait." while the register operation is in progress.
- Clicking Cancel shows toast message "Registration cancelled" and invokes onCancel.
- A successful registration shows toast message "PIN code registered successfully" and invokes onSuccess.
- If registration fails with pin_reserved, the user sees "PIN code reserved. Choose different PIN code.".
- If registration fails with concurrent_request, the user sees "Concurrent operation ongoing. Please try again.".
- If registration fails with name_already_exists, the user sees "Trainee with the same name already exists. Try adding your second first name initial into your first name, For example: 'John J.' and try again.".
- On pin_reserved, concurrent_request, and name_already_exists errors, the form does not discard already entered non-PIN values and the user can retry registration.
- The dialog remains keyboard accessible and screen-reader accessible after the refactor.
- Automated tests are added or updated to cover coach mode, trainee mode, underage state, PIN field layout behavior, new validation rules, success flow, cancel flow, and the three named error cases.

**Linked Files/Branches:**  
- [RegisterPinDialog.tsx](web/src/shared/components/RegisterPinDialog/RegisterPinDialog.tsx)
- [OQM-0003-register-coach-pin-code branch](https://github.com/jts-org/oqm-registration/tree/OQM-0003-register-coach-pin-code)
- [coach.api.ts](web/src/features/coach/api/coach.api.ts)
- GAS API implementation ([Code.gs](gas/Code.gs))
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
