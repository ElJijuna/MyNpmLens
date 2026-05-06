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
│  ● About       │  (Dashboard / Maintainers / About /     │
│  ● Settings    │   Settings / Profile)                   │
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
| `/maintainers` | `src/routes/maintainers.tsx` | Lista de maintainers seguidos + botón Add |
| `/maintainers/$username` | `src/routes/maintainers.$username.tsx` | `MaintainerPage` — detalle de maintainer + paquetes + Unfollow |
| `/about` | `src/routes/about.tsx` | Página About (stub inicial) |
| `/profile` | `src/routes/profile.tsx` | Perfil de usuario + info del Gist |
| `/settings` | `src/routes/settings.tsx` | Preferencias de la app — guardadas en Gist |

**Tareas:**

- Crear `src/routes/maintainers.tsx` con componente `MaintainersPage` vacío
- Crear `src/routes/maintainers.$username.tsx` con componente `MaintainerPage` vacío
- Crear `src/routes/about.tsx` con componente `AboutPage` vacío
- Crear `src/routes/profile.tsx` con componente `ProfilePage` (requiere sesión activa)
- Crear `src/routes/settings.tsx` con componente `SettingsPage` vacío
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
        <SidebarItem
          label="Settings"
          icon={Settings}
          active={!!matchRoute({ to: '/settings' })}
          onClick={() => navigate({ to: '/settings' })}
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

- En pantallas anchas: el sidebar siempre visible, el `HeaderBar` muestra `PathBar` para navegación
  y los botones de acción (Add, back…)
- En pantallas estrechas: agregar botón hamburguesa para abrir/cerrar el sidebar con `OverlaySplitView`

### `PathBar` para navegación contextual

Usar `PathBar` de `@gnome-ui/react` dentro del `HeaderBar` para mostrar la ubicación actual
y permitir navegar hacia atrás clickeando segmentos anteriores.

```tsx
import { PathBar } from '@gnome-ui/react'

// Toolbar.tsx — PathBar en lugar de title estático
<HeaderBar
  flat
  title={<PathBar segments={segments} onNavigate={(path) => navigate({ to: path })} />}
  start={isNarrow ? <Button onClick={toggleSidebar}><Icon icon={SidebarShow} /></Button> : undefined}
  end={...acciones actuales}
/>
```

#### Segmentos por ruta

| Ruta | Segmentos |
| --- | --- |
| `/` | `Home` (no-interactivo) |
| `/maintainers` | `Home → Maintainers` |
| `/maintainers/$username` | `Home → Maintainers → {username}` |
| `/profile` | `Home → Profile` |
| `/settings` | `Home → Settings` |
| `/about` | `Home → About` |
| `PackageDetail` | `Home → {packageName}` |

El hook `usePathSegments()` en `src/hooks/` construye el array de segmentos leyendo
`useRouterState()` de TanStack Router y devuelve `PathBarSegment[]` listo para usar.

**Tareas:**

- Añadir estado `sidebarOpen` en `__root.tsx` (o un context ligero)
- Pasar toggle al `Toolbar` para pantallas estrechas
- Usar `OverlaySplitView` en lugar de `NavigationSplitView` cuando `isNarrow` sea `true` (hook `useBreakpoint` de gnome-ui)
- Crear `src/hooks/usePathSegments.ts` que mapea la ruta activa a `PathBarSegment[]`
- Reemplazar el `title` estático del `HeaderBar` por `<PathBar>` con los segmentos

---

## Fase 5 — Páginas `Maintainers` y `About`

Implementar el contenido real de las dos páginas nuevas.

### `MaintainersPage` (`/maintainers`)

Dashboard agradable de maintainers seguidos, construido con componentes de `@gnome-ui/layout`.

#### Botón "Add maintainer" + Dialog

- Botón prominente en la página (ej. `+ Add maintainer`).
- Abre un `Dialog` de `@gnome-ui/react` con un `TextField` para escribir el username de npm
  (ej. `pilmee`).
- Al confirmar: valida que el maintainer existe vía `useNpmMaintainer(username)` de
  `@api-hooks/npm`, agrega al listado y empuja al Gist.
- Si el maintainer ya está en la lista muestra error inline.

#### Layout del dashboard

