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
