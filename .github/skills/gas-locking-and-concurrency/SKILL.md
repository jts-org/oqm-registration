---
name: gas-locking-and-concurrency
description: >
  Concurrency, locking, and race-condition prevention rules for the Google Apps
  Script backend used by the OQM Registration system. Copilot must use this
  skill whenever generating or modifying backend logic that writes to Sheets or
  performs multi-step operations.
license: MIT
---

# GAS Locking & Concurrency Model

Google Apps Script is single-threaded per execution, but multiple executions
may run concurrently. This skill defines how Copilot must handle concurrency,
locking, and race conditions when generating backend logic.

The OQM backend uses **LockService** and **atomic write patterns** to ensure
data integrity across coach, trainee, and admin operations.

---

## 1. When to Use Locks

Copilot must use `LockService.getScriptLock()` when generating logic that:

- writes to Sheets  
- modifies rows that must remain consistent  
- performs multi-step operations that must be atomic  
- checks for uniqueness (PINs, names, session registrations)  
- prevents duplicate registrations  
- prevents overlapping session writes  
- prevents concurrent modifications to the same sheet  

### Examples from the OQM backend

- `registerTraineePin_`  
- `registerCoachForSession_`  
- `registerTraineeBatchForSessions_`  
- `registerCustomerEventWithSchedule_`  

These functions already use locks and Copilot must follow the same pattern.

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

### Required behaviors:

- Use `tryLock(5000)` — **never** `lock.waitLock()`
- Always return a structured error (`concurrentRequest`) on failure
- Always release the lock in a `finally` block
- Never swallow lock failures silently
- Never nest locks
- Never wrap entire route handlers in locks
- Never lock read-only operations
- Never lock login/sessionToken validation

---

## 3. What Must Be Inside the Lock

Copilot must place the following inside the critical section:

- reading sheet rows that must remain consistent  
- checking uniqueness (PIN, name, session)  
- validating overlapping sessions  
- writing new rows  
- updating existing rows  
- generating IDs for new rows  
- writing timestamps  
- any read → validate → write sequence that must be atomic  

### What must NOT be inside the lock:

- logging  
- slow operations  
- external API calls  
- JSON serialization  
- large loops not related to the critical write  
- sessionToken validation  
- permission checks  
- expensive filtering or mapping  

---

## 4. Concurrency Error Codes

Copilot must use the backend’s established error codes:

- `concurrent_request` — trainee/coach registration conflicts and batch operations
- `concurrent_operation` — coach removal conflicts

Copilot must not invent new concurrency error codes.

---

## 5. Sheet-Level Concurrency Rules

Copilot must assume:

- **coach_login** and **trainee_login** require uniqueness checks  
- **coach_registrations** requires atomic writes  
- **trainee_registrations** requires atomic writes  
- **batch operations** must be fully atomic  

-### Required behaviors:
- Use `tryLock(5000)` — **never** `lock.waitLock()`
- Always return a structured error (`concurrent_request`) on failure
- Always release the lock in a `finally` block
- Never write without a lock  
- Never generate code that performs partial writes  

---

## 6. Additional Backend Concurrency Rules (Copilot-only)

These rules come from repository-wide instructions and must be enforced here:

### 6.1 No global mutable state
- No global arrays, objects, or counters  
- No caching outside CacheService  
- No global variables used for write coordination  

### 6.2 No alternative locking mechanisms
- No manual sleep loops  
- No retry loops  
- No custom lock implementations  

### 6.3 No optimistic concurrency
- All write operations must be pessimistic (lock first, then read/validate/write)

### 6.4 No multi-lock patterns
- Only one script-level lock may be used  
- Never lock multiple sheets separately  

---

## 7. Interaction With Other Skills

### **security-secrets**
- Ensures that locking does not expose secrets or tokens.
- Ensures that concurrency errors do not leak sensitive data.

### **auth-flow**
- Ensures that login flows do not require locks.
- Ensures that sessionToken validation happens outside locks.

### **sheet-schema**
- Ensures that locked operations use correct columns and sheet structures.

### **gas-sheet-operations**
- Ensures that read/validate/write sequences follow schema rules.

### **wire-react-to-gas**
- Ensures that concurrency errors are returned in the correct API format.

### **deploy-ci**
- Ensures that concurrency behavior is preserved across deployments.

---

## 8. Required Behavior for Copilot

When Copilot generates GAS backend code:

- Always use locks for multi-step write operations  
- Always use `tryLock(5000)` with a fallback error  
- Always release locks in `finally`  
- Never generate nested locks  
- Never generate long-running code inside locks  
- Never generate code that writes to Sheets without a lock  
- Never assume that Apps Script prevents concurrent execution automatically  
- Never generate code that reads outside the lock when the result affects a write  

---

## 9. Prohibited Behavior

Copilot must not:

- generate `waitLock()` (blocks indefinitely)  
- generate lockless write operations  
- generate locks around read-only operations  
- generate locks around login/sessionToken logic  
- generate locks around external API calls  
- generate locks that wrap the entire route handler  
- generate new concurrency error codes  
- generate optimistic concurrency patterns  
- generate global mutable state used for coordination  

---

## 10. Future Extensions

This skill describes the current concurrency model. Copilot must not assume that
locking strategies, sheet structures, or write patterns are fixed. New sheets,
new atomic operations, or new concurrency mechanisms may be added without
breaking this skill.