```text
┌──────────────────────────────────────────────────┐
│  PanelCard  "Maintainers"   [+ Add maintainer]   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ UserCard │ │ UserCard │ │ UserCard │  …        │
│  │ pilmee   │ │ sindresor│ │ tj       │           │
│  └──────────┘ └──────────┘ └──────────┘          │
└──────────────────────────────────────────────────┘
```

- Envolver la lista en un `PanelCard` (`@gnome-ui/layout`) con:
  - `title="Following"`, `icon` opcional, `collapsible={false}`
  - `headerActions`: botón `+ Add maintainer`
- Cada maintainer: `UserCard` con `name=username`, `email` (si lo devuelve la API),
  `avatarSrc` — el card completo es clickeable y navega a `/maintainers/$username`.

---

### `MaintainerPage` (`/maintainers/$username`)

Dashboard de detalle construido con componentes de `@gnome-ui/layout`.

#### Layout del detalle

```text
┌──────────────────────────────────────────────────┐
│  UserCard  (lg)  username · email                │
│            [Unfollow ↓ al final de la página]    │
├──────────────────────────────────────────────────┤
│  CounterCard  "Packages"  value={totalPackages}  │
├──────────────────────────────────────────────────┤
│  PanelCard  "Published packages"                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Package  │ │ Package  │ │ Package  │  …        │
│  │   Card   │ │   Card   │ │   Card   │           │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                      [Unfollow]  │
└──────────────────────────────────────────────────┘
```

- **`UserCard`** (`@gnome-ui/layout`, `avatarSize="lg"`): muestra username, email,
  datos de `useNpmMaintainer(username)`.  Las `actions` del `UserCard` **no** incluyen
  "Unfollow" aquí — el botón destructivo va al pie de la página.
- **`CounterCard`** (`@gnome-ui/layout`, `accent`): número total de paquetes publicados,
  animado al cargar.
- **`PanelCard`** (`@gnome-ui/layout`) con `title="Published packages"`:
  - Body: grid de `PackageCard` (el mismo componente que usa el Dashboard).
  - Cada `PackageCard` es clickeable → navega a `PackageDetail`.
  - `footerActions`: botón `Unfollow` (`variant="destructive"`) — llama
    `useRemoveMaintainer(username)`, actualiza Gist y regresa a `/maintainers`.

---

#### Cambios de dominio requeridos

**1. Nuevo tipo en `src/modules/npm/domain`:**

```ts
export interface FollowedMaintainer {
  username: string
}
```

**2. Ampliar `GistSync` en `src/modules/gist/domain/GistSync.ts`:**

```ts
export interface GistSync {
  gistId: string
  favorites: FavoritePackage[]
  maintainers: FollowedMaintainer[]   // ← nuevo campo
  updatedAt: string
}
```

**3. Nuevo storage en `src/store/maintainers.ts`** (análogo a `favoritesStorage`):

- `getAll(): FollowedMaintainer[]`
- `add(username: string): void`
- `remove(username: string): void`
- `replace(items: FollowedMaintainer[]): void`

**4. Nuevos hooks en `src/modules/npm/hooks/`:**

| Hook | Responsabilidad |
| --- | --- |
| `useMaintainers()` | Lee `maintainersStorage`, `staleTime: Infinity` |
| `useAddMaintainer()` | Agrega al storage, invalida query, llama `usePushToGist` |
| `useRemoveMaintainer()` | Elimina del storage, invalida query, llama `usePushToGist` |

**5. Actualizar `usePushToGist` y `useGistSync`** para incluir `maintainers` junto a
`favorites` al serializar/deserializar el contenido del Gist.

### `ProfilePage` (`/profile`)

Accesible solo con sesión activa (si el usuario no está logueado, redirigir a `/`).

Secciones:

- **Info del usuario**: avatar grande, nombre, email — datos de `useAuthUser()`
- **Estado del Gist**: ID del Gist vinculado, fecha del último sync, botón "Sync now" (llama `usePushToGist`)
- **Estadísticas**: número de paquetes favoritos sincronizados, último dispositivo que hizo push
- **Sesión**: botón "Sign out" (llama `useSignOut`)

Componentes: `Avatar`, `Card`, `Text`, `Badge`, `Button`, `SectionCard`

---

### `SettingsPage` (`/settings`)

