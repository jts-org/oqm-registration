**Title:**
OQM-0017 Register Trainee PIN Code - part 1

**Description:**  
Enable trainee pin code registration by implementing new API function in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts) for PIN registration.

**User Story:**  
As a trainee, I want to enable registration of personal PIN code so that I can in the future login and register for training sessions easier.

**New Trainee API Function**
- Implement API function for trainee PIN registration in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)
- Use `registerCoachPin(data: RegisterPinData)` located in [coach.api.ts](web/src/features/coach/api/coach.api.ts) for reference
- route: 'registerTraineePin'
- Payload content:
    - first_name: trainee's first name 
        - String value
        - Required
    - last_name: trainee's last name
        - String value
        - Required    
    - age: age of underage trainee
        - Integer value
        - Not required
    - pin: pin code to be registered for the trainee
        - Integer value
        - Required
- Returns row id as return value or throws error in case error occurred during post operation.
- Possible returned errors:
    - 'concurrent_request' in case of concurrent operation
    - 'name_already_exists' if trainee with same first and last name exists
    - 'pin_reserved' if the pin to be registered is already registered to another user

**Test Cases:**  
- Unit: throws error when `VITE_GAS_BASE_URL` is not configured.
- Unit: sends POST request with correct shape:
    - URL = `VITE_GAS_BASE_URL`
    - `method: 'POST'`
    - `redirect: 'follow'`
    - `headers: { 'Content-Type': 'text/plain;charset=utf-8' }`
    - body includes `{ route: 'registerTraineePin', payload, token }`
- Unit: successful response (`ok: true`) returns created row id.
- Unit: backend error `pin_reserved` is thrown as Error(`pin_reserved`).
- Unit: backend error `name_already_exists` is thrown as Error(`name_already_exists`).
- Unit: backend error `concurrent_request` is thrown as Error(`concurrent_request`).
- Unit: backend error `Unauthorized` is thrown as Error(`Unauthorized`).
- Unit: fallback error is thrown when backend returns `ok: false` without error string.
- Unit: request supports optional `age` in payload and sends it unchanged when provided.
- Unit: request works without `age` (age omitted for non-underage registration).
- Unit: network failure from fetch is propagated as rejection.

**Acceptance Criteria:**  
- New API function `registerTraineePin` is implemented in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts).
- Function uses GAS POST conventions:
    - `redirect: 'follow'`
    - `Content-Type: 'text/plain;charset=utf-8'`
    - body format `{ route, payload, token }`
- Function calls route `registerTraineePin`.
- Payload contract is respected:
    - `first_name` (required, string)
    - `last_name` (required, string)
    - `pin` (required, integer)
    - `age` (optional, integer)
- Function returns created row id on success.
- Function throws backend error code/message when response is `ok: false`.
- Function throws clear configuration error when `VITE_GAS_BASE_URL` is missing.
- Tests are added/updated in trainee API test suite and cover:
    - success path
    - request shape
    - optional/required payload field behavior
    - key backend error paths
- Contract alignment is verified against [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md).

**Linked Files/Branches:**  
- [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)
- [coach.api.ts](web/src/features/coach/api/coach.api.ts)
