# Frontend Instructions (web/)
- Use Vite scripts (`dev`, `build`, `preview`).
- `vite.config.ts` reads `VITE_BASE` from env to configure the correct base for GitHub Pages.
- For Apps Script POST requests, set `redirect: 'follow'` and `Content-Type: 'text/plain;charset=utf-8'`.
- Keep API URL in `VITE_GAS_BASE_URL` and token in `VITE_API_TOKEN`.
- All interactive elements should be accessible via keyboard and screen reader.
- Error notification: Network or unexpected errors should be shown as toast notifications.
- All user-facing text should support localization (English/Finnish) using translation keys.
- When presenting buttons, labels or links in issue descriptions, uses the following format: `Button label: 'Label text' (use translation key)`. This indicates that the text should be stored as a translation key for localization purposes.
- The order of UX elements are presented in the same order in issue as they should be implemented in the UI unless specified differently in issue description. For example, if a 'Verify' button is mentioned after a 'Register new PIN code' link, then the 'Verify' button should be implemented and placed in the UI after the 'Register new PIN code' link. This helps maintain a clear and consistent user interface flow.

## Frontend top-level layout
- structure:
    * web/
      * index.html
      * vite.config.ts
      * src/
        * app/
        * features/
        * shared/
        * pages/
        * widgets/
        * assets/
        * lib/
        * hooks/
        * styles/
      * .env.local

### Feature-based folders
- `web/src/features/` contains domain-specific features organized by functionality.
- structure:
    * web/src/features/
      * auth/
        * components/ - UI pieces specific to the feature
        * hooks/ - feature-specific logic
        * api/ - fetchers, services, React Query endpoints
        * types.ts - TypeScript interfaces
        * index.ts - controlled exports
      * todos/
        * components/
        * hooks/
        * api/
        * types.ts
        * index.ts

### Application shell
- `web/src/app/` contains global providers, layout, and routing.
- structure:
    * web/src/app/
      * providers/ — global contexts (router, theme, query client)
        * router.tsx
        * query-client.tsx
        * theme.tsx
      * layout/ — top‑level layout components
        * AppLayout.tsx
      * routes/ — route definitions
        * index.tsx
      * store/ (optional) — global state if needed (Zustand, Redux, Jotai)
      * App.tsx

### Shared building blocks
- `web/src/shared/` contains reusable code across features but not tied to any specific domain.
- structure:
    * web/src/shared/
      * components/ — reusable UI elements
        * Button/
        * Modal/
        * Input/      
      * ui/ — design‑system‑level primitives
      * utils/ — pure helper functions
      * constants/ — app‑wide constants
      * types/ — global TypeScript types

### Pages and route‑level components
- `web/src/pages/` contains screens in the app and often compose multiple features.
- Each page imports feature components rather than containing business logic itself.
- structure:
    * web/src/pages/
      * Home/
        * HomePage.tsx
      * Dashboard/
        * DashboardPage.tsx
      * Settings/
        * SettingsPage.tsx

### Widgets (optional but powerful)
- `web/src/widgets/` contains UI compositions that combine multiple features.
- They can be used within pages or other widgets to build complex interfaces while keeping pages clean.
- structure:
    * web/src/widgets/
      * UserMenu/
      * NotificationsPanel/
      * Sidebar/

### Styles and assets
- `web/src/assets/` contains static assets like images, icons, and fonts.
- Vite handles assets efficiently, so keeping them organized helps maintain clarity.
- `web/src/styles/` contains global styles. If using Tailwind, the styles/ folder becomes minimal.
- structure:
    * web/src/assets/
      * images/
      * icons/
      * fonts/
    * web/src/styles/
      * globals.css
      * variables.css
      * mixins.css

### Library and utilities
- `web/src/lib/` contains infrastructure‑level code.
- These modules are used across features but are not UI‑related.
- structure:
    * web/src/lib/
      * api/
      * http/
      * validation/
      * analytics/

## Tests colocated with code
- Tests live next to the files they test.
- This keeps maintenance simple and avoids massive test folders.
    * Component.tsx
    * Component.test.tsx
    * Component.css