Página de preferencias de la app construida con los componentes de preferencias de `@gnome-ui/react`.
Los ajustes se sincronizan al Gist bajo la clave `settings` y se persisten localmente
a través de `persistQueryClient` + IndexedDB (Fase 12).

#### Layout

El componente raíz de la ruta es `PreferencesPage` de `@gnome-ui/react`,
con grupos de ajustes construidos con `PreferencesGroup`, `BoxedList` y `ComboRow`.

```tsx
import { PreferencesPage, PreferencesGroup, ComboRow, BoxedList } from '@gnome-ui/react'

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()

  return (
    <PreferencesPage title="Settings">
      <PreferencesGroup title="Appearance">
        <BoxedList>
          <ComboRow
            title="Theme"
            subtitle="Choose the color scheme"
            options={[
              { value: 'system', label: 'System default' },
              { value: 'light',  label: 'Light' },
              { value: 'dark',   label: 'Dark' },
            ]}
            value={settings.theme}
            onValueChange={(theme) => updateSettings({ theme })}
          />
        </BoxedList>
      </PreferencesGroup>

      <PreferencesGroup title="Language">
        <BoxedList>
          <ComboRow
            title="Language"
            options={[{ value: 'en', label: 'English' }]}
            value="en"
            disabled
          />
        </BoxedList>
      </PreferencesGroup>
    </PreferencesPage>
  )
}
```

#### Modelo de datos

```ts
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'en'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
}
```

#### Aplicar el tema

Al cambiar `theme`, escribir `data-theme="light|dark"` en `<html>` (o leer
`prefers-color-scheme` cuando es `'system'`). Extraer esta lógica en un hook
`useApplyTheme()` que se monta en el root layout.

#### Cambios de dominio — Settings

**1. Ampliar `GistSync`:**

```ts
export interface GistSync {
  gistId: string
  favorites: FavoritePackage[]
  maintainers: FollowedMaintainer[]
  settings: AppSettings            // ← nuevo campo
  updatedAt: string
}
```

**2. Nuevo hook `useSettings()`** en `src/modules/app/hooks/`:

- Query con `staleTime: Infinity` — la persistencia la gestiona `persistQueryClient` + IndexedDB.
- `updateSettings(partial)` — merge parcial, invalida query, llama `usePushToGist`.

**3. Actualizar `usePushToGist` y `useGistSync`** para incluir `settings` en el payload del Gist.

#### Idioma

Solo `'en'` disponible — el `ComboRow` de idioma se muestra como informativo (`disabled`).
Toda la app debe estar en inglés. No añadir ningún sistema de i18n.

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
| `src/modules/gist/proxy/findUserGist.ts` | `GitHubClient({ token }).listGists()` — filtrar por `GIST_FILENAME` en la primera página, sin paginación completa |
| `src/modules/gist/proxy/createUserGist.ts` | `useGhCreateGist({ token })` de `@api-hooks/gh` |
| `src/modules/gist/proxy/updateUserGist.ts` | `useGhUpdateGist(gistId, { token })` de `@api-hooks/gh` |
| `src/modules/gist/proxy/index.ts` | — |

### Hooks a actualizar

| Hook | Cambia de | A |
| --- | --- | --- |
| `usePushToGist.ts` | `createUserGist()` / `updateUserGist()` locales | `useGhCreateGist({ token })` / `useGhUpdateGist(gistId, { token })` |
| `useGistSync.ts` | `fetchUserGist()` / `findUserGist()` / `createUserGist()` locales | `useGhGist(gistId, { token })` + `GitHubClient({ token }).listGists()` filtrando por `GIST_FILENAME` (sin paginar) |

### Notas de implementación

- `findUserGist` no tiene hook equivalente en `@api-hooks/gh`; se reemplaza con llamada imperativa
  a `new GitHubClient({ token }).listGists()` dentro del `useEffect` de `useGistSync`.
  Dado que `GIST_FILENAME = 'mynpmlens.json'` es conocido, basta con filtrar la primera página
  de resultados buscando el gist cuyas `files` contengan esa clave — no es necesario paginar
  todos los gists del usuario.
- El formato del fichero en Gist (`mynpmlens.json`) y el modelo de dominio `GistSync` no cambian.
- `GIST_FILENAME` puede moverse a `src/modules/gist/domain` o mantenerse como constante local.

