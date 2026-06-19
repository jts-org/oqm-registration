---
name: frontend-api-client
description: >
  Defines the API client rules, fetch wrapper behavior, sessionToken handling,
  error parsing, and integration with the GAS backend. Copilot must use this
  skill whenever generating or modifying API calls.
license: MIT
---

# Frontend API Client

This skill defines the **only valid** API client model for the OQM frontend.

---

# 1. API URL

Copilot must:

- read API URL from `VITE_GAS_BASE_URL`  
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

- sessionToken required for protected routes  
- payload required for POST  
- GET uses query params  

---

# 3. Fetch Wrapper Rules

Copilot must:

- use `redirect: 'follow'`  
- use `Content-Type: 'text/plain;charset=utf-8'`  
- stringify body manually  
- parse JSON responses  
- handle `{ ok, data, error }`  

---

# 4. Error Handling

Copilot must:

- show inline errors for validation  
- show toast for network errors  
- never crash the app  

---

# 5. Session Token Rules

Copilot must:

- read tokens from sessionStorage  
- never store tokens permanently  
- clear tokens on unauthorized  
- redirect to login  

---

# 6. Required Behavior for Copilot

Copilot must:

- always use correct request shape  
- always include sessionToken when required  
- always parse strict response format  
- never invent new fields  
- never bypass API contract  

---

# 7. Interaction With Other Skills

- **wire-react-to-gas** — API contract  
- **frontend-architecture** — API folder structure  
- **frontend-performance** — efficient API usage  
- **security-secrets** — token handling rules  

---

# 8. Future Extensions

API rules may expand.
