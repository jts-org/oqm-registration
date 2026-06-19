---
name: frontend-i18n
description: >
  Defines localization rules, translation key usage, unicode handling, and
  language-switching behavior for the OQM frontend. Copilot must use this skill
  whenever generating or modifying UI text, translations, or locale logic.
license: MIT
---

# Frontend Internationalization (i18n)

This skill defines the **only valid** localization model for the OQM frontend.

---

# 1. Translation System

Copilot must:

- store all text in `web/src/locales/`  
- use translation keys, not raw strings  
- use `i18n.t('key')` or `useTranslation()`  
- never hardcode user-facing text  

---

# 2. Unicode Rules

Finnish characters must use JSON unicode escapes:

- ä → `\u00e4`  
- ö → `\u00f6`  

---

# 3. Language Detection

Default language:

- Finnish when `navigator.language` starts with `fi`  
- otherwise English  

---

# 4. Language Switch

Rules:

- language switch must appear **only on HomePage**  
- unless an issue explicitly expands scope  

---

# 5. Adding New Strings

Copilot must:

- add keys to both locales  
- use unicode escapes  
- never inline text in components  

---

# 6. Required Behavior for Copilot

Copilot must:

- always use translation keys  
- never hardcode text  
- always update both locale files  
- always use unicode escapes  

---

# 7. Interaction With Other Skills

- **frontend-ux-and-accessibility** — localized labels  
- **frontend-responsive-design** — responsive text  
- **frontend-api-client** — localized error messages  

---

# 8. Future Extensions

Localization rules may expand.
