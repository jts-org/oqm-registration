---
name: frontend-responsive-design
description: >
  Defines mobile-first, responsive layout, dialog behavior, and viewport rules
  for the OQM React frontend. Copilot must use this skill whenever generating
  layouts, dialogs, breakpoints, or responsive components.
license: MIT
---

# Frontend Responsive Design

This skill defines the **only valid** responsive design rules for the OQM
frontend.

---

# 1. Mobile-First Rules

Copilot must:

- design for 320px minimum width  
- use flexible layouts (flex, grid, %)  
- avoid fixed pixel widths  
- avoid horizontal scrolling  
- use MUI responsive props  

---

# 2. Breakpoints

Copilot must use:

- xs: mobile  
- sm: small tablet  
- md: desktop  
- lg/xl: large screens  

---

# 3. Dialog Behavior

Copilot must follow the strict dialog pattern:

- fullScreen on mobile  
- responsive width on desktop  
- scrollable content on mobile  
- natural height on desktop  

---

# 4. Layout Rules

Copilot must:

- use responsive typography  
- ensure readable line lengths  
- ensure spacing scales with viewport  
- avoid overflow  

---

# 5. Testing Requirements

Copilot must ensure features are tested at:

- 375×812 (mobile)  
- 768×1024 (tablet)  
- ≥1280px (desktop)  

---

# 6. Required Behavior for Copilot

Copilot must:

- always generate mobile-first layouts  
- always use responsive props  
- never use fixed widths  
- never use desktop-only layouts  

---

# 7. Interaction With Other Skills

- **frontend-ux-and-accessibility** — dialog rules  
- **frontend-performance** — responsive loading  
- **frontend-i18n** — responsive text  

---

# 8. Future Extensions

Responsive rules may expand.
