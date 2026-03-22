**Title:**
OQM-0029 Fix user manuals failing to load on GitHub Pages

**Description:**
User manuals load correctly in local development but return 404 when the app is deployed to GitHub Pages. The fetch path is constructed with a hardcoded leading `/`, making it absolute from the domain root. On GitHub Pages the app lives under a subdirectory (e.g. `/oqm-registration/`), so the request hits `https://jts-org.github.io/trainee-manual.en.md` instead of `https://jts-org.github.io/oqm-registration/trainee-manual.en.md`.

**User Story:**
As a user, I want the in-app manuals to open successfully on the live site, so that I can read the trainee or coach manual without encountering an error page.

**Scope:**
- Frontend in web:
  - Replace the hardcoded `/` prefix in the `manualPath` memo inside `ManualsPage.tsx` with `import.meta.env.BASE_URL` so the path is resolved relative to the deployed base URL.

**Out of Scope:**
- Changes to `vite.config.ts`, CI workflow, or any GitHub Pages configuration.
- Backend or sheet changes.
- UI redesign or new features in the manuals page.

**Preconditions:**
- `vite.config.ts` already reads `VITE_BASE` from the environment and passes it as Vite's `base` option; CI sets this to `/<repo>/`.
- Manual markdown files are already served as static assets from `publicDir: '../user_manuals'`.
- The manuals page and its routing are already implemented and functional locally.

**Main Flow (load manual):**
1. User navigates to the manuals page (any audience/language combination).
2. `ManualsPage` derives `manualPath` as `` `${import.meta.env.BASE_URL}${audience}-manual.${language}.md` ``.
3. App fetches the markdown file at the correct sub-path under the deployed base URL.
4. Markdown content is rendered in the page.

**Alternative Flows:**
1. Fetch fails (network error or missing file): existing error handling shows the `manuals.loadError` localized message — no change in behavior.

**User Feedback Messages:**
- Success: manual content is displayed as before — no visible change to the user.
- Failure: existing `manuals.loadError` message continues to be shown if the fetch fails for any reason.

**Test Cases:**
- Unit test: `manualPath` is built with `import.meta.env.BASE_URL` as its prefix for each audience/language combination.
- Unit test: when `BASE_URL` is `/oqm-registration/`, `manualPath` resolves to `/oqm-registration/trainee-manual.en.md`.
- Unit test: when `BASE_URL` is `/` (local dev), `manualPath` resolves to `/trainee-manual.en.md` (no double slash).
- Integration: mocked fetch for the correct path returns 200 and the markdown is rendered.
- Integration: mocked fetch returning 404 still shows the localized error message.

**Acceptance Criteria:**
- `manualPath` uses `import.meta.env.BASE_URL` as its prefix instead of a hardcoded `/`.
- Manuals load without 404 errors when the app is served from a GitHub Pages subdirectory.
- Manuals continue to load correctly in local development (BASE_URL = `/`).
- No double slash is produced when BASE_URL already ends with `/`.
- All existing manual page tests pass; no new console errors or warnings.

**Linked Files/Branches:**
- [web/src/pages/Manuals/ManualsPage.tsx](web/src/pages/Manuals/ManualsPage.tsx)
- [web/vite.config.ts](web/vite.config.ts)
- Suggested branch: fix/oqm-0029-fix-manuals-loading

**References:**
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
