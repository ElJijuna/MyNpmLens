# ROADMAP: Layout con Sidebar

Migrar el layout actual (header + footer) a un layout tipo GNOME con sidebar de navegación,
usando los componentes `NavigationSplitView`, `Sidebar`, `SidebarSection` y `SidebarItem`
de `@gnome-ui/react`.

---

## Resultado esperado

```text
┌────────────────┬─────────────────────────────────────────┐
│  Sidebar       │  HeaderBar (solo sobre el contenido)    │
│                ├─────────────────────────────────────────┤
│  ● Home        │  Contenido de la ruta activa            │
│  ● Maintainers │                                         │
│  ● About       │  (Dashboard / Maintainers / About)      │
│                │                                         │
│  ─────────     │                                         │
│  [Avatar] User │  ← clickeable → /profile                │
│  © 2025 v1.x   │  (si no hay sesión, solo copyright)     │
│  [Search upd.] │                                         │
└────────────────┴─────────────────────────────────────────┘
```

El sidebar ocupa toda la altura izquierda y **empuja** el área de contenido (HeaderBar incluido).
El HeaderBar vive **dentro** del panel de contenido, no encima del layout completo.

**Mobile portrait (< 600 px):** el sidebar se convierte en overlay deslizante (`OverlaySplitView`)
con un botón hamburguesa en el HeaderBar para abrirlo/cerrarlo.

---

## Fase 1 — Estructura de rutas

Agregar dos rutas nuevas al árbol de TanStack Router:

| Ruta | Archivo | Página |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Dashboard (sin cambios) |
| `/maintainers` | `src/routes/maintainers.tsx` | Página Maintainers (stub inicial) |
| `/about` | `src/routes/about.tsx` | Página About (stub inicial) |
| `/profile` | `src/routes/profile.tsx` | Perfil de usuario + info del Gist |

**Tareas:**

- Crear `src/routes/maintainers.tsx` con componente `MaintainersPage` vacío
- Crear `src/routes/about.tsx` con componente `AboutPage` vacío
- Crear `src/routes/profile.tsx` con componente `ProfilePage` (requiere sesión activa)
- Regenerar `src/routeTree.gen.ts` (`npm run dev` lo hace automáticamente)

---

## Fase 2 — Componente `AppSidebar`

Crear `src/components/AppSidebar/index.tsx` usando los componentes de gnome-ui:

```tsx
import { Sidebar, SidebarSection, SidebarItem } from '@gnome-ui/react'
import { Home, People, Info } from '@gnome-ui/icons'   // ajustar nombres de íconos reales
import { useRouter, useMatchRoute } from '@tanstack/react-router'
import { useAppVersion } from '@/hooks/useAppVersion'   // ya existe en AppFooter
import { useCheckForUpdates } from '@/hooks/useCheckForUpdates'

export function AppSidebar() {
  const navigate = useRouter().navigate
  const matchRoute = useMatchRoute()

  return (
    <Sidebar>
      <SidebarSection>
        <SidebarItem
          label="Home"
          icon={Home}
          active={!!matchRoute({ to: '/' })}
          onClick={() => navigate({ to: '/' })}
        />
        <SidebarItem
          label="Maintainers"
          icon={People}
          active={!!matchRoute({ to: '/maintainers' })}
          onClick={() => navigate({ to: '/maintainers' })}
        />
        <SidebarItem
          label="About"
          icon={Info}
          active={!!matchRoute({ to: '/about' })}
          onClick={() => navigate({ to: '/about' })}
        />
      </SidebarSection>

      {/* Sección pegada abajo */}
      <div className="sidebar-footer">
        {user ? (
          /* Usuario autenticado: avatar + nombre, clickeable → /profile */
          <ActionRow
            leading={<Avatar src={user.photoURL} fallback={user.displayName} size="sm" />}
            title={user.displayName}
            subtitle={user.email}
            onClick={() => navigate({ to: '/profile' })}
          />
        ) : (
          /* Sin sesión: copyright estático */
          <Text variant="caption" color="dim">© 2025 Npm Lens · v{version}</Text>
        )}
        <Button variant="flat" size="sm" onClick={checkForUpdates}>
          Search updates
        </Button>
      </div>
    </Sidebar>
  )
}
```