---

## Fase 8 — Migración a `@api-hooks/osv`

Eliminar el proxy y hook local de OSV y reemplazarlos con la librería ya instalada.

### Archivos OSV a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/osv/proxy/fetchOsvVulnerabilities.ts` | `useOsvQuery(params)` de `@api-hooks/osv` |
| `src/modules/osv/hooks/useOsvVulnerabilities.ts` | `useOsvQuery(params)` de `@api-hooks/osv` |

### Consumidores OSV a actualizar

| Componente | Cambia de | A |
| --- | --- | --- |
| `VulnerabilitySection.tsx` | `useOsvVulnerabilities(name, version)` | `useOsvQuery({ package: { name, ecosystem: 'npm' }, version })` de `@api-hooks/osv` |
| `PackageDetailPage.test.tsx` | mock de `useOsvVulnerabilities` | mock de `useOsvQuery` |

### Notas OSV

- `useOsvQuery` retorna `OsvQueryResult` (`{ vulns?: OsvVulnerability[] }`), no el array directo.
  `VulnerabilitySection` debe acceder a `data?.vulns ?? []`.
- El tipo `OsvVulnerability` de `osv-api-client` es compatible con la interfaz local actual;
  verificar que `database_specific.severity` y `database_specific.cwe_ids` sigan presentes.

---

## Fase 9 — Migración a `@api-hooks/bp` (Bundlephobia)

Eliminar el proxy y hook local de Bundlephobia y reemplazarlos con la librería ya instalada.

### Archivos bp a eliminar

| Archivo | Reemplazado por |
| --- | --- |
| `src/modules/npm/proxy/fetchBundleSize.ts` | `useBpPackageSize(name)` de `@api-hooks/bp` |
| `src/modules/npm/hooks/useBundleSize.ts` | `useBpPackageSize(name)` de `@api-hooks/bp` |

### Consumidores bp a actualizar

| Componente | Cambia de | A |
| --- | --- | --- |
| `BundleSizeSection.tsx` | `useBundleSize` local | `useBpPackageSize` de `@api-hooks/bp` |
| `PackageCard/index.tsx` | `useBundleSize` local | `useBpPackageSize` de `@api-hooks/bp` |

> La `PackageDetail` page ya filtra la versión seleccionada — considerar usar
> `useBpPackageVersionSize(name, version)` en `BundleSizeSection` para mostrar el
> tamaño de la versión activa, no solo la latest.

### Hooks bp nuevos disponibles para ampliar `BundleSizeSection`

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

## Fase 11 — Autocompletado async en `AddPackageModal`

Reemplazar el `TextField` actual del dialog por un componente de búsqueda con autocompletado
async de `@gnome-ui/react`, alimentado por `useNpmSearch(text)` de `@api-hooks/npm`.

### Cambios en `src/components/AddPackageModal/index.tsx`

- Sustituir `<TextField>` por el componente de autocompletado de `@gnome-ui/react`
  (verificar nombre exacto: `Autocomplete`, `SearchEntry`, o equivalente).
- La búsqueda se dispara de forma async con debounce mientras el usuario escribe.
- Cada sugerencia muestra el nombre del paquete; al seleccionar uno se rellena el campo.
- La validación actual (existencia en npm, duplicados en favoritos) se mantiene igual.
- El hook `useNpmSearch(text)` ya está listado en Fase 10 como hook disponible en `@api-hooks/npm`.

### Prerequisito

- Fase 10 completada (migración a `@api-hooks/npm`) para que `useNpmSearch` esté disponible.

---

## Fase 12 — Persistencia del QueryClient con IndexedDB

Configurar `persistQueryClient` para que el caché de TanStack Query sobreviva recargas de página,
usando IndexedDB como storage a través de los paquetes oficiales de TanStack.

### No hay paquete oficial de IndexedDB dedicado

`@tanstack/query-indexeddb-persister` **no existe** en npm. La solución oficial para storage
asíncrono es:

- `@tanstack/react-query-persist-client` — wrapper de `PersistQueryClientProvider`
- `@tanstack/query-async-storage-persister` — persister que acepta cualquier `AsyncStorage`

`idb` v7 **ya está instalado** como dependencia transitiva de Firebase — se usa como driver
sin instalar nada extra.

