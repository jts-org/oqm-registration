---
name: frontend-performance
description: >
  Defines performance, optimization, lazy-loading, memoization, and bundle-size
  rules for the OQM React frontend. Copilot must use this skill whenever
  generating or modifying performance-sensitive code.
license: MIT
---

# Frontend Performance

This skill defines the **only valid** performance rules for the OQM frontend.

---

# 1. Lazy Loading

Copilot must:

- lazy-load heavy components  
- lazy-load routes  
- use dynamic imports  

---

# 2. Memoization

Copilot must:

- use React.memo  
- use useMemo  
- use useCallback  
- avoid unnecessary re-renders  

---

# 3. Bundle Size

Copilot must:

- avoid large dependencies  
- avoid duplicating libraries  
- split code where appropriate  

---

# 4. Images

Copilot must:

- use responsive images  
- optimize image sizes  
- avoid uncompressed assets  

---

# 5. React Query

Copilot must:

- use caching  
- avoid unnecessary refetches  
- use staleTime and cacheTime appropriately  

---

# 6. Required Behavior for Copilot

Copilot must:

- always optimize heavy components  
- always use lazy loading  
- always use memoization  
- never introduce performance regressions  

---

# 7. Interaction With Other Skills

- **frontend-responsive-design** — responsive loading  
- **frontend-ux-and-accessibility** — smooth interactions  
- **frontend-api-client** — efficient API usage  

---

# 8. Future Extensions

Performance rules may expand.