**CSS para el footer del sidebar** (`AppSidebar/index.css`):

```css
/* El Sidebar de gnome-ui es un flex column — empujamos el footer al fondo */
.sidebar-footer {
  margin-top: auto;
  padding: var(--gnome-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--gnome-space-1);
  border-top: 1px solid var(--gnome-borders-color);
}
```

**Tareas:**

- Crear `src/components/AppSidebar/index.tsx`
- Crear `src/components/AppSidebar/index.css`
- Mover la lógica de versión y check-for-updates desde `AppFooter` a `AppSidebar`
- Identificar y usar los íconos correctos de `@gnome-ui/icons` para cada ítem

---

## Fase 3 — Nuevo layout raíz con `NavigationSplitView` / `OverlaySplitView`

El `Toolbar` (HeaderBar) se mueve **dentro del panel de contenido**, no sobre el layout entero.
El componente de split se elige según el ancho de pantalla usando `useBreakpoint`:

```tsx
import { NavigationSplitView, OverlaySplitView } from '@gnome-ui/react'
import { useBreakpoint } from '@gnome-ui/react'
import { AppSidebar } from '@/components/AppSidebar'

function RootLayout() {
  const isMobilePortrait = useBreakpoint('mobile')  // < 600 px
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebar = <AppSidebar />
  const content = (
    <>
      <Toolbar onMenuClick={() => setSidebarOpen(true)} />
      <Outlet />
    </>
  )

  if (isMobilePortrait) {
    return (
      <OverlaySplitView
        sidebar={sidebar}
        content={content}
        showSidebar={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    )
  }

  return (
    <NavigationSplitView
      sidebar={sidebar}
      content={content}
      showContent={true}
    />
  )
}
```

**Estructura visual resultante:**

```text
NavigationSplitView (desktop/tablet)
├── sidebar:  <AppSidebar />          ← altura completa, izquierda
└── content:  <Toolbar />             ← HeaderBar solo sobre el contenido
              <Outlet />

OverlaySplitView (mobile portrait)
├── sidebar:  <AppSidebar />          ← overlay deslizante desde la izquierda
└── content:  <Toolbar onMenuClick /> ← botón ☰ abre el sidebar
              <Outlet />
```

**Tareas:**

- Mover `<Toolbar />` del root al panel de contenido del split view
- Reemplazar el contenedor actual por `NavigationSplitView` / `OverlaySplitView` según breakpoint
- Pasar `onMenuClick` al `Toolbar` para que muestre el botón ☰ en mobile
- Eliminar `<AppFooter />` del root (su contenido ya vive en el sidebar)
- Verificar que `OfflineBanner` y los diálogos globales sigan renderizando correctamente

---

## Fase 4 — Adaptar el `Toolbar`

Con `NavigationSplitView`, el `HeaderBar` debe coexistir con el sidebar. Revisar:

- En pantallas anchas: el sidebar siempre visible, el `HeaderBar` solo muestra el título de la página activa y los botones de acción (Add, back…)
- En pantallas estrechas: agregar botón hamburguesa para abrir/cerrar el sidebar con `OverlaySplitView`

```tsx
// Toolbar.tsx — agregar prop para toggle del sidebar en mobile
<HeaderBar
  flat
  title={pageTitle}
  start={isNarrow ? <Button onClick={toggleSidebar}><Icon icon={SidebarShow} /></Button> : undefined}
  end={...acciones actuales}
/>
```

**Tareas:**

- Añadir estado `sidebarOpen` en `__root.tsx` (o un context ligero)
- Pasar toggle al `Toolbar` para pantallas estrechas
- Usar `OverlaySplitView` en lugar de `NavigationSplitView` cuando `isNarrow` sea `true` (hook `useBreakpoint` de gnome-ui)

---

