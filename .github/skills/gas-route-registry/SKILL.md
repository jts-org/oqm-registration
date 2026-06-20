---
name: gas-route-registry
description: >
  Registry and mapping of GAS routes implemented in `gas/Code.gs`. This file is
  a lightweight reference for agents and maintainers to find canonical route
  names and expected payload/response shapes. For full API contract, see
  `wire-react-to-gas`.
license: MIT
---

# GAS Route Registry (Reference)

This file lists the canonical routes implemented in `gas/Code.gs`. It is
intended as a short index — authoritative request/response shapes live in
`wire-react-to-gas`.

Common routes (implemented in Code.gs):

- `coachLogin`
- `adminLogin`
- `verifyCoachPin`
- `verifyTraineePin`
- `registerCoachPin`
- `registerTraineePin`
- `getTraineeSessions`
- `getCoachSessions`
- `registerTraineeForSession`
- `registerCoachForSession`
- `registerTraineeBatchForSessions`
- `registerCustomerEventWithSchedule`

Notes:
- Keep this list in sync with `gas/Code.gs` when routes are added/removed.
- Use `wire-react-to-gas` for payload and response contract details.
