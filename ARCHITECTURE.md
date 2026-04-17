# Architecture

## Current

### Render tree

```mermaid
graph TD
  main["main.tsx"]

  subgraph Providers
    QCP["QueryClientProvider"]
    AP["AuthProvider\n(Firebase + GitHub token)"]
    RP["RouterProvider\n(TanStack Router)"]
  end

  subgraph RootLayout ["__root.tsx — RootLayout"]
    Toolbar["Toolbar\n(sticky, full width above everything)"]
    Outlet["&lt;Outlet /&gt;"]
    AppFooter["AppFooter\n(version · check for updates)"]
    MSD["MergeSyncDialog\n(conflict resolver)"]
  end

  subgraph Routes
    Dashboard["/ — Dashboard"]
    PackageDetail["/package/$name — PackageDetail"]
  end

  main --> QCP --> AP --> RP --> RootLayout
  RootLayout --> Toolbar
  RootLayout --> Outlet
  RootLayout --> AppFooter
  RootLayout --> MSD
  Outlet --> Dashboard
  Outlet --> PackageDetail
```

---

### Data layer

```mermaid
graph LR
  subgraph Pages
    Dashboard
    PackageDetail
  end

  subgraph npm-module ["modules/npm"]
    useNpmPackage["useNpmPackage()\nfetchNpmPackage()"]
    useNpmDownloads["useNpmDownloads()\nfetchNpmDownloads()"]
    useBundleSize["useBundleSize()\nfetchBundleSize()"]
    useFavorites["useFavorites()\nuseAddFavorite()\nuseRemoveFavorite()"]
  end

  subgraph github-module ["modules/github"]
    useGitHubStats["useGitHubStats()\nfetchGitHubStats()"]
  end

  subgraph osv-module ["modules/osv"]
    useOsvVulnerabilities["useOsvVulnerabilities()\nfetchOsvVulnerabilities()"]
  end

  subgraph gist-module ["modules/gist"]
    useGistSync["useGistSync()"]
    usePushToGist["usePushToGist()"]
  end

  subgraph auth-module ["modules/auth"]
    AuthProvider["AuthProvider\n(Firebase)"]
    useSignIn
    useSignOut
  end

  subgraph storage ["store/"]
    LS["localStorage\nmynpmlens:favorites\nmynpmlens:github_token\nmynpmlens:gist:{uid}"]
  end

  subgraph External APIs
    NpmReg["registry.npmjs.org"]
    NpmDL["api.npmjs.org"]
    BP["bundlephobia.com"]
    GH["api.github.com"]
    OSV["api.osv.dev"]
    Firebase["Firebase Auth"]
  end

  Dashboard --> useFavorites --> LS
  Dashboard --> useGistSync
  useAddFavorite --> usePushToGist
  useRemoveFavorite --> usePushToGist

  PackageDetail --> useNpmPackage
  PackageDetail --> useNpmDownloads
  PackageDetail --> useBundleSize
  PackageDetail --> useGitHubStats
  PackageDetail --> useOsvVulnerabilities

  useNpmPackage --> NpmReg
  useNpmDownloads --> NpmDL
  useBundleSize --> BP
  useGitHubStats --> GH
  useOsvVulnerabilities --> OSV

  useGistSync --> GH
  usePushToGist --> GH
  useSignIn --> Firebase
  AuthProvider --> Firebase
```

---

---

## New version

### Render tree

```mermaid
graph TD
  main["main.tsx"]

  subgraph Providers
    QCP["QueryClientProvider"]
    AP["AuthProvider\n(Firebase + GitHub token)"]
    RP["RouterProvider\n(TanStack Router)"]
  end

  subgraph RootLayout ["__root.tsx — RootLayout"]
    NSV["NavigationSplitView\n(desktop / tablet)\nor OverlaySplitView\n(mobile portrait)"]

    subgraph Sidebar ["AppSidebar (left, full height)"]
      SidebarNav["SidebarItem: Home\nSidebarItem: Maintainers\nSidebarItem: About"]
      SidebarFooter["── footer ──\nAuthSection: Avatar + name → /profile\nor © year · vX.X.X\nButton: Search updates"]
    end

    subgraph ContentPane ["Content pane (right)"]
      Toolbar["Toolbar\n(HeaderBar — only over content)\n☰ hamburger on mobile"]
      Outlet["&lt;Outlet /&gt;"]
    end

    MSD["MergeSyncDialog\n(conflict resolver)"]
  end

  subgraph Routes
    Home["/ — Dashboard"]
    PackageDetail["/package/$name — PackageDetail"]
    Maintainers["/maintainers — MaintainersPage"]
    About["/about — AboutPage"]
    Profile["/profile — ProfilePage"]
  end

  main --> QCP --> AP --> RP --> RootLayout
  RootLayout --> NSV
  NSV --> Sidebar
  NSV --> ContentPane
  RootLayout --> MSD
  ContentPane --> Toolbar
  ContentPane --> Outlet
  Outlet --> Home
  Outlet --> PackageDetail
  Outlet --> Maintainers
  Outlet --> About
  Outlet --> Profile
```