## Fase 5 — Páginas `Maintainers` y `About`

Implementar el contenido real de las dos páginas nuevas.

### `MaintainersPage`

- Lista de paquetes favoritos agrupados por maintainer
- Fuente: campo `maintainers` usando `@api-hooks/npm` (ya instalado)
- Componentes: `SectionCard`, `Avatar` (foto del maintainer), `Text`, `Badge`

### `ProfilePage` (`/profile`)

Accesible solo con sesión activa (si el usuario no está logueado, redirigir a `/`).

Secciones:

- **Info del usuario**: avatar grande, nombre, email — datos de `useAuthUser()`
- **Estado del Gist**: ID del Gist vinculado, fecha del último sync, botón "Sync now" (llama `usePushToGist`)
- **Estadísticas**: número de paquetes favoritos sincronizados, último dispositivo que hizo push
- **Sesión**: botón "Sign out" (llama `useSignOut`)

Componentes: `Avatar`, `Card`, `Text`, `Badge`, `Button`, `SectionCard`

---

### `AboutPage`

- Información de la app: versión, descripción, links
- Componentes: `StatusPage` o layout manual con `Card`, `Text`, `Link`
- Links: repositorio en GitHub, reporte de bugs, changelog

---

## Fase 7 — Migración a `@api-hooks/gh` (GitHub Gist)

Eliminar el proxy layer de Gist y reemplazarlo con los hooks de la librería ya instalada.
La lógica de negocio (`useGistSync`, `usePushToGist`) se conserva; solo se elimina la capa proxy que hace `fetch` directo.

> **Prerequisito:** los hooks de `@api-hooks/gh` deben aceptar `token?: string` en sus opciones
> para que `GitHubClient` pueda autenticar las peticiones. El repositorio fuente está en
> `/api-hooks/packages/gh/src/hooks/`.

### Archivos a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/gist/proxy/gistClient.ts` | `GitHubClient({ token })` de `gh-api-client` vía hooks |
| `src/modules/gist/proxy/fetchUserGist.ts` | `useGhGist(gistId, { token })` de `@api-hooks/gh` |
| `src/modules/gist/proxy/findUserGist.ts` | `GitHubClient({ token }).listGists()` (imperativo en efecto) |
| `src/modules/gist/proxy/createUserGist.ts` | `useGhCreateGist({ token })` de `@api-hooks/gh` |
| `src/modules/gist/proxy/updateUserGist.ts` | `useGhUpdateGist(gistId, { token })` de `@api-hooks/gh` |
| `src/modules/gist/proxy/index.ts` | — |

### Hooks a actualizar

| Hook | Cambia de | A |
| --- | --- | --- |
| `usePushToGist.ts` | `createUserGist()` / `updateUserGist()` locales | `useGhCreateGist({ token })` / `useGhUpdateGist(gistId, { token })` |
| `useGistSync.ts` | `fetchUserGist()` / `findUserGist()` / `createUserGist()` locales | `useGhGist(gistId, { token })` + `GitHubClient({ token }).listGists()` para la búsqueda paginada |

### Notas de implementación

- `findUserGist` (búsqueda paginada) no tiene hook equivalente en `@api-hooks/gh`; se reemplaza
  con llamada imperativa a `new GitHubClient({ token }).listGists()` dentro del `useEffect` de `useGistSync`.
- El formato del fichero en Gist (`mynpmlens.json`) y el modelo de dominio `GistSync` no cambian.
- `GIST_FILENAME` puede moverse a `src/modules/gist/domain` o mantenerse como constante local.

---

## Fase 8 — Migración a `@api-hooks/osv`

Eliminar el proxy y hook local de OSV y reemplazarlos con la librería ya instalada.

### Archivos a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/osv/proxy/fetchOsvVulnerabilities.ts` | `useOsvQuery(params)` de `@api-hooks/osv` |
| `src/modules/osv/hooks/useOsvVulnerabilities.ts` | `useOsvQuery(params)` de `@api-hooks/osv` |

### Consumidores a actualizar

