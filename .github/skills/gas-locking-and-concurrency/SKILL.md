```markdown
---
name: gas-locking-and-concurrency
description: Concurrency, locking, and race‑condition prevention rules for the OQM GAS backend. Copilot must apply this skill whenever generating or modifying backend logic that writes to Sheets or performs multi-step operations.
license: MIT
---

# GAS Locking & Concurrency Model

Google Apps Script allows concurrent executions.  
This skill defines the authoritative locking and concurrency rules for the OQM backend.  
All multi-step write operations must be **atomic**, **lock-protected**, and **race‑condition safe**.

---

## 1. When to Use Locks

Copilot must use `LockService.getScriptLock()` for any logic that:

- writes to Sheets  
- modifies rows requiring consistency  
- performs multi-step read → validate → write sequences  
- checks uniqueness (PINs, names, IDs, registrations)  
- prevents duplicate registrations  
- prevents overlapping session writes  
- prevents concurrent modifications to the same sheet  

Examples (existing OQM backend):
- `registerTraineePin_`  
- `registerCoachForSession_`  
- `registerTraineeBatchForSessions_`  
- `registerCustomerEventWithSchedule_`  

Copilot must follow these patterns exactly.

---

## 2. Required Lock Pattern (Strict)

Copilot must always generate locking code in this exact form:

```js
var lock = LockService.getScriptLock();
if (!lock.tryLock(5000)) {
  return { ok: false, error: "concurrent_request" };
}
try {
  // critical section
} finally {
  lock.releaseLock();
}
```

Rules:
- use `tryLock(5000)` — **never** `waitLock()`  
- return structured error on failure  
- release lock in `finally`  
- never swallow lock failures  
- never nest locks  
- never lock entire route handlers  
- never lock read-only operations  
- never lock login/sessionToken validation  

---

## 3. What Must Be Inside the Lock

Inside the critical section:
- reading rows that must remain consistent  
- uniqueness checks (PIN, name, ID)  
- overlap validation  
- writing new rows  
- updating existing rows  
- generating timestamp/incremental IDs  
- writing timestamps  
- any atomic read → validate → write sequence  

Outside the lock:
- logging  
- slow operations  
- external API calls  
- JSON serialization  
- large unrelated loops  
- sessionToken validation  
- permission checks  

---

## 4. Concurrency Error Codes

Copilot must use only:

- `concurrent_request` — registration conflicts, batch operations  
- `concurrent_operation` — coach removal conflicts  

No new concurrency error codes may be invented.

---

## 5. Sheet-Level Concurrency Rules

Copilot must assume:

- `coach_login` and `trainee_login` require uniqueness checks  
- `coach_registrations` requires atomic writes  
- `trainee_registrations` requires atomic writes  
- batch operations must be fully atomic  

Rules:
- always use `tryLock(5000)`  
- always return structured error on lock failure  
- never write without a lock  
- never perform partial writes  

---

## 6. Additional Backend Concurrency Rules (Copilot-only)

### 6.1 No global mutable state
- no global arrays, objects, counters  
- no caching outside CacheService  
- no global coordination variables  

### 6.2 No alternative locking mechanisms
- no manual sleep loops  
- no retry loops  
- no custom lock implementations  

### 6.3 No optimistic concurrency
- all write operations must be pessimistic  
- lock first → then read/validate/write  

### 6.4 No multi-lock patterns
- only one script-level lock allowed  
- never lock multiple sheets separately  

---

## 7. Interaction With Other Skills

### security-secrets
Ensures concurrency errors never leak sensitive data.

### auth-flow
SessionToken validation must occur outside locks.

### sheet-schema
Ensures locked operations use correct columns and structures.

### gas-sheet-operations
Ensures atomic read → validate → write sequences.

### wire-react-to-gas
Ensures concurrency errors follow strict API format.

### deploy-ci
Ensures concurrency behavior remains stable across deployments.

---

## 8. Required Behavior for Copilot

Copilot must:
- use locks for all multi-step write operations  
- use `tryLock(5000)` with fallback error  
- release locks in `finally`  
- never generate nested locks  
- never place long-running code inside locks  
- never write to Sheets without a lock  
- never assume Apps Script prevents concurrency automatically  
- never read outside the lock when the result affects a write  

---

## 9. Prohibited Behavior

Copilot must not:
- generate `waitLock()`  
- generate lockless write operations  
- lock read-only operations  
- lock login/sessionToken logic  
- lock external API calls  
- lock entire route handlers  
- invent new concurrency error codes  
- use optimistic concurrency  
- use global mutable state for coordination  

---

## 10. Future Extensions

Concurrency rules may expand.  
Copilot must not assume fixed locking strategies or sheet structures.  
New atomic operations or concurrency mechanisms may be added without breaking this skill.
```