### Paquetes a instalar

```bash
npm install @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
```

### Implementación en `src/main.tsx` (o donde viva el `QueryClientProvider`)

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { openDB } from 'idb'

const db = await openDB('mynpmlens', 1, {
  upgrade(db) { db.createObjectStore('query-cache') },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => db.get('query-cache', key),
    setItem: (key, value) => db.put('query-cache', value, key),
    removeItem: (key) => db.delete('query-cache', key),
  },
})

// Reemplazar <QueryClientProvider> por:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: asyncStoragePersister }}
>
  ...
</PersistQueryClientProvider>
```

### Qué se persiste y qué no

- Solo persisten queries con `staleTime > 0` (las que no son "siempre stale").
- Queries sensibles (datos de usuario, auth) deben excluirse con `queryClient.setQueryDefaults`
  o filtrando por `queryKey` en `dehydrate`.
- El Gist sync (`useGistSync`) **no debe persistirse** — siempre debe refetchear al iniciar.

### Archivos a tocar

| Archivo | Cambio |
| --- | --- |
| `src/main.tsx` (o equivalente) | Reemplazar `QueryClientProvider` por `PersistQueryClientProvider` |
| `src/lib/queryClient.ts` (o donde se cree el cliente) | Ajustar `staleTime` por defecto y exclusiones |

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
| 1 | Rutas | Crear rutas stub | `maintainers.tsx`, `about.tsx`, `profile.tsx`, `settings.tsx` |
| 2 | AppSidebar | Sidebar con nav + footer (user info / copyright) | `AppSidebar/index.tsx` |
| 3 | Root layout | Integrar `NavigationSplitView` | `__root.tsx` |
| 4 | Toolbar | Toggle sidebar en mobile | `Toolbar/index.tsx` |
| 5 | ProfilePage | Info de usuario + estado del Gist | `pages/Profile` |
| 6 | Páginas | Contenido de Maintainers, About y Settings | `pages/Maintainers`, `pages/About`, `pages/Settings` |
| 7 | Migración Gist | Eliminar proxy de Gist, usar `@api-hooks/gh` | `modules/gist/proxy/`, `hooks/usePushToGist`, `hooks/useGistSync` |
| 8 | Migración OSV | Eliminar proxy/hook de OSV, usar `@api-hooks/osv` | `modules/osv/`, `VulnerabilitySection.tsx` |
| 9 | Migración bp | Eliminar proxy/hook de Bundlephobia, usar `@api-hooks/bp` | `modules/npm/proxy/fetchBundleSize`, `hooks/useBundleSize` |
| 10 | Migración npm | Eliminar proxies/hooks locales de npm | `modules/npm/proxy`, `modules/npm/hooks` |
| 11 | Autocompletado | Searchbar async en `AddPackageModal` con `@gnome-ui/react` | `components/AddPackageModal/index.tsx` |
| 12 | Persistencia | `persistQueryClient` con IndexedDB (`idb` ya instalado) | `src/main.tsx`, `src/lib/queryClient.ts` |
| 13 | Limpieza | Eliminar AppFooter, pulir estilos | `AppFooter/`, `global.css` |

---

## Fase 14 — API Hooks upgrade, nuevos charts y mejoras de navegación

### Motivación

Integrar los hooks nuevos de `@api-hooks/npm` (avatar de maintainer, score de paquete y rango de descargas), aprovechar los charts disponibles en `@gnome-ui/charts` que aún no se usan, refactorizar `PackageDetailPage` con `DashboardGrid`, agregar un color de acento personalizable en Settings, y corregir el comportamiento de la página de paquete cuando se navega desde un maintainer.

---

### 14.1 — Añadir `fromMaintainer` a los search params de la ruta

**Archivo:** `src/routes/packages.$name.tsx`

Extender `validateSearch` con `fromMaintainer?: string`. TanStack Router omite el param del URL cuando es `undefined`, por lo que la navegación desde el Dashboard no se ve afectada.

```ts
validateSearch: (search: Record<string, unknown>) => ({
  version: typeof search.version === 'string' ? search.version : undefined,
  fromMaintainer: typeof search.fromMaintainer === 'string' ? search.fromMaintainer : undefined,
}),
```

---

### 14.2 — Propagar contexto desde `PackageCard`

**Archivo:** `src/modules/npm/components/PackageCard/index.tsx`

Añadir prop opcional `fromMaintainer?: string`. Se incluye en `search` al navegar; si es `undefined` el param se omite del URL.

---

### 14.3 — Actualizar `MaintainerPage`

**Archivo:** `src/pages/Maintainer/index.tsx`

- **Avatar real**: usar `useNpmMaintainerAvatar(username)` (retorna URL string, sin llamada de red) y pasarla como `src` al `<Avatar>`.
- **Contexto al navegar**: `<PackageCard name={name} fromMaintainer={username} />`.
- **DashboardGrid para CounterCard**: reemplazar el `<div style={{ display: 'grid' }}>` manual por `<DashboardGrid>`.

---

### 14.4 — Botón condicional en `PackageDetailPage`

**Archivo:** `src/pages/PackageDetail/index.tsx`

Leer `fromMaintainer` de `Route.useSearch()`. Importar `useFavorites` y `useAddFavorite` de `@/modules/npm/hooks`.

| Condición | Botón mostrado |
| --- | --- |
| Sin `fromMaintainer` | Remove (comportamiento actual) |
| Con `fromMaintainer` + ya es favorito | Remove |
| Con `fromMaintainer` + no es favorito | Add to favorites (`variant="suggested"`) |

La clave i18n `packageDetail.addPackage` ya existe en los locales.

---

### 14.5 — Breadcrumb contextual

**Archivo:** `src/hooks/usePathSegments.ts`

Reemplazar `useLocation()` por `useRouterState({ select: (s) => s.location })` para acceder al query string sin acoplar el hook a una ruta específica. Parsear `fromMaintainer` con `URLSearchParams`.

Resultado cuando `fromMaintainer` está presente en `/packages/$name`:

```text
Maintainers → {username} → {packageName}
```

(Se omite `Home` para mantener el trail corto en este contexto.)

---

### 14.6 — Layout con `DashboardGrid` en `PackageDetailPage`

**Archivo:** `src/pages/PackageDetail/index.tsx`

Reemplazar la clase CSS `detail-sections` (flex-column) por un `DashboardGrid` interno con la siguiente disposición responsiva (1 col en `sm`, 2 col en `md+`):

| span | Sección |
| --- | --- |
| 2 | `PackageInfoSection` |
| 1 | `ScoreSection` (nueva) |
| 1 | `DownloadsSection` |
| 1 | `BundleSizeSection` |
| 1 | `GitHubSection` |
| 2 | `VulnerabilitySection` |

El selector de versión y el botón de acción quedan fuera del grid (arriba y abajo respectivamente).

---

### 14.7 — `AreaChart` en `DownloadsSection`

**Archivo:** `src/pages/PackageDetail/sections/DownloadsSection.tsx`

Añadir `useNpmPackageDownloadRange(name, { period: 'last-month' })`.  
Datos: `NpmDownloadDay[]` — `{ day: string, downloads: number }`.  
Renderizar con `AreaChart` de `@gnome-ui/charts` debajo del resumen numérico existente.

```tsx
<AreaChart
  data={chartData}
  xAxisKey="day"
  series={[{ dataKey: 'downloads', name: t('packageDetail.downloadsLabel') }]}
  height={200}
  showGrid
  gradient
