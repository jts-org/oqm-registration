**Title:**
New Sheet Schema And GAS Functionality For Trainee Registrations

**Description:**  
In order to keep record of trainees registrations to training sessions a new sheet schema is required. Also create GAS API and GAS function to append data into the new sheet is required.

**User Story:**  
As an application, I want to store trainee session registrations into a new sheet in order to keep record of trainees' session registrations.

**Preconditions:**  
- No preconditions

**New Sheet Schema**
- Add new sheet schema for `trainee_registrations` sheet

| Column | Name       | Type     |
|---|-----------------|----------|
| A | id              | string   |
| B | first_name       | string   |
| C | last_name        | string   |
| D | age_group        | string   |
| E | underage_age    | number   |
| F | session_type    | string   |
| G | camp_session_id | string   |
| H | date            | ISO-8601 |
| I | start_time      | time     |
| J | end_time        | time     |
| K | realized        | boolean  |
| L | created_at      | ISO-8601 |
| M | updated_at      | ISO-8601 |

- G: refers to `camp_shedules` sheet's id column (A) value, may be empty value
- H: in format 'YYYY-MM-DD'
- L/M: in format 'HH:MM'

**New Trainee API File**
- Create API file (`trainee.api.ts`) for trainee GAS API functions

**Operation Flow:**  
1. Frontend calls GAS API function to send trainee registration data (for example: `registerTraineeForSession(payload: RegisterTraineeForSessionPayload)`)
2. Backend receives the request and calls GAS function to process payload data (for example: `registerTraineeForSession_(payload)`)
    - GAS function's operational flow
        1. Acquire script lock
            - return 'concurrent_request' if lock cannot be aquired

**Data Handling:**
1. Request payload content
    - first_name: trainee's first name 
        - required
    - last_name: trainee's last name
        - required    
    - age_group: 'adult' | 'underage'
        - required    
    - underage_age: Trainee's age if trainee is underage, otherwise empty value
        - required if age_group is 'underage'
    - session_type: session type of the session the trainee is registering to
        - required    
    - camp_session_id: id from `camp_shedules` or empty value if other than camp session
    - date: the date of the session the trainee is registering to
        - in format 'YYYY-MM-DD'
        - required        
    - start_time: start time of the training session the trainee is registering to
        - in format 'HH:MM'
        - required        
    - end_time: end time of the training session the trainee is registering to
        - in format 'HH:MM'
        - required        
2. GAS API function: `registerTraineeForSession(payload: RegisterTraineeForSessionPayload)`
    - route: 'registerTraineeForSession'
3. GAS function `registerTraineeForSession_(payload)` 
    1. Validate required payload fields
        - if `age_group` is 'underage' but `underage_age` value is missing, return 'validation_failed_age' error
        - if validation otherwise fails return 'validation_failed' error
    1. Acquire script lock
        - return 'concurrent_request' error if lock cannot be aquired
    2. Scan `trainee_registrations` sheet for existing registrations for the trainee
        - Include only rows with same date as payload's date value
        - compare request payload data against `trainee_registrations` sheet rows, exclude row ids from comparison
        - If match is found then 'already_registered' error is returned
    3. Append new row to `trainee_registrations` sheet
        - by default set `realized` column boolean value to true
        - set `created_at` and `updated_at` values to current date
    4. return new row's id
    5. Finally release script lock

**Backend Return Value Options**
- error: 'validation_failed_age'
- error: 'validation_failed'
- error: 'concurrent_request'
- error: 'already_registered'
- return value: row id of the appended row

**Test Cases:**  
1. **Successful Registration**
    - Given valid payload data for a new trainee registration,
    - When the frontend calls the GAS API,
    - Then a new row is appended to the `trainee_registrations` sheet with correct values, and the row id is returned.

2. **Duplicate Registration Prevention**
    - Given a trainee is already registered for a session on the same date with matching details,
    - When the frontend attempts to register the same trainee again,
    - Then the API returns an 'already_registered' error and does not append a new row.

3. **Concurrent Request Handling**
    - Given the GAS function lock cannot be acquired,
    - When a registration request is made,
    - Then the API returns a 'concurrent_request' error.

4. **Required Fields Validation**
    - Given missing required fields in the payload (e.g., first_name, last_name, age_group, session_type, date, start_time, end_time),
    - When the API is called,
    - Then the API returns 'validation_failed' error and does not append a new row.

5. **Underage Age Requirement**
    - Given age_group is 'underage' but underage_age is missing,
    - When the API is called,
    - Then the API returns 'validation_failed_age' error.

6. **Correct Data Formatting**
    - Given valid input,
    - When the row is appended,
    - Then the date, start_time, end_time, created_at, and updated_at fields are in the correct format.

7. **Default Realized Value**
    - Given a successful registration,
    - When the row is appended,
    - Then the realized column is set to true by default.

**Acceptance Criteria:**  
- A new `trainee_registrations` sheet exists with the specified schema and columns.
- GAS API function `registerTraineeForSession(payload)` is implemented and accessible.
- GAS backend function `registerTraineeForSession_(payload)`:
    - Acquires a script lock before processing.
    - Returns 'concurrent_request' if lock cannot be acquired.
    - Checks for existing registration for the same trainee and date; returns 'already_registered' if found.
    - Appends a new row with correct data and formats if not already registered.
    - Sets `realized` to true, and `created_at`/`updated_at` to the current date/time.
    - Returns the new row's id on success.
    - Releases the script lock after processing.
- All required fields are validated, and errors are returned for missing/invalid data.
- Linked documentation and schema files are updated as needed.

**Linked Files/Branches:**  
- [SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- GAS API implementation [Code.gs](gas/Code.gs)
