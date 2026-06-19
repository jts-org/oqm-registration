---
name: frontend-architecture
description: >
  Defines the folder structure, architectural rules, routing model, providers,
  and feature-based organization for the OQM React frontend. Copilot must use
  this skill whenever generating or modifying frontend structure, routing,
  providers, or feature modules.
license: MIT
---

# Frontend Architecture (web/)

This skill defines the **only valid** architecture for the OQM React frontend.
Copilot must follow this structure whenever generating or modifying frontend
code, folders, routing, or providers.

---

# 1. Project Structure (Authoritative)

```
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

Copilot must never generate alternative top-level structures.

---

# 2. App Shell (src/app/)

Contains global providers, layout, and routing.

### Required structure:

```
src/app/
  providers/
    router.tsx
    theme.tsx
    query-client.tsx
  layout/
    AppLayout.tsx
  routes/
    index.tsx
  store/ (optional)
  App.tsx
```

Rules:

- Providers must wrap the entire app.  
- Routing must be defined in `src/app/routes/index.tsx`.  
- AppLayout must contain global layout elements only.  
- No business logic in AppLayout or App.tsx.  

---

# 3. Feature-Based Folders (src/features/)

Each feature must follow:

```
src/features/<feature>/
  components/
  hooks/
  api/
  types.ts
  index.ts
```

Rules:

- Business logic lives in hooks.  
- UI pieces live in components.  
- API calls live in api/.  
- Types live in types.ts.  
- index.ts exports controlled public API.  

---

# 4. Shared Building Blocks (src/shared/)

Reusable, non-domain-specific components:

```
src/shared/
  components/
  ui/
  utils/
  constants/
  types/
```

Rules:

- shared/ must never import from features/.  
- shared/ must contain only generic, reusable code.  

---

# 5. Pages (src/pages/)

Pages compose features; they must not contain business logic.

```
src/pages/
  Home/
  Dashboard/
  Settings/
```

Rules:

- Pages import feature components.  
- Pages must not contain API calls or state logic.  

---

# 6. Widgets (src/widgets/)

Widgets combine multiple features into reusable compositions.

```
src/widgets/
  UserMenu/
  NotificationsPanel/
  Sidebar/
```

---

# 7. Assets (src/assets/)

Static assets and global CSS.

```
src/assets/
  images/
  icons/
  fonts/
  styles/
```

Rules:

- Use MUI theme tokens for component styling.  
- Use global CSS only for resets and typography.  

---

# 8. Libraries (src/lib/)

Infrastructure-level code:

```
src/lib/
  api/
  http/
  validation/
  analytics/
```

Rules:

- lib/ must not import from features/.  
- lib/ is used across the entire app.  

---

# 9. Required Behavior for Copilot

Copilot must:

- always generate code inside the correct folder  
- never place business logic in pages  
- never place UI logic in hooks  
- never create new top-level folders  
- always follow feature-based architecture  
- always use controlled exports via index.ts  

---

# 10. Interaction With Other Skills

- **frontend-api-client** — API layer rules  
- **frontend-ux-and-accessibility** — UI rules  
- **frontend-responsive-design** — layout rules  
- **frontend-i18n** — localization rules  
- **frontend-performance** — optimization rules  
- **wire-react-to-gas** — API contract rules  

---

# 11. Future Extensions

New features may be added, but folder structure must remain stable.
