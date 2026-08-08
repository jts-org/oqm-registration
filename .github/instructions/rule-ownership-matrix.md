# Rule Ownership Matrix

Single-source ownership map for high-risk rule families. Update only the owner file first, then propagate references.

| Rule Family | Owner File | Reference-Only Files |
| --- | --- | --- |
| Frontend-backend wire contract (routes, payloads, token carriage) | `.github/skills/wire-react-to-gas/SKILL.md` | `AGENTS.md`, `auth-flow`, `frontend-api-client`, `pr-review` |
| Response object shape (`ok/data`, `ok/error`) | `.github/skills/gas-response-format/SKILL.md` | `wire-react-to-gas`, `gas-error-handling`, `gas-backend-architecture`, `pr-review` |
| Authentication and authorization semantics | `.github/skills/auth-flow/SKILL.md` | `wire-react-to-gas`, `gas-backend-architecture`, `pr-review` |
| Concurrency and locking | `.github/skills/gas-locking-and-concurrency/SKILL.md` | `gas-backend-architecture`, `gas-sheet-operations`, `pr-review` |
| Sheet schema and stable indexes | `.github/skills/sheet-schema/SKILL.md` | `gas-sheet-operations`, `gas-validation-rules`, `AGENTS.md`, `pr-review` |
| Error codes and mappings | `.github/skills/gas-error-handling/SKILL.md` | `wire-react-to-gas`, `gas-response-format`, `auth-flow`, `pr-review` |
| Frontend architecture boundaries | `.github/skills/frontend-architecture/SKILL.md` | `frontend.instructions.md`, `pr-review`, `AGENTS.md` |
| Localization rules | `.github/skills/frontend-i18n/SKILL.md` | `frontend.instructions.md`, `pr-review` |
| Agent clarification behavior | `.github/agents/references/clarification-protocol.md` | `mimir.agent.md`, `mimir-architect.agent.md`, `mimir-planner.agent.md`, `project-sync.agent.md`, `test-engineer.agent.md` |
| Review method contract | `.github/skills/review-work/SKILL.md` | `mimir.md`, `mimir-reviewer` guidance, checklist instructions |

## Change Policy

1. Edit owner file first.
2. Keep non-owner files short and reference the owner.
3. Reject duplicate long-form rules in non-owner files unless strict local override is required.
4. If an override is required, label it `owner override` and include a rationale.
