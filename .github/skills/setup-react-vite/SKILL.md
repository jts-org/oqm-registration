---
name: setup-react-vite
description: >
  Minimal onboarding and setup steps for the React + Vite frontend used by the
  OQM Registration project. This SKILL.md is intentionally concise and points
  to performance and CI skills for deeper guidance.
license: MIT
---

# Setup: React + Vite (Frontend)

This document describes the minimal steps to get the frontend running locally.
Refer to `vite-react-performance` and `deploy-ci` for production and performance
recommendations.

## Quick start

- Install dependencies: `cd web && npm install`
- Create `web/.env.local` with:
  ```env
  VITE_GAS_BASE_URL=https://script.google.com/macros/s/<YOUR_EXEC_ID>/exec
  ```
- Start dev server: `cd web && npm run dev`

## Notes

- `VITE_GAS_BASE_URL` is required.
- `VITE_API_TOKEN` is legacy and should not be committed to repository files.
- See `vite-react-performance` for bundle and code-splitting guidance.
