# Frontend Instructions (web/)
- Use Vite scripts (`dev`, `build`, `preview`).
- `vite.config.ts` reads `VITE_BASE` from env to configure the correct base for GitHub Pages.
- For Apps Script POST requests, set `redirect: 'follow'` and `Content-Type: 'text/plain;charset=utf-8'`.
- Keep API URL in `VITE_GAS_BASE_URL`.

---

## UX and Accessibility
- Use **Material UI** for consistent design, accessibility, and responsive behavior.
- All UI components must be **responsive**, **keyboard-accessible**, and **screen-reader friendly**.
- Follow **ARIA guidelines** for modals, forms, and interactive elements.
- Prefer **MUI’s styling system (`sx`, styled components, theme tokens)** over CSS modules unless a feature explicitly requires module-scoped styles.
- Localize all user-facing text using `web/src/lib/i18n.ts` and `web/src/locales/`.  
  Default language follows browser locale: Finnish when `navigator.language` starts with `fi`, otherwise English.
- Place the UI language switch on **HomePage only**, unless an issue explicitly expands the scope.
- When adding new locale strings, write Finnish characters using JSON unicode escapes (`ä` → `\u00e4`, `ö` → `\u00f6`).
- When describing UI labels in issues, use the format:  
  `Button label: 'Label text' (use translation key)`  
  meaning the text must be stored as a translation key.
- During API operations, block user interactions using a **dimmed overlay with a centered loader**.

---

## Mobile‑First & Responsive Design Requirements
All new features must be implemented **mobile-first**, then enhanced for larger screens.

### Layout & Breakpoints
- Design for **320px width** as the minimum supported viewport.
- Use **flexible layouts** (`flex`, `grid`, `%`, `maxWidth`, `minWidth`) instead of fixed pixel widths.
- Use MUI responsive props:  
  `sx={{ display: { xs: 'none', md: 'block' } }}`
- Avoid horizontal scrolling; content must wrap gracefully.

### Touch Interaction
- Minimum touch target size: **48×48 px**.
- Ensure adequate spacing between interactive elements.
- Avoid hover-only interactions; always provide a tap alternative.
- Use proper interactive components (`Button`, `IconButton`, `ListItemButton`) instead of clickable `<div>` elements.

### Typography & Readability
- Use MUI’s responsive typography variants.
- Avoid fixed pixel font sizes.
- Ensure readable line lengths on small screens.

### Navigation
- On mobile, prefer:
  - **Hamburger menu** or **temporary drawer**
  - **Bottom navigation** when appropriate
- Avoid wide horizontal menus.
- Use scrollable tabs when using MUI `Tabs`.

### Forms & Inputs
- Use MUI `TextField` with proper spacing.
- Ensure the virtual keyboard does not obscure inputs.
- Use mobile-appropriate input types (`email`, `tel`, `number`).
- Validation messages must remain visible on small screens.

### Performance Requirements
- Lazy-load heavy components and routes.
- Minimize bundle size; prefer dynamic imports.
- Avoid unnecessary re-renders (memoize where appropriate).
- Images must be responsive and optimized.

### Testing Requirements
Every feature must be tested on:
- **Mobile:** 375×812  
- **Tablet:** 768×1024  
- **Desktop:** ≥1280px  
Use Chrome DevTools device emulation or equivalent.

---

## Theme Utilization
- Use the provided `ThemeContext` and `getTheme` function to apply themes across the app.
- All components must consume theme context for consistent colors, spacing, and typography.
- Do not hardcode colors, spacing, or fonts; use theme tokens.
- Theme changes must automatically propagate without modifying individual components.

---

## Error Handling and Notifications
- Notification types:
  - Inline notifications for validation errors
  - Toast notifications for network or unexpected errors
  - Modal dialogs for critical errors
- Show user-friendly messages, log errors, and avoid app crashes.

---

## Frontend Top-Level Layout
- `web/src/app/` contains global providers, layout, and routing.
- Providers include router, theme, and query client.
- `AppLayout.tsx` defines the top-level layout.
- `routes/` defines route configuration.
- `store/` may contain global state (Zustand, Redux, Jotai).

---

## Feature-Based Folders
- `web/src/features/` contains domain-specific features organized by functionality.
- Structure:
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

---

## Application shell
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

---

## Shared building blocks
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

---

## Pages and route‑level components
- Pages compose features; they must not contain business logic.
- Each page imports feature components rather than containing business logic itself.
- structure:
    * web/src/pages/
      * Home/
        * HomePage.tsx
      * Dashboard/
        * DashboardPage.tsx
      * Settings/
        * SettingsPage.tsx

---

## Widgets
- Widgets combine multiple features into reusable UI compositions.
- structure:
    * web/src/widgets/
      * UserMenu/
      * NotificationsPanel/
      * Sidebar/

---

## Styles and assets
- `web/src/assets/` contains static assets like images, icons, and fonts.
- Use MUI’s styling system for component-level styles.
- Use global CSS only for resets, variables, and global typography.
- structure:
    * web/src/assets/
      * images/
      * icons/
      * fonts/
    * web/src/assets/styles/
      * globals.css
      * variables.css
      * mixins.css

---

## Library and utilities
- `web/src/lib/` contains infrastructure-level code (API, HTTP, validation, analytics).
- These modules are used across features but are not UI‑related.
- structure:
    * web/src/lib/
      * api/
      * http/
      * validation/
      * analytics/

---

## Tests Colocated With Code
- Tests live next to the files they test:
- `Component.tsx`
- `Component.test.tsx`