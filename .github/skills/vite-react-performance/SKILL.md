```markdown
---
name: vite-react-performance
description: React + Vite performance, architecture, and deployment best practices for the OQM Registration SPA.
---

# Vite React Performance & Best Practices

Authoritative performance and architecture model for the OQM React + Vite SPA.  
Complements `frontend`, `wire-react-to-gas`, `setup-react-vite`, and `deploy-ci`.

Copilot must apply this skill whenever generating or modifying React/Vite code.

---

## 1. Code Organization & Architecture

### 1.1 Feature-Based Colocation (Required)

Use feature-based structure:

```
web/src/
  features/
    admin/
    coach/
    trainee/
  components/
  lib/
  pages/
```

Rules:
- colocate components, hooks, and types inside each feature  
- avoid technology-based folders (`components/`, `hooks/` only)  
- keep shared UI in `components/`  

Benefits:
- discoverability  
- maintainability  
- scalable architecture  

---

## 2. Performance Optimization

### 2.1 Route-Level Code Splitting (Strict)

Copilot must use `React.lazy` for all page-level imports.

Correct:
```tsx
const HomePage = lazy(() => import('./pages/Home/HomePage'));
```

Apply to:
- TraineePage  
- CoachPage  
- AdminPage  
- ManualsPage  

Rules:
- never import page components eagerly  
- always wrap lazy routes in `<Suspense>`  

---

### 2.2 Server State Management (React Query Required)

Manual fetch + useState is prohibited for server state.

Correct:
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['coachSessions', token],
  queryFn: () => fetch(`${API_URL}?route=getCoachSessions&sessionToken=${token}`).then(r => r.json()),
  staleTime: 30000,
});
```

Benefits:
- caching  
- deduplication  
- background refetch  
- SWR behavior  
- avoids redundant network requests  

Rules:
- always use React Query for backend data  
- never manually fetch inside `useEffect` for server state  

---

### 2.3 Strategic Memoization

Copilot must:
- use `useMemo` for expensive calculations  
- use `useCallback` for stable handlers  
- avoid meaningless memoization  

Correct:
```tsx
const filtered = useMemo(() => sessions.filter(s => s.active), [sessions]);
```

Incorrect:
```tsx
const value = useMemo(() => 42, []);
```

Rules:
- memoize only when beneficial  
- avoid premature optimization  

---

### 2.4 Image Optimization

Correct:
```tsx
<Box component="img" src={okbLogo} sx={{ width: '100%', maxWidth: 260 }} />
<img src={avatar} width="64" height="64" loading="lazy" />
```

Rules:
- always specify width/height  
- always use `loading="lazy"` for non-critical images  
- never ship unbounded images  

---

## 3. Deployment & Build Configuration

### 3.1 Environment Variables (Strict)

Required:
```env
VITE_GAS_BASE_URL=https://script.google.com/macros/s/<YOUR_EXEC_ID>/exec
```

Rules:
- must use `VITE_` prefix  
- must not commit real tokens  
- must not embed GAS URL directly in code  

Type safety:
```ts
interface ImportMetaEnv {
  readonly VITE_GAS_BASE_URL: string;
}
```

---

### 3.2 SPA Routing Rewrites

GitHub Pages:
```yaml
echo '<!DOCTYPE html><html><head><script>
  sessionStorage.redirect = location.pathname;
  location.replace("/");
</script></head></html>' > dist/404.html
```

Rules:
- SPA rewrites mandatory  
- never generate server-side routing for GitHub Pages  

---

### 3.3 Caching Strategy

Entry:
```
Cache-Control: no-cache, no-store, must-revalidate
```

Assets:
```
Cache-Control: public, max-age=31536000, immutable
```

Rules:
- index.html must never be cached  
- hashed assets must be immutable  

---

### 3.4 Build Validation

Required:
```bash
npm run build
npm run preview
```

Rules:
- CI must never deploy unvalidated builds  
- Copilot must always include build validation steps  

---

## 4. Development Best Practices

### 4.1 Never Import from dist/

Incorrect:
```tsx
import { Button } from 'some-lib/dist/bundle.js';
```

Correct:
```tsx
import { Button } from 'some-lib';
```

Rules:
- never import built artifacts  
- always import source modules  

---

## 5. Troubleshooting

### 5.1 “Module is external”
Fix via:
```ts
optimizeDeps: { include: ['broken-lib/dist/utils'] }
```

### 5.2 HMR Issues
Causes:
- circular dependencies  
- export mismatch  
- case mismatch  

### 5.3 Missing Styles
Correct:
```tsx
import './styles.css';
```

### 5.4 404 on Refresh
Fix SPA rewrites.

---

## Performance Checklist

- [ ] Route-level code splitting  
- [ ] Image dimensions + lazy loading  
- [ ] No dist imports  
- [ ] VITE_ env vars  
- [ ] Build + preview  
- [ ] SPA rewrites  
- [ ] Bundle size check  
- [ ] Mobile viewport test  
- [ ] Theme tokens used  
- [ ] Memoization reviewed  

---

## Future Enhancements

1. React Query everywhere  
2. Bundle analyzer  
3. Modulepreload  
4. Service worker  
5. Image CDN  

---

## Summary

This skill provides production-ready patterns for:
- architecture  
- performance  
- deployment  
- troubleshooting  
- caching  
- code splitting  

Copilot must apply this skill whenever generating or modifying React + Vite code.

---

## Automatic References

Copilot must reference this skill when:
- generating React components or pages  
- refactoring for performance  
- adding/modifying routes  
- generating backend API calls  
- optimizing bundle size or load time  
- generating deployment/build config  
- reasoning about caching, lazy loading, or code splitting  
- generating troubleshooting steps  
- generating environment variable usage  

---

## Required Behavior

Copilot must:
- use `React.lazy` for page-level imports  
- avoid unnecessary imports  
- avoid dist imports  
- use memoization only when beneficial  
- optimize images  
- ensure SPA rewrites  
- ensure correct VITE_ env vars  
- prefer React Query over manual fetch  
- generate correct caching headers  
- avoid redundant network requests  

---

## Future Extensions

Performance rules may expand.  
Copilot must not assume fixed bundlers, caching layers, or optimization strategies.

```
