# My Npm Lens — Roadmap

PWA para visualizar métricas de tus dependencias NPM favoritas.

---

## Phase 1 — Project Scaffold

Setup base del proyecto con todas las tecnologías.

- [x] Inicializar proyecto con Vite 8 + React 19 + TypeScript
- [x] Configurar PWA (vite-plugin-pwa: manifest, service worker, icons)
- [x] Instalar y configurar dependencias principales:
  - `@tanstack/react-query`
  - `@tanstack/react-router` + `@tanstack/router-plugin` (file-based routing)
  - `@gnome-ui/core` `@gnome-ui/react` `@gnome-ui/icons`
  - `jest 30` + `@testing-library/react`
  - `typedoc`
- [x] Definir estructura de carpetas:
  ```
  src/
    routes/                        ← generación automática de rutas por archivo
      __root.tsx                   ← layout raíz (QueryClientProvider, Outlet)
      index.tsx                    ← ruta "/"  →  Dashboard
      package.$name.tsx            ← ruta "/package/:name"  →  PackageDetail
    pages/
      Dashboard/
      PackageDetail/
    components/
    modules/
      npm/
        hooks/
        proxy/
        domain/
        components/
      github/
        hooks/
        proxy/
        domain/
        components/
    store/                         ← localStorage adapter (raw) + react-query hooks
    main.tsx
  ```
- [x] Configurar `@tanstack/router-plugin` en `vite.config.ts`:
  - `routesDirectory: './src/routes'`
  - `generatedRouteTree: './src/routeTree.gen.ts'` (auto-generado, no editar)
- [x] El archivo `routeTree.gen.ts` se regenera en cada `vite dev` / `vite build`; añadirlo al `.gitignore` es opcional (muchos equipos lo commitean para trazabilidad)
- [x] Configurar `.gitignore` y `.npmignore`
- [x] `overrides.vite` en `package.json` para forzar Vite 8 en todos los plugins
- **Nota**: store de favoritos usa `favoritesStorage` (raw) + hooks `useQuery`/`useMutation` en `modules/npm/hooks` (Phase 2)

---

## Phase 2 — Store & Domain Layer

Persistencia local y modelos de dominio.

- [x] Definir tipos de dominio (`modules/npm/domain`):
  - `NpmPackage`, `NpmAuthor`, `NpmRepository`, `GitHubSlug`
  - `NpmDownloads`, `BundleSize`, `FavoritePackage`
  - `GitHubStats` en `modules/github/domain`
- [x] Implementar store en localStorage (`src/store/favorites.ts` — capa raw):
  - `favoritesStorage.getAll()`, `.add(name)`, `.remove(name)`
- [x] Hooks React Query sobre el store (`modules/npm/hooks/useFavorites.ts`):
  - `useFavorites()` → `useQuery` con `staleTime: Infinity`
  - `useAddFavorite()` / `useRemoveFavorite()` → `useMutation` + `invalidateQueries`
- [x] `parseNpmUrl(input)` — parsea URL de npmjs.com o nombre plano (scoped y unscoped)
- [x] 24 unit tests — `favoritesStorage` (store) y `parseNpmUrl` (dominio)

---

## Phase 3 — API Proxy Layer

Fetchers que consumen las APIs externas (`modules/*/proxy`).

- [x] **npm registry** → `fetchNpmPackage` — nombre, versión, descripción, autor, licencia, homepage, GitHub slug
- [x] **npm downloads** → `fetchNpmDownloads` — weekly + monthly en paralelo con `Promise.all`
- [x] **Bundlephobia** → `fetchBundleSize` — size, gzip, hasSideEffects
- [x] **GitHub API** → `fetchGitHubStats` — stars, forks, openIssues, lastPushedAt, htmlUrl
- [x] `ProxyError(service, status, message)` — error tipado compartido por todos los proxies
- [x] `fetchWithTimeout` — AbortController con 8s timeout, lanza `ProxyError` en timeout/network
- [x] 13 tests de proxy con `@jest-environment node` + `jest.spyOn(global, 'fetch')` (37 total)

