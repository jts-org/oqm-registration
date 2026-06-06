## Summary
- Linked issue: #

## Checklist
- [ ] Tests added/updated and passing
- [ ] No secrets committed
- [ ] API contract adhered to
- [ ] Updated docs/skills if schema or flows changed
- [ ] Global review checklist completed (`review-checklist.instructions.md`)
- [ ] Frontend review checklist completed if PR includes frontend changes (`frontend.review-checklist.md`)

---

## Frontend Checklist (only if PR touches `web/`)
<details>
<summary>Expand frontend checklist</summary>

### 📱 Mobile‑First & Responsiveness
- [ ] Layout works at 320px width without horizontal scrolling
- [ ] Uses flexible layouts (flex/grid/%/maxWidth), not fixed px widths
- [ ] Uses MUI responsive props (`sx={{ ... }}`)
- [ ] Touch targets ≥ 48×48 px
- [ ] No hover-only interactions; tap equivalents exist
- [ ] Navigation adapts to mobile (hamburger, temporary drawer, bottom nav)
- [ ] Forms usable with mobile keyboard open
- [ ] Validation messages visible on small screens

### 🎨 Theme & Styling
- [ ] Uses ThemeContext and theme tokens
- [ ] No hardcoded colors, spacing, or fonts
- [ ] Uses MUI styling system (`sx`, styled components)
- [ ] Component supports dark/light/sport themes

### 🌍 Localization
- [ ] All user-facing text uses translation keys
- [ ] Finnish characters use unicode escapes (`ä` → `\u00e4`, `ö` → `\u00f6`)
- [ ] No hardcoded strings

### 🧭 Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA roles/labels applied
- [ ] Screen reader announcements for modals/loaders
- [ ] Focus management correct

### ⚙️ API & Loading
- [ ] API calls use `VITE_GAS_BASE_URL`
- [ ] UI blocked during API operations with dimmed overlay + loader
- [ ] Errors use correct notification type (inline/toast/modal)

### 🧱 Architecture
- [ ] Feature code under `web/src/features/<feature>/`
- [ ] Pages contain no business logic
- [ ] Shared components under `web/src/shared/`
- [ ] No cross-feature imports

### 🧪 Testing
- [ ] Tests colocated with components
- [ ] Tested on mobile, tablet, desktop

</details>