| Componente | Cambia de | A |
| --- | --- | --- |
| `VulnerabilitySection.tsx` | `useOsvVulnerabilities(name, version)` | `useOsvQuery({ package: { name, ecosystem: 'npm' }, version })` de `@api-hooks/osv` |
| `PackageDetailPage.test.tsx` | mock de `useOsvVulnerabilities` | mock de `useOsvQuery` |

### Notas de implementación

- `useOsvQuery` retorna `OsvQueryResult` (`{ vulns?: OsvVulnerability[] }`), no el array directo.
  `VulnerabilitySection` debe acceder a `data?.vulns ?? []`.
- El tipo `OsvVulnerability` de `osv-api-client` es compatible con la interfaz local actual;
  verificar que `database_specific.severity` y `database_specific.cwe_ids` sigan presentes.

---

## Fase 9 — Migración a `@api-hooks/bp` (Bundlephobia)

Eliminar el proxy y hook local de Bundlephobia y reemplazarlos con la librería ya instalada.

### Archivos a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/npm/proxy/fetchBundleSize.ts` | `useBpPackageSize(name)` de `@api-hooks/bp` |
| `src/modules/npm/hooks/useBundleSize.ts` | `useBpPackageSize(name)` de `@api-hooks/bp` |

### Consumidores a actualizar

| Componente | Cambia de | A |
| --- | --- | --- |
| `BundleSizeSection.tsx` | `useBundleSize` local | `useBpPackageSize` de `@api-hooks/bp` |
| `PackageCard/index.tsx` | `useBundleSize` local | `useBpPackageSize` de `@api-hooks/bp` |

> La `PackageDetail` page ya filtra la versión seleccionada — considerar usar
> `useBpPackageVersionSize(name, version)` en `BundleSizeSection` para mostrar el
> tamaño de la versión activa, no solo la latest.

### Hooks nuevos disponibles para ampliar `BundleSizeSection`

| Hook | Uso potencial |
| --- | --- |
| `useBpPackageVersionSize(name, version)` | Tamaño de la versión seleccionada en `PackageDetail` |
| `useBpPackageHistory(name)` | Gráfica de tamaño a lo largo del tiempo |
| `useBpPackageSimilar(name)` | Sección de paquetes alternativos |

---

## Fase 10 — Migración a `@api-hooks/npm`

Eliminar los proxies y hooks locales de npm y reemplazarlos con los hooks de la librería ya instalada.

### Archivos npm a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/npm/proxy/fetchNpmPackage.ts` | `useNpmPackage(name)` de `@api-hooks/npm` |
| `src/modules/npm/hooks/useNpmPackage.ts` | `useNpmPackage(name)` de `@api-hooks/npm` |
| `src/modules/npm/proxy/fetchNpmDownloads.ts` | `useNpmPackageDownloads(name, { period })` de `@api-hooks/npm` |
| `src/modules/npm/hooks/useNpmDownloads.ts` | `useNpmPackageDownloads(name, { period })` de `@api-hooks/npm` |

> `useNpmDownloads` actual hace dos fetches en paralelo (weekly + monthly).
> Con la librería se llama `useNpmPackageDownloads` dos veces, una por período.

### Consumidores npm a actualizar

| Componente | Cambia de | A |
| --- | --- | --- |
| `PackageInfoSection.tsx` | `useNpmPackage` local | `useNpmPackage` de `@api-hooks/npm` |
| `GitHubSection.tsx` | `useNpmPackage` local | `useNpmPackage` de `@api-hooks/npm` |
| `DownloadsSection.tsx` | `useNpmDownloads` local | `useNpmPackageDownloads` × 2 |
| `PackageCard/index.tsx` | ambos hooks locales | ambos hooks de librería |
| `PackageDetail/index.tsx` | `useNpmPackage` local | `useNpmPackage` de `@api-hooks/npm` |

### Servicios que NO se tocan (fuera del scope de `@api-hooks/npm`)

