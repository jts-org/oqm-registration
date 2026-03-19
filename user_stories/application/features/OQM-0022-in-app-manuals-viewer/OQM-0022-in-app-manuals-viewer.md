**Title:**
OQM-0022 In-App User Manuals Viewer

**Description:**
Expose the Markdown user manuals (created in OQM-0021) as a browsable page inside the application. Users can select language (EN / FI) and audience (Trainee / Coach) and read the relevant manual without leaving the app. The page is accessible from the Home screen and supports shareable deep-link URLs.

**User Story:**
As a user, I want to read the relevant user manual in my language directly inside the application so that I do not need to find an external document.

**Scope:**
- Add a `/manuals` route that renders a Manuals viewer page.
- Serve the existing Markdown files (`user_manuals/*.md`) as static assets from the Vite build.
- Let the user switch between Trainee / Coach audience and EN / FI language with toggle controls.
- Reflect the selected audience and language in the URL query string (`?audience=trainee|coach&lang=en|fi`) so links can be shared or bookmarked.
- Add a "User manuals" role card on the Home page, placed below the Admin card.
- Add localization strings for all new UI labels in both `en.json` and `fi.json`.
- Add a Copilot instruction rule requiring manuals to be updated whenever user-visible UI changes are made.

**Out Of Scope:**
- Editing manuals from within the app.
- Displaying manuals in a modal or drawer (full page route only).
- Search or full-text indexing of manual content.
- Any changes to GAS backend.

**Preconditions:**
- OQM-0021 is complete: all four manual Markdown files exist in `user_manuals/`.
- React Router DOM is already configured in the project.
- `react-markdown` package is available (`npm install react-markdown`).

**Deliverables:**
- `web/src/pages/Manuals/ManualsPage.tsx` — viewer component
- Route `/manuals` added to `web/src/App.tsx`
- `onGoManuals` prop + Manuals RoleCard added to `web/src/pages/Home/HomePage.tsx`
- `manuals.*` and `mainView.manuals*` keys added to `web/src/locales/en.json` and `fi.json`
- `web/vite.config.ts` — `publicDir` updated to `../user_manuals`
- `.github/instructions/copilot-instructions.md` — new "User Manuals Maintenance" section
- `.github/instructions/review-checklist.instructions.md` — new checklist item for manual updates

**Main Flow (Browse Manuals):**
1. User opens the app and sees the Home page.
2. User clicks the "User manuals" card.
3. App navigates to `/manuals` (defaults to Trainee, current browser language or EN).
4. The page fetches and renders the matching Markdown file.
5. User clicks an audience toggle (Trainee / Coach) — the page re-fetches and re-renders the matching manual, and the URL updates to `?audience=coach&lang=en`.
6. User clicks a language toggle (EN / FI) — same re-fetch, URL updates to `?lang=fi`.
7. User clicks "Back to main" — app navigates back to `/`.

**Alternative Flows:**
1. **Deep link** — User opens `/manuals?audience=coach&lang=fi` directly or from a shared link; the page initialises with the correct audience and language pre-selected.
2. **Fetch error** — If the Markdown file cannot be fetched (e.g. network error or missing file), the page displays a localized error message; the audience/language controls remain functional.
3. **Loading state** — While the file is being fetched, a localized loading indicator is shown instead of empty content.

**User Feedback Messages:**
- Loading indicator while Markdown is being fetched (`manuals.loading`).
- Inline error alert if the fetch fails (`manuals.loadError`).
- No success toast required; successful load is self-evident by the rendered content.

**Test Cases:**
- Navigating to `/manuals` renders the Manuals page with default audience (Trainee) and default language.
- Selecting the Coach audience toggle fetches and displays the coach manual without page reload.
- Selecting the Finnish language toggle fetches and displays the Finnish manual.
- The URL query string updates when audience or language is changed.
- Opening `/manuals?audience=coach&lang=fi` directly renders the Finnish coach manual.
- Opening `/manuals?audience=invalid&lang=bogus` falls back to trainee/EN defaults.
- A network failure during fetch shows the localized error message.
- The Back button navigates to `/`.
- All four Markdown files are present in the production build `dist/` folder.
- The "User manuals" card is visible on the Home page below the Admin card.
- EN and FI localization keys for `manuals.*` and `mainView.manuals*` resolve without missing-key warnings.

**Acceptance Criteria:**
- `/manuals` route is reachable from the Home page via the Manuals RoleCard.
- Audience and language can be switched interactively without page navigation.
- URL reflects current audience and language; sharing the URL opens the correct manual.
- Markdown content renders with legible typography (headings, paragraphs, lists).
- Loading and error states are user-visible and localized.
- All four Markdown files are served correctly in both development (`vite dev`) and production (`vite build`).
- The Manuals RoleCard appears below the Admin card on the Home page.
- Copilot instruction added to keep manuals in sync with future UI changes.
- No TypeScript or ESLint errors introduced.

**Linked Files/Branches:**
- OQM-0021 — source manual files
- `web/src/pages/Manuals/ManualsPage.tsx`
- `web/src/App.tsx`
- `web/src/pages/Home/HomePage.tsx`
- `web/vite.config.ts`
- `web/src/locales/en.json`, `fi.json`
- `.github/instructions/copilot-instructions.md`
- `.github/instructions/review-checklist.instructions.md`
- Branch: `feature/oqm-0021-create-user-manuals`

**References:**
- `skills/SKILL.wire-react-to-gas.md` — ← route/page conventions
- `skills/SKILL.setup-react-vite.md` — ← Vite config conventions
- `.github/instructions/frontend.instructions.md`
