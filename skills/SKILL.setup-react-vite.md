# SKILL: Setup React + Vite (web/)

## Preconditions
- Node 24.12.0 installed.

## Steps
1. Install MUI library
   ```
   npm install @mui/material @emotion/react @emotion/styled
   ```

2. Scaffold app:
   ```bash
   npm create vite@latest web
   # choose: React + TypeScript
   cd web && npm install
   ```
3. Create `.env.local` with:
   ```env
   VITE_GAS_BASE_URL=https://script.google.com/macros/s/.../exec
   VITE_API_TOKEN=replace-with-your-token
   ```
4. Verify run:
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```