| Archivo | Motivo |
| --- | --- |
| `src/modules/npm/proxy/fetchBundleSize.ts` + hook | Bundlephobia — no cubierto por la librería |
| `src/modules/github/proxy/fetchGitHubStats.ts` + hook | GitHub API — usar `@api-hooks/gh` por separado |
| `src/modules/osv/proxy/fetchOsvVulnerabilities.ts` + hook | OSV API — no cubierto por la librería |
| `src/modules/gist/proxy/*` | GitHub Gist — no cubierto por la librería |

### Hooks nuevos para páginas futuras

| Hook | Uso previsto |
| --- | --- |
| `useNpmPackageMaintainers(name)` | `MaintainersPage` — maintainers por paquete |
| `useNpmMaintainer(username)` | `MaintainersPage` — perfil de cada maintainer |
| `useNpmMaintainerPackages(username)` | `MaintainersPage` — otros paquetes del maintainer |
| `useNpmSearch(text)` | Futura barra de búsqueda global |

---

## Convención: llamadas a APIs externas

Todas las peticiones a APIs externas **deben usar las librerías ya instaladas**,
nunca `fetch` directo a esos endpoints:

| API | Librería | Ejemplo de uso |
| --- | --- | --- |
| npm registry / downloads | `@api-hooks/npm` | `useNpmPackage(name)`, `useNpmPackageDownloads(name)` |
| Bundlephobia | `@api-hooks/bp` | `useBpPackageSize(name)`, `useBpPackageVersionSize(name, version)` |
| GitHub repos / releases | `@api-hooks/gh` | `useGhRepo(owner, repo)`, `useGhRepoReleases(...)` |
| GitHub Gist | `@api-hooks/gh` | `useGhGist(id, { token })`, `useGhCreateGist({ token })`, `useGhUpdateGist(id, { token })` |
| OSV vulnerabilities | `@api-hooks/osv` | `useOsvQuery({ package: { name, ecosystem }, version })` |

Esto aplica a todas las fases — tanto en las páginas nuevas (`MaintainersPage`, `AboutPage`)
como en cualquier ajuste a las páginas existentes (`Dashboard`, `PackageDetail`).

---

## Fase 6 — Limpieza

- Eliminar `src/components/AppFooter/` (ya no se usa)
- Actualizar `global.css` si hay estilos que asumían el layout antiguo
- Actualizar `src/components/Toolbar/index.tsx` para eliminar lógica ya no necesaria
- Smoke test visual en modo claro/oscuro y en mobile/desktop

---

## Orden de implementación

| # | Fase | Descripción | Archivos clave |
| --- | --- | --- | --- |
| 1 | Rutas | Crear rutas stub | `maintainers.tsx`, `about.tsx`, `profile.tsx` |
| 2 | AppSidebar | Sidebar con nav + footer (user info / copyright) | `AppSidebar/index.tsx` |
| 3 | Root layout | Integrar `NavigationSplitView` | `__root.tsx` |
| 4 | Toolbar | Toggle sidebar en mobile | `Toolbar/index.tsx` |
| 5 | ProfilePage | Info de usuario + estado del Gist | `pages/Profile` |
| 6 | Páginas | Contenido de Maintainers y About | `pages/Maintainers`, `pages/About` |
| 7 | Migración Gist | Eliminar proxy de Gist, usar `@api-hooks/gh` | `modules/gist/proxy/`, `hooks/usePushToGist`, `hooks/useGistSync` |
| 8 | Migración OSV | Eliminar proxy/hook de OSV, usar `@api-hooks/osv` | `modules/osv/`, `VulnerabilitySection.tsx` |
| 9 | Migración bp | Eliminar proxy/hook de Bundlephobia, usar `@api-hooks/bp` | `modules/npm/proxy/fetchBundleSize`, `hooks/useBundleSize` |
| 10 | Migración npm | Eliminar proxies/hooks locales de npm | `modules/npm/proxy`, `modules/npm/hooks` |
| 11 | Limpieza | Eliminar AppFooter, pulir estilos | `AppFooter/`, `global.css` |