---

### Data layer

```mermaid
graph LR
  subgraph Pages
    Dashboard
    PackageDetail
    Maintainers
    Profile
  end

  subgraph api-hooks-npm ["@api-hooks/npm ✦ replaces modules/npm/proxy + hooks"]
    useNpmPackage["useNpmPackage()"]
    useNpmPackageDownloads["useNpmPackageDownloads()"]
    useNpmPackageMaintainers["useNpmPackageMaintainers()"]
    useNpmMaintainer["useNpmMaintainer()"]
  end

  subgraph api-hooks-bp ["@api-hooks/bp ✦ replaces modules/npm/proxy/fetchBundleSize"]
    useBpPackageSize["useBpPackageSize()"]
    useBpPackageVersionSize["useBpPackageVersionSize()"]
  end

  subgraph github-module ["modules/github (unchanged)"]
    useGitHubStats["useGitHubStats()\nfetchGitHubStats()"]
  end

  subgraph osv-module ["modules/osv (unchanged)"]
    useOsvVulnerabilities["useOsvVulnerabilities()"]
  end

  subgraph gist-module ["modules/gist (unchanged)"]
    useGistSync["useGistSync()"]
    usePushToGist["usePushToGist()"]
  end

  subgraph auth-module ["modules/auth (unchanged)"]
    AuthProvider["AuthProvider\n(Firebase)"]
    useSignIn
    useSignOut
  end

  subgraph storage ["store/"]
    LS["localStorage\nmynpmlens:favorites\nmynpmlens:github_token\nmynpmlens:gist:{uid}"]
  end

  subgraph External APIs
    NpmReg["registry.npmjs.org"]
    NpmDL["api.npmjs.org"]
    BP["bundlephobia.com"]
    GH["api.github.com"]
    OSV["api.osv.dev"]
    Firebase["Firebase Auth"]
  end

  Dashboard --> useFavorites --> LS
  Dashboard --> useGistSync
  useAddFavorite --> usePushToGist
  useRemoveFavorite --> usePushToGist

  PackageDetail --> useNpmPackage
  PackageDetail --> useNpmPackageDownloads
  PackageDetail --> useBpPackageVersionSize
  PackageDetail --> useGitHubStats
  PackageDetail --> useOsvVulnerabilities

  Maintainers --> useNpmPackageMaintainers
  Maintainers --> useNpmMaintainer

  Profile --> AuthProvider
  Profile --> useGistSync
  Profile --> useSignOut

  useNpmPackage --> NpmReg
  useNpmPackageDownloads --> NpmDL
  useNpmPackageMaintainers --> NpmReg
  useNpmMaintainer --> NpmReg
  useBpPackageSize --> BP
  useBpPackageVersionSize --> BP
  useGitHubStats --> GH
  useOsvVulnerabilities --> OSV

  useGistSync --> GH
  usePushToGist --> GH
  useSignIn --> Firebase
  AuthProvider --> Firebase
```

---

### What changes

| Área | Actual | Nuevo |
| --- | --- | --- |
| Layout | `Toolbar` arriba de todo + `AppFooter` abajo | `NavigationSplitView`: sidebar izquierdo + `Toolbar` solo sobre el contenido |
| Mobile | Sin sidebar | `OverlaySplitView` con botón ☰ |
| Navegación | Solo back/home en `Toolbar` | `SidebarItem` por ruta: Home · Maintainers · About |
| User info | `AuthSection` en `Dashboard` | Footer del sidebar → navega a `/profile` |
| Version / updates | `AppFooter` | Footer del sidebar |
| Rutas nuevas | — | `/maintainers`, `/about`, `/profile` |
| npm proxy/hooks | `fetchNpmPackage`, `fetchNpmDownloads`, `useNpmPackage`, `useNpmDownloads` | `@api-hooks/npm` |
| Bundlephobia proxy/hook | `fetchBundleSize`, `useBundleSize` | `@api-hooks/bp` |
| Bundle size en detail | Siempre latest | `useBpPackageVersionSize` — versión seleccionada |
