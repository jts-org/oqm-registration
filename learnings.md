# Copilot Continuous Learnings (React + Vite + Google Apps Script + Google Sheets)

## Frontend: React + Vite
### State Management & React Patterns
### Component Architecture & Reusability
### Async Data Fetching & API Integration
### Form Handling & Validation
### Performance Optimizations
### Error Boundaries & Resilience

## Backend: Google Apps Script (GAS)
### Sheet Read/Write Patterns
### Data Validation & Sanitization
### Preserve Numeric Zero When Mapping Sheet Cells
**Problem Pattern:**  
Sheet values that can legitimately be 0 were converted to empty strings during response mapping, causing downstream UI logic to treat valid data as missing.

**Context Pattern:**  
Minimal code snippet or structural pattern (indented code block).

	// Avoid this for numeric fields that may be 0
	const value = String(row[index] || '');

	// Use nullish fallback instead
	const value = String(row[index] ?? '');

**Solution Summary:**  
Use nullish coalescing instead of falsy fallback when mapping GAS sheet cells that may contain numeric zero.

**Reasoning:**  
The logical OR operator treats 0 as false and replaces it with the fallback, while nullish coalescing only falls back for null or undefined. This preserves valid zero values in API responses.

**Tags:**  
`gas`, `sheets`, `api`, `data-mapping`, `validation`

**Reusability Notes:**  
Apply this pattern to all GAS row-to-object mappers for columns that can contain 0, false, or other falsy-but-valid values.

### Performance & Quotas
### Error Handling & Retries
### Structuring GAS for Maintainability

### Public feedback routes with side effects
**Problem Pattern:**
A feedback route must both persist data and notify support without letting mail failures roll back the stored message.

**Context Pattern:**
A single handler should write to Sheets inside a lock and then attempt an email notification in a separate try/catch block so the write remains durable even if mail delivery fails.

**Solution Summary:**
Use a lock-protected atomic sheet append first, then send the support email in a guarded secondary step and log any email failure without changing the success response.

**Reasoning:**
The user-facing requirement is that sheet persistence is primary and must succeed before the notification side effect. Separating the write and email steps preserves this ordering while avoiding rollback behavior on mail errors.

**Tags:**
`gas`, `sheets`, `notifications`, `feedback`, `atomicity`

**Reusability Notes:**
Apply this pattern to other side-effectful routes that must preserve a primary write while treating email or external integrations as secondary.

## Data Layer: Google Sheets
### Schema Design & Sheet Organization
### Avoiding Race Conditions
### Batch Operations
### Caching & Memoization

## Cross‑Cutting Learnings
### API Contract Patterns
### Security & Permissions
### Deployment & Versioning
### Logging & Monitoring
