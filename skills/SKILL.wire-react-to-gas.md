# SKILL: Wire React to GAS API

## Contract
- GET  `?route=listItems&token=...` → list rows
- POST `{ route: "createItem", payload, token }` → append row
- Response JSON shape: `{ ok: true, data } | { ok: false, error }`

## Frontend fetch patterns
```ts
const base = import.meta.env.VITE_GAS_BASE_URL;
const token = import.meta.env.VITE_API_TOKEN;

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