/>
```

---

### 14.8 — Nueva `ScoreSection` con `RadialBarChart`

**Archivo nuevo:** `src/pages/PackageDetail/sections/ScoreSection.tsx`

Usa `useNpmPackageScore(name)` — retorna `NpmsScore` con `score.detail.{ quality, popularity, maintenance }` (valores 0–1).

```tsx
<RadialBarChart
  data={[
    { label: t('packageDetail.scoreQuality'),     value: Math.round(data.score.detail.quality     * 100) },
    { label: t('packageDetail.scorePopularity'),  value: Math.round(data.score.detail.popularity  * 100) },
    { label: t('packageDetail.scoreMaintenance'), value: Math.round(data.score.detail.maintenance * 100) },
  ]}
  height={220}
  showLabels
  showLegend
/>
```

Nuevas claves i18n en `packageDetail`: `score`, `scoreQuality`, `scorePopularity`, `scoreMaintenance`, `scoreFinal`.

---

### 14.9 — Color de acento en Settings

#### 14.9a — Extender `AppSettings`

**Archivo:** `src/modules/settings/domain/AppSettings.ts`

```ts
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: Language
  accentColor?: string   // ← nuevo
}
```

`DEFAULT_SETTINGS` no cambia; sin valor se aplica el azul GNOME (`#3584e4`) vía fallback CSS.