---

## Phase 4 — React Query Hooks

Capa de hooks que conectan los proxies con los componentes (`modules/*/hooks`).

- [ ] `useNpmPackage(name)` → datos del registry
- [ ] `useNpmDownloads(name)` → descargas
- [ ] `useBundleSize(name)` → tamaño del bundle
- [ ] `useGithubStats(owner, repo)` → métricas GitHub
- [ ] Configurar `QueryClient` con stale time y cache apropiados

---

## Phase 5 — Dashboard Page

Pantalla principal con lista de favoritos.

- [ ] Toolbar: título "My Npm Lens" + botón "Add package"
- [ ] Estado vacío: ilustración/mensaje cuando no hay favoritos
- [ ] Modal/drawer "Add package":
  - Input para pegar URL de NPM
  - Validación de URL
  - Al confirmar: guardar en store y refrescar lista
- [ ] `PackageCard` component (resumen):
  - Nombre, versión, descripción corta
  - Descargas semanales
  - Tamaño gzipped
  - Stars de GitHub (si disponible)
  - Badge de licencia
- [ ] Click en card navega a `/package/:name`

---

## Phase 6 — Package Detail Page

Vista detallada de un paquete.

- [ ] Toolbar: botón "Back" (izquierda), sin botón "Add"
- [ ] Secciones:
  - **Info general**: nombre, versión, descripción, autor, licencia, homepage
  - **Descargas**: weekly, monthly (gráfico simple o badges)
  - **Bundle size**: minified + gzipped, breakdown por exports si disponible
  - **GitHub**: stars, forks, issues, último commit, link al repo
- [ ] Loading skeletons mientras cargan los datos
- [ ] Manejo de errores por sección

---

## Phase 7 — Polish & PWA

UX final y capacidades offline.

- [ ] Tema con `@gnome-ui/core` (light/dark si el sistema lo soporta)
- [ ] Responsive design (mobile-first)
- [ ] Service worker: cache de assets, estrategia offline para datos en caché
- [ ] Web App Manifest: nombre, iconos, theme color, display standalone
- [ ] Instalar como PWA en mobile/desktop

---

## Phase 8 — Testing & Docs

- [ ] Unit tests con Jest 30 + Testing Library:
  - Hooks de react-query (con `msw` para mocks)
  - Componentes clave (`PackageCard`, modal de agregar)
  - Funciones del store (localStorage)
- [ ] Configurar TypeDoc para generar documentación del dominio y proxies
- [ ] README con instrucciones de desarrollo y uso

---

## Phase 9 — CI/CD con GitHub Actions

Automatización de versiones, changelog y deploy.

- [ ] Workflow **CI**: lint + tests en cada PR
- [ ] Workflow **Release** (Semantic Release):
  - Conventional Commits → bump de versión automático
  - Generación de `CHANGELOG.md`
  - Publicación de release en GitHub
- [ ] Workflow **Deploy**:
  - Build de producción
  - Publicación en **GitHub Pages** (`gh-pages` branch)
  - Solo se dispara en merge a `main`

---

## Stack Summary

| Herramienta | Versión | Rol |
|---|---|---|
| Vite | 8.0.3 | Build tool |
| React | 19 | UI framework |
| TypeScript | latest | Tipado |
| @tanstack/react-query | latest | Server state |
| @tanstack/react-router | latest | Routing (file-based) |
| @tanstack/router-plugin | latest | Vite plugin → genera routeTree.gen.ts |
| @gnome-ui/* | latest | UI components |
| Jest | 30 | Testing |
| TypeDoc | latest | Documentación |
| vite-plugin-pwa | latest | PWA |
| Semantic Release | latest | Versionado |
| GitHub Actions | — | CI/CD |

---

_Iteramos fase por fase. Empezamos cuando digas._
