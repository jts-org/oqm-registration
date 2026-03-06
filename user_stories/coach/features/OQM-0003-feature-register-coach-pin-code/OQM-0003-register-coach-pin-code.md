# Feature: Register Coach PIN Code
When user clicks 'Register new PIN code' link in Coach Login dialog the Register PIN dialog is show to the user.
- Register PIN dialog requires refactoring.

## Unchanged features
- Modal dialog
- Title: 'Register new PIN code' (use translation key)
- Input field titles: 'Enter new PIN code', 'Enter PIN again' (use translation key)
- Button labels: 'Register', 'Cancel' (use translation key)
- when 'Cancel' button is clicked the user returns to Coach password/PIN enquiry dialog
- This dialog should be implemented as reusable as possible since it will be used for registering a new PIN code for trainee later

## Refactoring Register PIN Code dialog
These features are in addition to unchanges features
- Input fields for entering user firstname, lastname, alias are added
    * Input field titles: 'Firstname', 'Lastname', 'Alias' (use translation key)
    * maximum text length is 30 characters for each input field
    * no numbers or special characters allowed
        * exception: '-' is allowed between alphabets. For example: 'Ukko-Pekka' is valid
    * no content with all whitespace allowed
    * whitespace is allowed within the string. For example 'von Kuckelkören' is valid
    * inline notification for missing field content should be shown 
        * for fields: 'Firstname', 'Lastname', 'Enter new PIN code', 'Enter PIN again'
        * inline notification: 'Mandatory' (use translation key)
    * inline notifications for fields 'Firstname', 'Lastname' when data has been entered into the input field. If data is erased then inline notifications should be shown again for mandatory fields
- inline notification is shown when PINs in 'Enter new PIN code' and 'Enter PIN again' do not match
    * inline notification: 'PIN codes don't match' (use translation key)
- inline notification not shown when no PIN codes are entered in either 'Enter new PIN code' or 'Enter PIN again' input fields    
- Input fields' 'Enter new PIN code' and 'Enter PIN again' types should be 'password'


## Dialog structure
|   'Register new PIN code'    |
--------------------------------
|                              |
|      'Firstname'             |
|      'Lastname'              |
|      'Alias'                 |
|     'Enter new PIN code'     |
|      'Enter PIN again'       |
|                              |
|   'Register'  'Cancel'       |

## 'Register' Button
- a valid PIN code should be 4-6 characters long and can contain only numbers.
- 'Register' button should be active only when 
    * user has provided identical and valid PIN codes to both input fields
    * All other fields but 'Alias' have content. 'Alias' field can be left empty.
- When 'Register' button is clicked
    * Register data is sent to the backend via API (see Backend Functionality below)
    * if PIN is already registered to other user (see Backend functionality) then a modal notification is shown to the user
        * "PIN code reserved. Choose different PIN code." (use translation key)
    * if modal notification was shown and then closed by the user
        * Only 'Enter new PIN code' and 'Enter PIN again' input fields are cleared. 'Firstname', 'Lastname', 'Alias' input fields are not cleared from user data.
-  When registration data has been succesfully stored to backend 
    * a toast notification about succesfull registration operation is show to the user
    * the valid PIN code is transferred to Coach Login dialog's 'Enter PIN code' field and this dialog is closed

### Backend Functionality
- when doPost request to register coach PIN code have been received by the backend
    * check that the PIN code about to be registered is not found from either 'coach_login' or 'trainee_login' sheets
        * if PIN found return with error code 'pin_reserved' indicating the PIN is reserved and the user should choose different PIN code
    * store data into 'coach_login' sheet and return OK response
        * 'coach_login' column 'created_at' is set to current date

## Reusability Notes
This dialog will be used also to register trainee PIN code. This will be implemented later.
- When used for trainee PIN code registrations then clicking the 'Register' button should use different backend API to send registration data
- The Dialog will have an additional component for the user to provide age if the user is underage
- The 'Alias' input field will not be shown to the user

Acceptance Criteria:
- Dialogs should be modal and block interaction with the main view until closed.
- User can return to previous view or dialog by closing the component
- All user-facing text should support localization (English/Finnish).
- All interactive elements should be accessible via keyboard and screen reader
- Errors are handled gracefully and surfaced to the user
- Network or unexpected errors should be shown as toast notifications.
- Duplicate PIN codes cannot be registered into 'coach_login' and 'trainee_login' sheets
- Registration data is stored into 'coach_login' sheet succesfully

References:
- See copilot-instructions.md and frontend.instructions.md
- See SKILL.wire-react-to-gas.md for API contract
- See SKILL.sheet-schema.md for Shema contract