#### 14.9b — Hook `useApplyAccentColor`

**Archivo nuevo:** `src/hooks/useApplyAccentColor.ts`

Mismo patrón que `useApplyTheme`. Aplica `--gnome-accent-bg-color` sobre `document.documentElement` (variable que `@gnome-ui/react` usa en botones, badges, checkboxes, etc.).

```ts
useEffect(() => {
  if (accentColor) {
    document.documentElement.style.setProperty('--gnome-accent-bg-color', accentColor)
  } else {
    document.documentElement.style.removeProperty('--gnome-accent-bg-color')
  }
}, [accentColor])
```

Registrar con `useApplyAccentColor()` en `src/routes/__root.tsx`.

#### 14.9c — `ColorPicker` en `SettingsPage`

**Archivo:** `src/pages/Settings/index.tsx`

Añadir `ActionRow` + `ColorPicker` dentro del `PreferencesGroup` de apariencia existente.  
`ColorPicker` viene de `@gnome-ui/react` y muestra `GNOME_PALETTE` (9 colores Adwaita) por defecto.  
Activar `allowCustom` para colores hex arbitrarios.

```tsx
<ActionRow
  title={t('settings.accentColor')}
  subtitle={t('settings.accentColorSubtitle')}
  trailing={
    <ColorPicker
      value={settings.accentColor}
      onChange={(color) => updateSettings.mutate({ accentColor: color })}
      allowCustom
    />
  }
/>
```

Nuevas claves i18n en `settings`: `accentColor`, `accentColorSubtitle`.

---

### 14.10 — Actualizar mocks de test

**`src/__mocks__/api-hooks-npm.ts`** — añadir:

```ts
export const useNpmMaintainerAvatar = jest.fn(() => 'https://www.npmjs.com/npm-avatar/test')
export const useNpmPackageScore = jest.fn(() => defaultQuery)
```

(`useNpmPackageDownloadRange` ya está mockeado.)

**`src/__mocks__/gnome-ui-charts.ts`** — añadir:

```ts
export const AreaChart = () => null
export const RadialBarChart = () => null
```

**`src/pages/PackageDetail/__tests__/PackageDetailPage.test.tsx`** — actualizar mock de `useSearch` para incluir `fromMaintainer: undefined` y añadir casos para el botón condicional.

---

### Archivos afectados

| Archivo | Cambio |
| --- | --- |
| `src/routes/packages.$name.tsx` | `fromMaintainer` en `validateSearch` |
| `src/modules/npm/components/PackageCard/index.tsx` | Prop `fromMaintainer` + navegación |
| `src/pages/Maintainer/index.tsx` | Avatar real, `fromMaintainer`, DashboardGrid |
| `src/pages/PackageDetail/index.tsx` | Botón condicional, DashboardGrid interno |
| `src/hooks/usePathSegments.ts` | `useRouterState`, breadcrumb con `fromMaintainer` |
| `src/pages/PackageDetail/sections/DownloadsSection.tsx` | `AreaChart` con rango mensual |
| `src/pages/PackageDetail/sections/ScoreSection.tsx` *(nuevo)* | `RadialBarChart` de scores |
| `src/modules/settings/domain/AppSettings.ts` | Campo `accentColor` |
| `src/hooks/useApplyAccentColor.ts` *(nuevo)* | CSS var accent |
| `src/routes/__root.tsx` | Registrar `useApplyAccentColor` |
| `src/pages/Settings/index.tsx` | `ActionRow` + `ColorPicker` |
| `src/locales/*/common.json` | Claves score + accentColor (3 archivos) |
| `src/__mocks__/api-hooks-npm.ts` | Nuevos mocks |
| `src/__mocks__/gnome-ui-charts.ts` | `AreaChart`, `RadialBarChart` |
| `src/pages/PackageDetail/__tests__/PackageDetailPage.test.tsx` | Tests del botón condicional |
