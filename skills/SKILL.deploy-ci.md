# SKILL: CI & GH Pages Deploy

## CI
- Node setup → install → build → (tests when present).

## GH Pages
- Workflow `deploy-pages.yml` sets `VITE_BASE` automatically to `/<repo>/` and uploads `web/dist`.
- SPA fallback: copies `index.html` to `404.html`.
