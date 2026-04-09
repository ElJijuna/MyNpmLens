# Npm Lens

A PWA to track and monitor your favourite npm packages at a glance.

## Features

- Add packages by pasting an npmjs.com URL or a plain package name
- Dashboard with a card grid showing key metrics per package:
  - Weekly downloads
  - Bundle size (gzipped)
  - GitHub stars
  - License badge
- Detail page per package with:
  - Full registry info (author, homepage, license)
  - Weekly / monthly download counts
  - Minified + gzipped bundle sizes and side-effects flag
  - GitHub stats (stars, forks, open issues, last push date)
- Light / dark theme follows system preference (Adwaita / GNOME design tokens)
- Installable as a PWA — works offline with cached data

## Tech stack

| Tool | Version | Role |
| --- | --- | --- |
| Vite | 8.0.7 | Build tool |
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| @tanstack/react-router | latest | File-based routing |
| @tanstack/react-query | latest | Server state & caching |
| @gnome-ui/react | 1.9.1 | UI components (Adwaita style) |
| vite-plugin-pwa | 1.2.x | Service worker & manifest |
| Jest | 30 | Unit testing |
| TypeDoc | 0.28 | API documentation |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs` | Generate TypeDoc API docs into `docs/` |

## Project structure

```text
src/
  routes/           # File-based route definitions (auto-generates routeTree.gen.ts)
  pages/
    Dashboard/      # Home page — favorites grid
    PackageDetail/  # Detail page — four data sections
  components/       # Shared UI components (Toolbar, SectionCard, …)
  modules/
    npm/
      domain/       # TypeScript types + parseNpmUrl utility
      proxy/        # Fetch functions for npm registry, downloads, Bundlephobia
      hooks/        # React Query hooks (useNpmPackage, useNpmDownloads, …)
      components/   # npm-specific components (PackageCard)
    github/
      domain/       # GitHubStats type
      proxy/        # fetchGitHubStats
      hooks/        # useGitHubStats
  store/            # localStorage adapter (favoritesStorage)
  styles/           # Global CSS (reset, theming, layout classes)
```

## Data sources

| Source | Data |
| --- | --- |
| [npm registry](https://registry.npmjs.org) | Name, version, description, author, license, homepage, GitHub URL |
| [npm downloads API](https://api.npmjs.org) | Weekly and monthly download counts |
| [Bundlephobia](https://bundlephobia.com) | Minified and gzipped bundle size |
| [GitHub REST API](https://api.github.com) | Stars, forks, open issues, last push date |

## API documentation

Generate and open the TypeDoc documentation:

```bash
npm run docs
open docs/index.html
```
