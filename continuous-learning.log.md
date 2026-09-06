# Continuous Learning Log

## 2026-08

- 2026-08-03T00:00:00Z | event=promotion | track=tracks/feature-admin-account-crud |
  lessons=tracks/feature-admin-account-crud/lessons.md |
  surfaces=.github/instructions/copilot-instructions.md |
  summary=Promoted doc-ownership split and Git Bash inline-script safety rules |
  why=Both patterns repeated across completed tasks and reduce recurring drift and validation-script failures |
  invoker=implement

- 2026-08-16T00:00:00Z | event=promotion | track=tracks/feature-backend-perf-session-window-caching |
  lessons=tracks/feature-backend-perf-session-window-caching/lessons.md |
  surfaces=.github/skills/gas-backend-architecture/SKILL.md,.github/instructions/backend.instructions.md |
  summary=Promoted request-scoped closure-as-parameter exception to no-global-state rule, mandatory CacheService fail-open + identity-independent-only caching, and DI-reader test-stub convention |
  why=Patterns generalize to any future GAS route needing per-invocation memoization, CacheService usage, or reader-parameter testing |
  invoker=implement

- 2026-08-23T00:00:00Z | event=promotion | track=tracks/feature-oqm-0049-qr-based-training-session-registration |
  lessons=tracks/feature-oqm-0049-qr-based-training-session-registration/lessons.md |
  surfaces=.github/skills/wire-react-to-gas/SKILL.md,.github/skills/gas-route-registry/SKILL.md,user_manuals/trainee-manual.en.md,user_manuals/trainee-manual.fi.md |
  summary=Promoted QR selector contract, backend-day truth, and privacy-aware consent persistence guidance |
  why=The QR flow adds a public resolver route, strict same-day eligibility rules, and required browser identity consent behavior that future tracks may reuse |
  invoker=implement

- 2026-08-23T00:00:00Z | event=promotion | track=tracks/feature-oqm-0049-qr-based-training-session-registration |
  lessons=tracks/feature-oqm-0049-qr-based-training-session-registration/lessons.md |
  surfaces=.github/skills/frontend-ux-and-accessibility/SKILL.md,.github/skills/gas-route-registry/SKILL.md |
  summary=Promoted consent-gated exact-schema identity storage validation; retained backend-day and public-route ownership in existing authoritative skills and removed redundant registry detail |
  why=The lessons validate reusable privacy behavior while existing date/API contract surfaces already own timezone and route rules; optional PIN persistence and automatic reuse are deferred until the QR UI implements and tests them |
  invoker=implement

## 2026-09

- 2026-09-06T00:00:00Z | event=promotion | track=tracks/feature-oqm-0050-qr-customer-event-registration |
  lessons=tracks/feature-oqm-0050-qr-customer-event-registration/lessons.md |
  surfaces=.github/skills/gas-date-and-time/SKILL.md,.github/skills/wire-react-to-gas/SKILL.md,.github/skills/frontend-architecture/SKILL.md |
  summary=Promoted localized date/time cell normalization, customer-event multi-session atomic write contract, and strict src/pages/ route component location rules |
  why=The customer event registration flow establishes essential fixes for localized Apps Script Date cell string parsing, atomic single-lock multi-session writes, and route page co-location constraints that benefit all future event and batch registration features |
  invoker=implement
