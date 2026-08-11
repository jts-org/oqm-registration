```markdown
---
name: gas-route-registry
description: Canonical registry of GAS routes implemented in `gas/Code.gs`. Provides route names and high-level intent. Full payload/response contracts live in `wire-react-to-gas`.
license: MIT
---

# GAS Route Registry (Reference)

Authoritative index of backend routes implemented in `gas/Code.gs`.  
This file is intentionally lightweight — full API contract details (payloads, response shapes, error codes, session requirements) live in **wire-react-to-gas**.

Keep this list in sync with actual routes in `gas/Code.gs`.

---

## Authentication & Identity

- `coachLogin`  
- `adminLogin`  
- `verifyCoachPin`  
- `verifyTraineePin`  
- `registerCoachPin`  
- `registerTraineePin`
- `sendFeedback` (public; no `sessionToken` required)

---

## Sessions & Registration

- `getTraineeSessions`  
- `getCoachSessions`  
- `registerTraineeForSession`  
- `registerCoachForSession`  
- `registerTraineeBatchForSessions`  
- `registerCustomerEventWithSchedule`

---

## Session Schedule Management

- `listSessionsSchedule`  
- `addSessionSchedule`  
- `updateSessionSchedule`  
- `deleteSessionSchedule`

---

## Account Management

- `listCoachAccounts` (GET)  
- `listTraineeAccounts` (GET)  
- `createCoachAccount` (POST)  
- `createTraineeAccount` (POST)  
- `updateCoachAccount` (POST)  
- `updateTraineeAccount` (POST)  
- `deleteCoachAccount` (POST)  
- `deleteTraineeAccount` (POST)

---

## Notes

- This registry is an index only — **wire-react-to-gas** defines canonical request/response shapes, error codes, and sessionToken requirements.  
- Update this file whenever routes are added, removed, or renamed in `gas/Code.gs`.  
- Route classification (public, coach, admin) is defined in **auth-flow**.

```
