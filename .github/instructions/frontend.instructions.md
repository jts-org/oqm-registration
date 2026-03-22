# Frontend Instructions (web/)
- Use Vite scripts (`dev`, `build`, `preview`).
- `vite.config.ts` reads `VITE_BASE` from env to configure the correct base for GitHub Pages.
- For Apps Script POST requests, set `redirect: 'follow'` and `Content-Type: 'text/plain;charset=utf-8'`.
- Keep API URL in `VITE_GAS_BASE_URL`.

## UX and Accessibility
- Use Material UI library for consistent design and built-in accessibility.
- All UI components must be responsive and accessible via keyboard and screen reader.
- Follow ARIA guidelines for modals, forms, and interactive elements.
- Use CSS modules or CSS-in-JS for styling.
- Localize all user-facing text using `web/src/lib/i18n.ts` and `web/src/locales/` instead of hardcoded text. By default, use English keys and provide Finnish and English translations.
- Default UI language must follow browser locale: use Finnish when `navigator.language` starts with `fi`, otherwise use English.
- Place the UI language switch on HomePage only unless a specific issue explicitly expands the scope.
- When adding new locale strings, write Finnish characters using JSON unicode escapes: `ä` as `\u00e4` and `ö` as `\u00f6`.
- When presenting tittles, buttons, links, etc. in issue descriptions, use of: `Button label: 'Label text' (use translation key)` indicates that the text should be stored as a translation key for localization purposes.
- During API operations, block user interactions with the UI using dimmed overlay with a centered loader. This ensures that users are aware that an operation is in progress and prevents unintended actions while waiting for a response.

## Theme Utilization
- Use the provided `ThemeContext` and `getTheme` function to apply themes across the app. The theme is defined in `web/src/theme.config.ts` and can be switched by changing the value passed to `getTheme` (e.g., 'dark', 'light', or sport-specific themes).
- Ensure that all components consume the theme context to maintain a consistent look and feel throughout the application. This includes using theme colors, fonts, and spacing defined in the theme configuration.
- When implementing new components or pages, make sure to utilize the theme variables for styling instead of hardcoding values. This allows for easier maintenance and ensures that any theme changes will automatically reflect across the entire app without needing to update individual components.

## Error handling and notifications
- Error notification types: 
    * Inline notifications for validation errors
    * Toast notifications for network or unexpected errors
    * Modal dialogs for critical errors
- In error situations show user-friendly messages, log errors and avoid app crashes.

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
- `web/src/assets/styles/` contains global styles. If using Tailwind, the styles/ folder becomes minimal.
- structure:
    * web/src/assets/
      * images/
      * icons/
      * fonts/
    * web/src/assets/styles/
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