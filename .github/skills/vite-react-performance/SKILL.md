---
  name: vite-react-performance
  description: React + Vite performance, architecture, and deployment best practices for the OQM Registration SPA.
---

# Vite React Performance & Best Practices

Performance and architecture guidelines for the OQM Registration React + Vite SPA. These practices complement `frontend.instructions.md` and other skills with production-ready patterns.

## When to Apply

Reference these guidelines when:
- Setting up new features or refactoring existing ones
- Optimizing bundle size and initial load time
- Configuring deployment pipelines
- Troubleshooting production build or caching issues
- Reviewing code for performance improvements

## Related Skills

- **frontend** - MUI, mobile-first, dialogs, localization (primary UI guidelines)
- **wire-react-to-gas** - API contracts and authentication
- **setup-react-vite** - Initial project setup
- **deploy-ci** - CI/CD pipeline configuration

---

## 1. Code Organization & Architecture

### 1.1 Feature-Based Colocation

**Current Status:** ✅ Already implemented in `web/src/features/`

Organize code by **Feature**, not by **Technology**. The OQM Registration app follows this pattern:

```txt
web/src/
  features/
    admin/
      components/
      hooks/
      types.ts
    coach/
      components/
      hooks/
      types.ts
    trainee/
      components/
      hooks/
      types.ts
  components/
  lib/
  pages/
```

**Why it matters:**
- Discoverability
- Maintainability
- Scalability

**Avoid:**
```txt
components/
  AdminDashboard.tsx
  CoachLogin.tsx
  TraineeTable.tsx
hooks/
  useAdmin.ts
  useCoach.ts
  useTrainee.ts
```

**Prefer:**
```txt
features/
  admin/components/AdminDashboard.tsx
  coach/components/CoachLogin.tsx
components/Button.tsx
```

---

## 2. Performance Optimization

### 2.1 Route-Level Code Splitting

**Current Status:** ⚠️ Partially implemented

Incorrect:
```tsx
import HomePage from './pages/Home/HomePage';
import TraineePage from './pages/Trainee/TraineePage';
import CoachPage from './pages/Coach/CoachPage';
import AdminPage from './pages/Admin/AdminPage';
```

Correct:
```tsx
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const TraineePage = lazy(() => import('./pages/Trainee/TraineePage'));
const CoachPage = lazy(() => import('./pages/Coach/CoachPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
```

Apply to:
- TraineePage  
- CoachPage  
- AdminPage  
- ManualsPage  

---

### 2.2 Server State Management

**Current Status:** ⚠️ Manual fetch + useState

Manual:
```tsx
function CoachSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`\${API_URL}?route=getCoachSessions&sessionToken=\${token}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      });
  }, [token]);
}
```

React Query:
```tsx
const { data: sessions, isLoading, error } = useQuery({
  queryKey: ['coachSessions', token],
  queryFn: () => fetch(`\${API_URL}?route=getCoachSessions&sessionToken=\${token}`).then(r => r.json()),
  staleTime: 30000,
});
```

Benefits:
- Caching  
- Deduplication  
- Background refetch  
- SWR behavior  

---

### 2.3 Strategic Memoization

Incorrect:
```tsx
const value = useMemo(() => 42, []);
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => console.log('clicked'), []);
```

Correct:
```tsx
const params = useMemo(() => ({ userId, filters }), [userId, filters]);
const filteredSessions = useMemo(() => sessions.filter(s => s.active), [sessions]);
const handleChange = useCallback(v => setValue(v), []);
```

---

### 2.4 Image Optimization

Incorrect:
```tsx
<img src={okbLogo} alt="OKB Logo" />
```

Correct:
```tsx
<Box component="img" src={okbLogo} sx={{ width: '100%', maxWidth: 260, height: 'auto' }} />
<img src={avatar} width="64" height="64" loading="lazy" />
```

---

## 3. Deployment & Build Configuration

### 3.1 Environment Variables Security

Correct:
```env
VITE_GAS_BASE_URL=https://...
VITE_API_TOKEN=...
```

Type safety:
```ts
interface ImportMetaEnv {
  readonly VITE_GAS_BASE_URL: string;
  readonly VITE_API_TOKEN?: string;
}
```

---

### 3.2 SPA Routing Rewrites

GitHub Pages:
```yaml
- name: Setup GitHub Pages redirects
  run: |
    echo '<!DOCTYPE html><html><head><script>
      sessionStorage.redirect = location.pathname;
      location.replace("/");
    </script></head></html>' > dist/404.html
