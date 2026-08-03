```markdown
---
name: frontend-i18n
description: Localization rules, translation key usage, unicode handling, and language-switching behavior for the OQM frontend. Copilot must apply this skill whenever generating or modifying UI text, translations, or locale logic.
license: MIT
---

# Frontend Internationalization (i18n)

Authoritative localization model for the OQM frontend.  
Mandate-first rules for translation keys, unicode, language detection, switching, and integration with other frontend skills.

---

## 1. Translation System

Copilot must:
- store all user-facing text in `web/src/locales/`  
- use translation keys, never raw strings  
- use `i18n.t('key')` or `useTranslation()`  
- never inline text in components  

---

## 2. Unicode Rules

Finnish characters must use JSON unicode escapes:

- ä → `\u00e4`  
- ö → `\u00f6`  

Rules:
- always use unicode escapes in locale JSON  
- never store raw ä/ö in locale files  

---

## 3. Language Detection

Default language:
- Finnish when `navigator.language` starts with `"fi"`  
- otherwise English  

Rules:
- detection must be client-side  
- no backend involvement  

---

## 4. Language Switch

Rules:
- language switch appears **only on HomePage**  
- unless an issue explicitly expands scope  
- switch must update i18n state and persist only in memory (no backend)  

---

## 5. Adding New Strings

Copilot must:
- add keys to **both** locale files  
- use unicode escapes  
- never inline text  
- ensure keys follow existing naming conventions  

---

## 6. Required Behavior for Copilot

Copilot must:
- always use translation keys  
- never hardcode text  
- always update both locales  
- always use unicode escapes  
- ensure UI components remain text-free (keys only)  

---

## 7. Interaction With Other Skills

- **frontend-ux-and-accessibility** — localized labels, ARIA text  
- **frontend-responsive-design** — responsive text handling  
- **frontend-api-client** — localized error messages and user-facing API text  

---

## 8. Future Extensions

Localization rules may expand.  
Copilot must not assume fixed languages, locales, or switching mechanisms.  
New languages or locale behaviors may be added without breaking this skill.
```
