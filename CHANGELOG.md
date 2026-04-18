## [1.8.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.8.0...v1.8.1) (2026-04-18)

### Bug Fixes

* change Chart lang to english. ([956bdbe](https://github.com/ElJijuna/MyNpmLens/commit/956bdbe00f0337b99091805439a05f7be8d0ccaa))

## [1.8.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.7.1...v1.8.0) (2026-04-13)

### Features

* update manifest and add screenshots. ([a99b878](https://github.com/ElJijuna/MyNpmLens/commit/a99b878b3fa0e97c3e433dfb67f50b4bf0be5f56))

## [1.7.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.7.0...v1.7.1) (2026-04-10)

### Refactoring

* change to use isPending. ([ceeaeaa](https://github.com/ElJijuna/MyNpmLens/commit/ceeaeaa249d1faeea724548a56b05d8437e735f2))

## [1.7.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.6.1...v1.7.0) (2026-04-10)

### Features

* find existing gist on new device instead of creating a duplicate. ([0cec828](https://github.com/ElJijuna/MyNpmLens/commit/0cec828867297d437dab533584f13523d00311e2))

## [1.6.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.6.0...v1.6.1) (2026-04-10)

### Bug Fixes

* add gist scope and resolve github token race condition on sign-in ([1d1dbc4](https://github.com/ElJijuna/MyNpmLens/commit/1d1dbc495c01c9db1f8299a1884cff8ae4d8ba80))

## [1.6.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.5.0...v1.6.0) (2026-04-10)

### Features

* add auth UI, duplicate guard, rate limit upgrade and deploy config. ([d4437bd](https://github.com/ElJijuna/MyNpmLens/commit/d4437bd39b1690ac00b0fa1368618b83d84f5588))
* add component AuthSection, and integrate with dashboard. ([4b64b2c](https://github.com/ElJijuna/MyNpmLens/commit/4b64b2c6ad1ef298b8b8881f92cd270555e6bcf9))
* add events to create and use gist, and refactor fetchs and hooks to use app authenticate and without authentication. ([0beafb8](https://github.com/ElJijuna/MyNpmLens/commit/0beafb8b8aaa935fcdeaa595a835bcac6ce63f57))
* add integration with firebase authentication, add Auth providers an hooks and methods to sign in and sign out in github. ([d0eb6de](https://github.com/ElJijuna/MyNpmLens/commit/d0eb6def98bd99bae998a4d9d4ee3922ee6b4b14))
* integrate gist sync into app shell and favorite mutations ([6b69e79](https://github.com/ElJijuna/MyNpmLens/commit/6b69e79b2a380550d6cb3d95b9580ca655c29401))

## [1.5.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.4.0...v1.5.0) (2026-04-10)

### Features

* add download chart in dasboard. ([ee4ab0b](https://github.com/ElJijuna/MyNpmLens/commit/ee4ab0b1b4da0b52c8b90e6829a7fcfe6ec0b8c4))

## [1.4.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.3.1...v1.4.0) (2026-04-10)

### Features

* add interacion with @gnome-ui/hooks to communicate to OS platform, hide toolbar in gnome webview and  open dialog ADD PACKAGE when used click in native button Add in Gnome App. ([bfa8985](https://github.com/ElJijuna/MyNpmLens/commit/bfa898582a97c2d634c5f7dac9fac1e320e1dea5))

## [1.3.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.3.0...v1.3.1) (2026-04-09)

### Refactoring

* change action to update app in new version available. ([57b1a70](https://github.com/ElJijuna/MyNpmLens/commit/57b1a703daacf95996ee418212bbe1084ffb548c))

## [1.3.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.2.0...v1.3.0) (2026-04-09)

### Features

* update to input package name or url package and validate if exist before to add. ([ee08438](https://github.com/ElJijuna/MyNpmLens/commit/ee08438778461fdf5d7bf868533b5dc5ccc7070e))

### Bug Fixes

* update test. ([ac60756](https://github.com/ElJijuna/MyNpmLens/commit/ac60756ef0ae1544bbc01c3573e72c839c43da84))

## [1.2.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.1.0...v1.2.0) (2026-04-09)

### Features

* add button to delete packaged added, update tests. ([0a8af43](https://github.com/ElJijuna/MyNpmLens/commit/0a8af431d48bcde567fc09f64c9cc0b4174b4bb1))
* add total versions published in dashboard and add support to change version package detail. ([b77bd73](https://github.com/ElJijuna/MyNpmLens/commit/b77bd73d9505c8e6ee3a7eb54b04c89fce4c5c9b))
* add version and button check for updates in footer, fix page vertical distribution. ([28a7f6f](https://github.com/ElJijuna/MyNpmLens/commit/28a7f6f740765edafe8002d8863f90c4a5327da1))
* change Go Home button to end slot and hide Add. ([d20decf](https://github.com/ElJijuna/MyNpmLens/commit/d20decf451ed57f1e77e0ab74b7ce063f05e956a))

## [1.1.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.0.3...v1.1.0) (2026-04-08)

### Features

* add vulnerabilities information. ([0e8cd24](https://github.com/ElJijuna/MyNpmLens/commit/0e8cd2478183608f64e27c4a70a6134e1eafa94b))

## [1.0.3](https://github.com/ElJijuna/MyNpmLens/compare/v1.0.2...v1.0.3) (2026-04-08)

### Bug Fixes

* set router basepath to BASE_URL for GitHub Pages sub-path routing ([10241f5](https://github.com/ElJijuna/MyNpmLens/commit/10241f529c2749ae66e312600d091944e50ee82b))

## [1.0.2](https://github.com/ElJijuna/MyNpmLens/compare/v1.0.1...v1.0.2) (2026-04-08)

### Bug Fixes

* declare CSS module types for [@gnome-ui](https://github.com/gnome-ui) to fix tsc build. ([abce86b](https://github.com/ElJijuna/MyNpmLens/commit/abce86bc84cf673dea9f1d9900f4a1cf2059d84b))

## [1.0.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.0.0...v1.0.1) (2026-04-08)

### Bug Fixes

* import @gnome-ui/react/styles to apply component CSS ([488ab66](https://github.com/ElJijuna/MyNpmLens/commit/488ab669af4efc4d9109daddb0107f9ed3d3dfbd))

## 1.0.0 (2026-04-08)

### Features

* phase 1 — project scaffold (Vite 8, React 19, PWA, file-based routing) ([bcbf60d](https://github.com/ElJijuna/MyNpmLens/commit/bcbf60da09d07fd0421ae0154fb724bbdba59b4d))
* phase 2 — domain types, localStorage store and react-query favorites hooks. ([1febdd4](https://github.com/ElJijuna/MyNpmLens/commit/1febdd4602d96bfe44f964082f698a89407541b2))
* phase 3 — API proxy layer with typed error handling and timeout ([a6d5441](https://github.com/ElJijuna/MyNpmLens/commit/a6d5441d5e28842f1485628652acd475815a85f2))
* phase 4 — react-query hooks for all external APIs. ([fad47f2](https://github.com/ElJijuna/MyNpmLens/commit/fad47f2fc6083378b9f64310b5de4c9377ffb49e))
* phase 5 — dashboard page with toolbar, package cards and add modal ([be4c23c](https://github.com/ElJijuna/MyNpmLens/commit/be4c23c5dbcc57e8d0d3df2019fa4429a2eb1c00))
* phase 6 — package detail page with per-section loading and error states ([66ba3dc](https://github.com/ElJijuna/MyNpmLens/commit/66ba3dc1670aaf7f3ea966148c795c52cb8a852b))
* phase 7 — PWA polish, responsive layout, npm logo icons ([9249b4b](https://github.com/ElJijuna/MyNpmLens/commit/9249b4bea951fe30a5a6f97559dbf9cb92d06453))
* phase 8 — test coverage, TypeDoc and README. ([54f3577](https://github.com/ElJijuna/MyNpmLens/commit/54f3577221cedce68436337e24f1ff20a3031cb2))
