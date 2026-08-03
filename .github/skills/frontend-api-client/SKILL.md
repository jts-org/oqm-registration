```markdown
---
name: frontend-api-client
description: Defines API client rules, fetch wrapper behavior, sessionToken handling, error parsing, and integration with the GAS backend. Copilot must use this skill whenever generating or modifying API calls.
license: MIT
---

# Frontend API Client

Authoritative API client model for the OQM React frontend.  
Copilot must follow this contract for all API calls.

---

# 1. API URL

Copilot must:

- read base URL from `VITE_GAS_BASE_URL`  
- never hardcode URLs  
- never assume URL structure  

---

# 2. Request Shape

All requests must follow:

```json
{
  "route": "<routeName>",
  "payload": { ... },
  "sessionToken": "..."
}
```

Rules:

- `sessionToken` required for protected routes  
- `payload` required for POST  
- GET uses query params  

---

# 3. Fetch Wrapper Rules

Copilot must:

- use `redirect: "follow"`  
- set `Content-Type: "text/plain;charset=utf-8"`  
- manually stringify body  
- parse JSON responses  
- handle strict `{ ok, data, error }` format  

---

# 4. Error Handling

Copilot must:

- show inline errors for validation failures  
- show toast for network errors  
- never crash the app  

---

# 5. Session Token Rules

Copilot must:

- read tokens from `sessionStorage`  
- never store tokens permanently  
- clear tokens on unauthorized  
- redirect to login  

---

# 6. Required Behavior for Copilot

Copilot must:

- use correct request shape  
- include `sessionToken` when required  
- parse strict response format  
- never invent fields  
- never bypass API contract  

---

# 7. Interaction With Other Skills

- **wire-react-to-gas** — authoritative API contract  
- **frontend-architecture** — correct folder placement  
- **frontend-performance** — efficient usage  
- **security-secrets** — token handling rules  

---

# 8. Future Extensions

API rules may expand; structure must remain stable.
```
