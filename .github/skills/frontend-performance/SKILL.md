```markdown
---
name: frontend-performance
description: Performance, optimization, lazy-loading, memoization, and bundle-size rules for the OQM React frontend. Copilot must apply this skill whenever generating or modifying performance-sensitive code.
license: MIT
---

# Frontend Performance

Authoritative performance model for the OQM React frontend.  
Mandate-first rules for lazy loading, memoization, bundle size, images, React Query, and integration with other frontend skills.

---

## 1. Lazy Loading

Copilot must:
- lazy-load heavy components  
- lazy-load routes  
- use dynamic imports (`import()` + `React.lazy`)  
- avoid loading non-critical code on initial render  

Rules:
- lazy loading is mandatory for large components and routes  
- never bundle heavy modules into the initial load  

---

## 2. Memoization

Copilot must:
- use `React.memo` for pure components  
- use `useMemo` for expensive calculations  
- use `useCallback` for stable function references  
- avoid unnecessary re-renders  

Rules:
- memoization must be applied when props or dependencies are stable  
- never wrap everything blindly — only where re-render cost matters  

---

## 3. Bundle Size

Copilot must:
- avoid large dependencies  
- avoid duplicate libraries  
- split code where appropriate  
- prefer native APIs over heavy utility libraries  

Rules:
- always consider bundle impact before adding dependencies  
- never introduce libraries that duplicate existing functionality  

---

## 4. Images

Copilot must:
- use responsive images  
- optimize image sizes  
- avoid uncompressed assets  
- prefer modern formats when supported (e.g., WebP)  

Rules:
- never ship oversized or unoptimized images  
- never inline large images directly in components  

---

## 5. React Query

Copilot must:
- use caching  
- avoid unnecessary refetches  
- set `staleTime` and `cacheTime` appropriately  
- use query keys consistently  
- avoid re-running queries on every render  

Rules:
- React Query must be configured for stable caching  
- never fetch repeatedly without need  

---

## 6. Required Behavior for Copilot

Copilot must:
- always optimize heavy components  
- always use lazy loading  
- always use memoization  
- always consider bundle size impact  
- never introduce performance regressions  
- never add unnecessary re-renders or refetches  

---

## 7. Interaction With Other Skills

- **frontend-responsive-design** — responsive loading + image behavior  
- **frontend-ux-and-accessibility** — smooth interactions, no jank  
- **frontend-api-client** — efficient API usage and caching  

---

## 8. Future Extensions

Performance rules may expand.  
Copilot must not assume fixed optimization techniques or libraries.
```
