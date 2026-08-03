```markdown
---
name: frontend-responsive-design
description: Mobile-first, responsive layout, dialog behavior, and viewport rules for the OQM React frontend. Copilot must apply this skill whenever generating layouts, dialogs, breakpoints, or responsive components.
license: MIT
---

# Frontend Responsive Design

Authoritative responsive design model for the OQM frontend.  
Mandate-first rules for mobile-first layout, breakpoints, dialogs, typography, spacing, testing, and integration with other frontend skills.

---

## 1. Mobile-First Rules

Copilot must:
- design for **320px minimum width**  
- use flexible layouts (flex, grid, %)  
- avoid fixed pixel widths  
- avoid horizontal scrolling  
- use MUI responsive props (`sx`, breakpoints, responsive variants)

Rules:
- mobile-first is mandatory  
- desktop layouts must scale from mobile, not the reverse  

---

## 2. Breakpoints

Copilot must use MUI breakpoints:

- **xs** — mobile  
- **sm** — small tablet  
- **md** — desktop  
- **lg/xl** — large screens  

Rules:
- breakpoints must drive layout, spacing, typography, and dialog behavior  
- never hardcode custom breakpoints unless explicitly required  

---

## 3. Dialog Behavior

Strict dialog pattern:

- **fullScreen on mobile**  
- responsive width on desktop  
- scrollable content on mobile  
- natural height on desktop  

Rules:
- dialogs must adapt to viewport  
- never force desktop dialog behavior on mobile  

---

## 4. Layout Rules

Copilot must:
- use responsive typography  
- ensure readable line lengths  
- ensure spacing scales with viewport  
- avoid overflow  
- ensure components collapse gracefully on small screens  

Rules:
- never use fixed widths or fixed typography sizes  
- spacing must adapt to breakpoints  

---

## 5. Testing Requirements

Copilot must ensure features are tested at:

- **375×812** (mobile)  
- **768×1024** (tablet)  
- **≥1280px** (desktop)  

Rules:
- responsive behavior must be validated across these viewports  
- never assume desktop-only correctness  

---

## 6. Required Behavior for Copilot

Copilot must:
- always generate mobile-first layouts  
- always use responsive props  
- never use fixed widths  
- never generate desktop-only layouts  
- ensure dialogs, typography, spacing, and images respond to breakpoints  

---

## 7. Interaction With Other Skills

- **frontend-ux-and-accessibility** — dialog rules, readable text  
- **frontend-performance** — responsive loading + image optimization  
- **frontend-i18n** — responsive text and key-based localization  

---

## 8. Future Extensions

Responsive rules may expand.  
Copilot must not assume fixed breakpoints, layout systems, or dialog patterns.
```
