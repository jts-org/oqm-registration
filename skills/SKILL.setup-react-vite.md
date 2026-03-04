# SKILL: Setup React + Vite (web/)

## Preconditions
- Node 20.19+ or 22.12+ installed.

## Steps
1. Scaffold app:
   ```bash
   npm create vite@latest web
   # choose: React + TypeScript
   cd web && npm install
   ```
2. Create `.env.local` with:
   ```env
   VITE_GAS_BASE_URL=https://script.google.com/macros/s/.../exec
   VITE_API_TOKEN=replace-with-your-token
   ```
3. Verify run:
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```
