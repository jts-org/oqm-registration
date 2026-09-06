```markdown
---
name: frontend-architecture
description: Defines the folder structure, architectural rules, routing model, providers, and feature-based organization for the OQM React frontend. Copilot must use this skill whenever generating or modifying frontend structure, routing, providers, or feature modules.
license: MIT
---

# Frontend Architecture (web/)

Authoritative architecture for the OQM React frontend.  
Copilot must follow this structure for all frontend code, folders, routing, and providers.

---

# 1. Project Structure

```plaintext
web/
  src/
    app/
      providers/
      layout/
      routes/
      store/ (optional)
      App.tsx
    features/
    shared/
    pages/
    widgets/
    lib/
    assets/
```

Copilot must not generate alternative top-level structures.

---

# 2. App Shell (src/app/)

Required:
```plaintext
src/app/
  providers/
    router.tsx
    theme.tsx
    query-client.tsx
  layout/AppLayout.tsx
  routes/index.tsx
  store/ (optional)
  App.tsx
```

Rules:
- Providers wrap the entire app.  
- Routing defined only in `routes/index.tsx`.  
- `AppLayout` contains global layout only.  
- No business logic in `AppLayout` or `App.tsx`.

---

# 3. Features (src/features/)

Structure:
```plaintext
src/features/<feature>/
  components/
  hooks/
  api/
  types.ts
  index.ts
```

Rules:
- Business logic → `hooks/`.  
- UI → `components/`.  
- API calls → `api/`.  
- Types → `types.ts`.  
- `index.ts` exposes a controlled public API.

---

# 4. Shared (src/shared/)

Generic, non-domain-specific code:
```plaintext
src/shared/
  components/
  ui/
  utils/
  constants/
  types/
```

Rules:
- `shared/` must not import from `features/`.  
- Contains only generic reusable code.

---

# 5. Pages (src/pages/)

Pages compose features; no business logic.

Rules:
- Pages import feature components.  
- Pages must not contain API calls or state/business logic.  
- All router views and page components belong under `src/pages/` (e.g. `src/pages/Register/RegisterCustomerEventPage.tsx`). Never place page/route components inside `src/features/<feature>/pages/`.

---

# 6. Widgets (src/widgets/)

Reusable compositions combining multiple features.

Examples:
```plaintext
src/widgets/
  UserMenu/
  NotificationsPanel/
  Sidebar/
```

Rules:
- Widgets can compose multiple features and shared components.  
- Widgets must not own domain-specific business rules.

---

# 7. Assets (src/assets/)

Static assets and global CSS.

Rules:
- Use MUI theme tokens for component styling.  
- Global CSS only for resets and typography.

---

# 8. Libraries (src/lib/)

Infrastructure-level code:
```plaintext
src/lib/
  api/
  http/
  validation/
  analytics/
```

Rules:
- `lib/` must not import from `features/`.  
- Used across the entire app (cross-cutting infrastructure).

---

# 9. Copilot Required Behavior

Copilot must:

- Generate code in the correct folder according to this architecture.  
- Avoid business logic in `pages/`.  
- Avoid UI logic in `hooks/`.  
- Not create new top-level folders.  
- Follow feature-based organization.  
- Use controlled exports via `index.ts` in features and shared modules.

---

# 10. Interaction With Other Skills

This architecture works together with:

- `frontend-api-client`  
- `frontend-ux-and-accessibility`  
- `frontend-responsive-design`  
- `frontend-i18n`  
- `frontend-performance`  
- `wire-react-to-gas`

---

# 11. Future Extensions

Folder structure must remain stable.  
Any future extensions must preserve this top-level architecture.
```
