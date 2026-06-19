---
name: frontend-ux-and-accessibility
description: >
  Defines UX, accessibility, design-system, and interaction rules for the OQM
  React frontend. Copilot must use this skill whenever generating UI, MUI
  components, dialogs, forms, or interactive elements.
license: MIT
---

# Frontend UX & Accessibility

This skill defines the **only valid** UX, accessibility, and design-system rules
for the OQM frontend.

---

# 1. Design System: Material UI

Copilot must:

- use MUI components for all UI  
- use `sx` or styled() for styling  
- avoid CSS modules unless explicitly required  
- use theme tokens for colors, spacing, typography  
- never hardcode colors or fonts  

---

# 2. Accessibility Rules

Copilot must:

- ensure keyboard accessibility  
- ensure screen-reader compatibility  
- use ARIA attributes for interactive elements  
- ensure focus management in dialogs  
- ensure proper labeling for inputs  

---

# 3. Interaction Rules

Copilot must:

- use proper interactive components (`Button`, `IconButton`, `ListItemButton`)  
- avoid clickable `<div>` elements  
- ensure minimum touch target size: **48×48 px**  
- avoid hover-only interactions  

---

# 4. Dialog Rules (Strict)

Copilot must always use the required dialog pattern:

(Full pattern omitted here for brevity — use the exact structure from instructions.)

Rules:

- fullScreen on mobile  
- responsive width on desktop  
- scrollable content on mobile  
- natural height on desktop  
- no `maxHeight: 90vh` on desktop  
- no `overflowY: auto` on desktop  

---

# 5. Forms & Inputs

Copilot must:

- use MUI TextField  
- ensure mobile keyboard does not obscure inputs  
- use appropriate input types  
- keep validation messages visible  

---

# 6. Notifications

Types:

- inline for validation  
- toast for network errors  
- modal for critical errors  

---

# 7. Required Behavior for Copilot

Copilot must:

- always use MUI  
- always follow dialog rules  
- always follow accessibility rules  
- always use theme tokens  
- never hardcode colors  
- never create inaccessible components  

---

# 8. Interaction With Other Skills

- **frontend-responsive-design** — mobile-first rules  
- **frontend-i18n** — localized UI text  
- **frontend-performance** — optimized rendering  
- **frontend-api-client** — API error handling  

---

# 9. Future Extensions

UX rules may expand; Copilot must not assume fixed patterns.
