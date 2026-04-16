# ROADMAP: Firebase Auth + GitHub Gist Sync

## Fase 1 — Setup Firebase + GitHub OAuth

- Crear OAuth App en **GitHub Developer Settings**
  - `Homepage URL`: dominio de producción (o `localhost` para dev)
  - `Authorization callback URL`: `https://<proyecto>.firebaseapp.com/__/auth/handler`
- Firebase Console → Authentication → Sign-in providers → **GitHub** → pegar Client ID y Secret
- `npm install firebase`
- Crear `src/modules/auth/proxy/firebase.ts` con `initializeApp` + `getAuth`
- Variables de entorno en `.env.local`:
  ```
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_GITHUB_CLIENT_ID=
  ```

---

## Fase 2 — Módulo auth

```
src/modules/auth/
├── domain/
│   └── AuthUser.ts           # { uid, displayName, email, photoURL, githubToken }
├── proxy/
│   ├── firebase.ts           # initializeApp, getAuth
│   ├── signInWithGitHub.ts   # GithubAuthProvider + signInWithPopup, guarda credential.accessToken
│   └── signOut.ts
└── hooks/
    ├── useAuthUser.ts        # onAuthStateChanged → useQuery
    ├── useSignIn.ts          # useMutation → signInWithPopup
    └── useSignOut.ts         # useMutation
```

> El `credential.accessToken` (GitHub token) que entrega Firebase se reutiliza
> para la Gist API y para `fetchGitHubStats`, subiendo el rate limit de 60 → **5,000 req/h**.

---

## Fase 3 — Módulo Gist

```
src/modules/gist/
├── domain/
│   └── GistSync.ts           # { gistId, content: FavoritePackage[], updatedAt }
├── proxy/
│   ├── fetchUserGist.ts      # GET /gists/{gist_id} con Authorization: Bearer <token>
│   ├── createUserGist.ts     # POST /gists — primer login sin gist previo
│   └── updateUserGist.ts     # PATCH /gists/{gist_id}
├── hooks/
│   ├── useGistSync.ts        # orquesta fetch + diff + estado del dialog
│   └── usePushToGist.ts      # mutation: sube favoritos actuales al Gist
└── components/
    └── MergeSyncDialog/
        └── index.tsx         # recibe { addedInGist, removedInGist, onKeepAll, onReplaceWithLocal }
```

**Estructura del Gist** — un único Gist privado por usuario, archivo `mynpmlens.json`:
```json
{ "favorites": [{ "name": "react", "addedAt": "2025-01-01T00:00:00.000Z" }] }
```

**Gist ID** persistido en localStorage con clave `mynpmlens:gist:{uid}`.

---

## Fase 4 — Lógica de sincronización

### Flujo al iniciar sesión

```
Login exitoso → ¿tiene gistId en localStorage?
  ├─ NO  → crear Gist con favoritos locales actuales → guardar gistId
  └─ SÍ  → fetch Gist → diff(gist, localStorage)
              ├─ sin diferencias → no hacer nada
              └─ hay diferencias → calcular delta → mostrar MergeSyncDialog
```

### Cálculo del delta

```ts
// en Gist pero no en local → agregados desde otro dispositivo
const addedInGist = gistFavs.filter(g => !localFavs.find(l => l.name === g.name))

// en local pero no en Gist → eliminados desde otro dispositivo
const removedInGist = localFavs.filter(l => !gistFavs.find(g => g.name === l.name))
```

### MergeSyncDialog

```
┌─────────────────────────────────────────────────┐
│  Cambios detectados desde otro dispositivo       │
│                                                  │
│  + Agregados     → react, lodash, axios          │
│  - Eliminados    → vue, moment                   │
│                                                  │
│  [ Reemplazar con actuales ]  [ Conservar todo ] │
└─────────────────────────────────────────────────┘
```

| Acción | Resultado |
|--------|-----------|
| **Conservar todo** | `union(localFavs, gistFavs)` → guarda en localStorage → push al Gist |
| **Reemplazar con actuales** | mantiene solo `localFavs` → push local al Gist (sobreescribe) |

---

## Fase 5 — Push automático al mutar

Cuando el usuario agrega o elimina un favorito (autenticado):
- `useAddFavorite` / `useRemoveFavorite` → en `onSuccess` → llama `usePushToGist`
- Si falla el push → silencioso (los datos están seguros en localStorage)
- Sin conexión → localStorage queda como fuente de verdad hasta el próximo sync

---

## Fase 6 — UI

### Principio: auth opcional

La app funciona completamente sin autenticación. El login es una mejora opcional
que desbloquea la sincronización vía Gist. No hay rutas protegidas ni redirects forzados.

### Toolbar
- Usuario **no autenticado** → botón **Sign in with GitHub** en el Toolbar
- Usuario **autenticado** → avatar + nombre + menú con opción **Sign out**
- El sync badge (ej. indicador de Gist conectado) aparece solo si hay sesión activa

### Ruta `/login` (opcional / deep link)
- Página mínima con botón **Sign in with GitHub**
- Si el usuario ya tiene sesión, redirige a `/`
- Accesible desde un deep link pero no requerida para usar la app

### Rate limit de GitHub API
- Sin sesión → 60 req/h (comportamiento actual)
- Con sesión → token pasado a `fetchGitHubStats` → **5,000 req/h**

---

## Orden de implementación

| # | Fase | Descripción |
|---|------|-------------|
| 1 | Setup | Firebase + OAuth App en GitHub |
| 2 | Auth | Módulo auth, hooks, token de GitHub |
| 3 | Gist proxy | `fetch`, `create`, `update` — testeable sin UI |
| 4 | Sync | `useGistSync` + `MergeSyncDialog` |
| 5 | Push | Push automático al agregar/eliminar favoritos |
| 6 | UI | Login page, rutas protegidas, avatar en Toolbar |
