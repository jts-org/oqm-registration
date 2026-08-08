# Token Efficiency Report

## Scope

Measured files:
- `.github/agents/**/*.md`
- `.github/skills/**/*.md`

Token estimate method:
- Approximate tokens = `character_count / 4` (rounded)

## Before vs After (Cumulative)

| Metric | Initial Baseline | Current | Delta |
| --- | ---: | ---: | ---: |
| Files | 58 | 59 | +1 |
| Total lines | 11,468 | 10,498 | -970 |
| Total characters | 364,098 | 336,104 | -27,994 |
| Estimated tokens | 91,025 | 84,026 | -6,999 |

## Phase 4 Delta

Phase 4 targeted high-volume skill contracts in the wire/auth/schema domain and compressed verbose examples
into concise canonical rules while preserving strict API and schema behavior.

| Metric | Phase 3 End | Phase 4 End | Delta |
| --- | ---: | ---: | ---: |
| Total lines | 10,885 | 10,498 | -387 |
| Total characters | 342,010 | 336,104 | -5,906 |
| Estimated tokens | 85,503 | 84,026 | -1,477 |

## Phase 3 Delta

Phase 3 targeted the two largest agent files (`mimir.agent.md` and `mimir-planner.agent.md`) and replaced long embedded examples/templates with concise normative rules.

| Metric | Phase 2 End | Phase 3 End | Delta |
| --- | ---: | ---: | ---: |
| Total lines | 11,427 | 10,885 | -542 |
| Total characters | 361,344 | 342,010 | -19,334 |
| Estimated tokens | 90,336 | 85,503 | -4,833 |

## What Drove Savings

1. Centralized duplicated clarification rules into `.github/agents/references/clarification-protocol.md`.
2. Replaced five repeated clarification blocks in agent contracts with short references.
3. Reduced duplicated response-contract prose in `wire-react-to-gas`.
4. Reduced duplicated route-access listing in `auth-flow` by referencing canonical route matrix.
5. Compressed large embedded templates and long worked examples in `mimir-planner.agent.md`.
6. Compressed verbose delegation pattern and scenario flow examples in `mimir.agent.md`.
7. Compressed route payload/response examples in `wire-react-to-gas` into concise contract rules.
8. Compressed repetitive schema and range rule prose in `sheet-schema` while preserving all sheet tables.
9. Rewrote `gas-id-generation` into a concise decision matrix while retaining strict atomicity/uniqueness rules.

## Residual High-Value Opportunities

1. Normalize repeated "Interaction With Other Skills" sections where ownership links are already covered by the matrix.
2. Compress remaining high-volume performance and setup skills (`vite-react-performance`, `setup-gas-webapp`) into rule-first summaries with reference pointers.
3. Standardize all long route-specific examples into compact field matrices plus shared validation blocks.

## Verification

- Local markdown links: pass
- Doc diagnostics for touched files: pass