```

Netlify:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Nginx:
```nginx
try_files $uri $uri/ /index.html;
```

---

### 3.3 Caching Strategy

Entry:
```http
Cache-Control: no-cache, no-store, must-revalidate
```

Assets:
```http
Cache-Control: public, max-age=31536000, immutable
```

---

### 3.4 Build Validation

Correct workflow:
```bash
npm run build
npm run preview
git commit && git push
```

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

---

## 5. Troubleshooting

### 5.1 Module is external

```ts
optimizeDeps: { include: ['broken-lib/dist/utils'] }
```

### 5.2 HMR Not Working

Causes:
- Circular deps  
- Export mismatch  
- Case mismatch  

### 5.3 Styles Missing

Correct:
```tsx
import './styles.css';
```

Incorrect:
```tsx
await import('./styles.css');
```

### 5.4 404 on Refresh

Fix SPA rewrites.

---

## Performance Checklist

- [ ] Code splitting  
- [ ] Image dimensions  
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

1. React Query  
2. Bundle analyzer  
3. Modulepreload  
4. Service worker  
5. Image CDN  

---

## Summary

This skill provides production-ready patterns for:
- Code organization  
- Performance optimization  
- Deployment configuration  
- Development workflow  
- Troubleshooting  

Always reference `frontend` for UI/UX requirements.

---

## Automatic References

Copilot must automatically apply this performance and architecture guidance
whenever generating or modifying React + Vite code in the OQM Registration SPA.

### When to Apply This Skill

Copilot must reference this skill when:

- generating new React components or pages
- refactoring existing components for performance
- adding new routes or modifying routing structure
- generating code that loads data from the backend
- optimizing bundle size or initial load time
- generating deployment or build configuration
- reasoning about caching, code splitting, or lazy loading
- generating troubleshooting steps for Vite or React builds
- generating environment variable usage or type definitions

### How This Skill Interacts With Other Skills

- **frontend**  
  Provides UI/UX, MUI, layout, and interaction patterns.  
  vite-react-performance ensures that UI code is efficient, split correctly,
  and avoids unnecessary re-renders.

- **wire-react-to-gas**  
  Ensures that API calls are structured correctly and do not block rendering.
  vite-react-performance ensures that API calls use proper caching (e.g. React Query)
  and do not cause redundant network requests.

- **auth-flow**  
  Ensures that authentication flows are implemented correctly.  
  vite-react-performance ensures that login pages and session-handling logic
  do not cause unnecessary re-renders or bundle bloat.

- **security-secrets**  
  Ensures that environment variables and API endpoints are handled securely.
  vite-react-performance ensures that environment variables are used efficiently
  and not bundled incorrectly.

### Required Behavior

When Copilot generates React or Vite code:

- It must prefer route-level code splitting using `React.lazy`.
- It must avoid unnecessary imports that increase bundle size.
- It must avoid importing from `dist/` folders.
- It must use memoization (`useMemo`, `useCallback`) only when beneficial.
- It must use proper image optimization patterns.
- It must ensure SPA routing rewrites are correct for the deployment target.
- It must ensure environment variables use the `VITE_` prefix.
- It must avoid manual fetch + useState for server state and prefer React Query.
- It must generate caching headers and immutable asset strategies when relevant.

### Future Extensions

This skill describes the current performance and architecture model. Copilot must
not assume that tools, libraries, or optimization strategies are fixed. New
bundlers, caching layers, or performance techniques may be added without breaking
this skill.

---