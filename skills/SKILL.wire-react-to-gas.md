# SKILL: Wire React to GAS API

## Contract
- GET  `?route=listItems&token=...` → list rows from `Data` sheet
- GET  `?route=getSettings&token=...` → list rows from `settings` sheet (QCM-0001)
- POST `{ route: "createItem", payload, token }` → append row
- Response JSON shape: `{ ok: true, data } | { ok: false, error }`

## Frontend fetch patterns
```ts
const base = import.meta.env.VITE_GAS_BASE_URL;
const token = import.meta.env.VITE_API_TOKEN;

/** Fetch all settings rows (QCM-0001 — fetched on application startup). */
export async function getSettings(): Promise<Setting[]> {
  if (!base) throw new Error('VITE_GAS_BASE_URL is not configured');
  const url = `${base}?route=getSettings&token=${encodeURIComponent(token || '')}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.data;
}

export async function createItem(payload: {name: string; email: string}) {
  const res = await fetch(base!, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ route: "createItem", payload, token })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Unknown error");
  return data.data;
}
```

**Why `redirect: "follow"` and `text/plain`?** Apps Script web apps may `302` and stricter JSON preflights can fail; this pattern avoids common CORS issues.

## Contract-First Development
Always declare backend routes, payloads, and expected responses in this file before implementation. Update this file whenever contracts change.

## Documentation Updates
Whenever you change backend routes, payloads, or sheet schemas, update the relevant skills/ documentation and instructions. Reference the SKILL doc in code comments and PRs.

## Review Checklist
Before merging, use the review-checklist.instructions.md to ensure all requirements are met, including documentation updates, test coverage, and contract compliance.

## Error Handling Examples
- Example error response: `{ ok: false, error: "Invalid token" }`
- Always document possible error cases for each route.

## API Versioning
- When making breaking changes, increment the API version and document changes here.
- Use a `version` field in requests/responses if needed.

## Integration Testing
- Document integration test patterns for frontend-backend communication.
- Example: Use mock fetch in frontend tests to simulate GAS responses.

## Localization
API must accept a language parameter and return localized responses where applicable. Document how error messages and data should be localized for English and Finnish.
