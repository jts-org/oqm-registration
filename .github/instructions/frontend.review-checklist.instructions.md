# COPILOT INSTRUCTIONS — FRONTEND (React + Vite + MUI)

You MUST follow these rules when generating code:

## 📱 Mobile‑First
- Always design mobile-first.
- Support minimum width 320px.
- Use flexible layouts (flex/grid/%/maxWidth), never fixed px widths.
- Use MUI responsive props: sx={{ display: { xs: '...', md: '...' } }}.
- Ensure touch targets are ≥ 48×48 px.
- Avoid hover-only interactions; always provide tap equivalents.
- Navigation must adapt to mobile (temporary drawer, hamburger, bottom nav).

## 🎨 Theme & Styling
- Use ThemeContext and theme tokens for colors, spacing, typography.
- Never hardcode colors, spacing, or fonts.
- Use MUI’s styling system (`sx`, styled components) unless CSS modules are explicitly required.

## 🌍 Localization
- All user-facing text must use translation keys.
- No hardcoded strings.
- Finnish characters must use unicode escapes (ä → \u00e4, ö → \u00f6).

## 🧭 Accessibility
- All components must be keyboard-accessible and screen-reader friendly.
- Follow ARIA guidelines for modals, forms, and interactive elements.

## ⚙️ API & Loading
- Use VITE_GAS_BASE_URL for API calls.
- During API operations, block UI with dimmed overlay + centered loader.

## 🧱 Architecture
- Place domain-specific code under web/src/features/<feature>/.
- Pages must not contain business logic.
- Shared components go under web/src/shared/.
- Do not create cross-feature dependencies.

## 🧪 Testing
- Code must be testable and colocated with tests.

If you generate code that violates these rules, regenerate it correctly.
