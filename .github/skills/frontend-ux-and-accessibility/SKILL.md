```markdown
---
name: frontend-ux-and-accessibility
description: UX, accessibility, design-system, and interaction rules for the OQM React frontend. Copilot must apply this skill whenever generating UI, MUI components, dialogs, forms, or interactive elements.
license: MIT
---

# Frontend UX & Accessibility

Authoritative UX, accessibility, and design-system model for the OQM frontend.  
Mandate-first rules for MUI usage, accessibility, interactions, dialogs, forms, notifications, and integration with other frontend skills.

---

## 1. Design System: Material UI

Copilot must:
- use MUI components for all UI  
- use `sx` or `styled()` for styling  
- avoid CSS modules unless explicitly required  
- use theme tokens for colors, spacing, typography  
- never hardcode colors or fonts  

Rules:
- design-system consistency is mandatory  
- theme tokens must drive all styling decisions  

---

## 2. Accessibility Rules

Copilot must:
- ensure keyboard accessibility  
- ensure screen-reader compatibility  
- use ARIA attributes for interactive elements  
- ensure focus management in dialogs  
- ensure proper labeling for inputs  

Rules:
- no unlabeled inputs  
- no inaccessible custom components  
- no broken tab order  

---

## 3. Interaction Rules

Copilot must:
- use proper interactive components (`Button`, `IconButton`, `ListItemButton`)  
- avoid clickable `<div>` elements  
- ensure minimum touch target size: **48×48 px**  
- avoid hover-only interactions  

Rules:
- interactions must work on touch devices  
- never rely on hover as the only affordance  

---

## 4. Dialog Rules (Strict)

Copilot must always use the required dialog pattern:

- fullScreen on mobile  
- responsive width on desktop  
- scrollable content on mobile  
- natural height on desktop  
- no `maxHeight: 90vh` on desktop  
- no `overflowY: auto` on desktop  

Rules:
- dialog behavior must follow responsive design  
- desktop dialogs must not mimic mobile scroll behavior  

---

## 5. Forms & Inputs

Copilot must:
- use MUI `TextField`  
- ensure mobile keyboard does not obscure inputs  
- use appropriate input types  
- keep validation messages visible  

Rules:
- validation must be user-facing and accessible  
- never hide errors behind hover or collapsed UI  

---

## 6. Notifications

Types:
- inline for validation  
- toast for network errors  
- modal for critical errors  

Rules:
- notification type must match severity  
- never use modal for non-critical events  

---

## 7. Client-Side Identity Persistence

When a flow offers optional browser persistence for trainee identity, Copilot must:
- request explicit consent before writing identity data
- persist only the exact schema `{ pin?, name, age }`
- validate the parsed object before use and ignore malformed, extra-field, or invalid data
- keep declined consent non-blocking for the registration flow
- treat optional PIN persistence or automatic identity reuse as unimplemented until the UI and tests support it

## 8. Required Behavior for Copilot

Copilot must:
- always use MUI  
- always follow dialog rules  
- always follow accessibility rules  
- always use theme tokens  
- never hardcode colors  
- never create inaccessible components  

---

## 9. Interaction With Other Skills

- **frontend-responsive-design** — mobile-first layout + dialog rules  
- **frontend-i18n** — localized UI text  
- **frontend-performance** — optimized rendering  
- **frontend-api-client** — API error handling and user-facing messages  

---

## 10. Future Extensions

UX rules may expand.  
Copilot must not assume fixed patterns or design-system constraints.
```
