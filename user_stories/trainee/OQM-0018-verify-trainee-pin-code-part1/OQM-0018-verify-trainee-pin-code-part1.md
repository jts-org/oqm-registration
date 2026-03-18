**Title:**
OQM-0018 Verify Trainee PIN Code - part 1

**Description:**  
Enable trainee pin code verification by implementing new API function in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts) for trainee PIN verification.

**User Story:**  
As a trainee, I want to enable verification of personal PIN code so that I can in the future login and register for training sessions easier.

**New Trainee API Function**
- Implement API function for trainee PIN verification in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)
- Use `verifyCoachPin(pin: string)` located in [coach.api.ts](web/src/features/coach/api/coach.api.ts) for reference
- route: 'verifyTraineePin'
- Payload content:
    - pin: trainee's pin code to be verified
        - String value (4-6 digits)
        - Required
- Success returns payload containing
    - id: row id
    - firstname: first name of the trainee
    - lastname: last name of the trainee
    - age: age of the underage trainee
    - pin: pin code
    - created_at: date when row was appended,
    - last_activity: date when trainee last logged in using pin code
- Failure throws error if backend operation failed
    - 'no_match_found' in case no matching pin was found

**Test Cases:**  
- Unit: throws error when `VITE_GAS_BASE_URL` is not configured.
- Unit: sends POST request with correct shape:
    - URL = `VITE_GAS_BASE_URL`
    - `method: 'POST'`
    - `redirect: 'follow'`
    - `headers: { 'Content-Type': 'text/plain;charset=utf-8' }`
    - body includes `{ route: 'verifyTraineePin', payload: { pin }, token }`
- Unit: successful response (`ok: true`) returns payload.
- Unit: backend error `no_match_found` is thrown as Error(`no_match_found`).
- Unit: backend error `Unauthorized` is thrown as Error(`Unauthorized`).
- Unit: fallback error is thrown when backend returns `ok: false` without error string.
- Unit: network failure from fetch is propagated as rejection.

**Acceptance Criteria:**  
- New API function `verifyTraineePin` is implemented in [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts).
- Function uses GAS POST conventions:
    - `redirect: 'follow'`
    - `Content-Type: 'text/plain;charset=utf-8'`
    - body format `{ route, payload, token }`
- Function calls route `verifyTraineePin`.
- Payload contract is respected:
    - `pin` (required, string)
- Function returns created payload on success.
- Function throws backend error code/message when response is `ok: false`.
- Function throws clear configuration error when `VITE_GAS_BASE_URL` is missing.
- Tests are added/updated in trainee API test suite and cover:
    - success path
    - request shape
    - key backend error paths
- Contract alignment is verified against [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md).

**Linked Files/Branches:**  
- [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)
- [coach.api.ts](web/src/features/coach/api/coach.api.ts)
