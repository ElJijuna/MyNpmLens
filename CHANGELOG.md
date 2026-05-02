## [1.13.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.13.0...v1.13.1) (2026-05-02)

### Bug Fixes

* remove PreferencesPage wrap. ([84e5525](https://github.com/ElJijuna/MyNpmLens/commit/84e5525d957da21e6cd594e67a0d43d52670bcdf))

## [1.13.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.12.2...v1.13.0) (2026-05-02)

### Features

* add multi-language support (en, es, es-PE) ([4b94371](https://github.com/ElJijuna/MyNpmLens/commit/4b94371af9f179eb265914f0ae2ff90b80bf151b)), closes [#40](https://github.com/ElJijuna/MyNpmLens/issues/40)

## [1.12.2](https://github.com/ElJijuna/MyNpmLens/compare/v1.12.1...v1.12.2) (2026-04-27)

### Bug Fixes

* sync PWA theme-color with --gnome-headerbar-bg-color token for light, dark and system modes ([2ff0bcc](https://github.com/ElJijuna/MyNpmLens/commit/2ff0bccb1a73746f4a352a52a4035c5e0bad22a8))

## [1.12.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.12.0...v1.12.1) (2026-04-27)

### Bug Fixes

* set PWA theme-color to match app background for light and dark mode ([7f9d7e1](https://github.com/ElJijuna/MyNpmLens/commit/7f9d7e1854678dd296178f61589f5c21371d246b))

## [1.12.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.11.2...v1.12.0) (2026-04-23)

### Features

* update dependencies. ([8ca3cb4](https://github.com/ElJijuna/MyNpmLens/commit/8ca3cb41d50ec9dad7a86ff868a347f16a28af28))

## [1.11.2](https://github.com/ElJijuna/MyNpmLens/compare/v1.11.1...v1.11.2) (2026-04-20)

### Bug Fixes

* add autoCapitalize="none" in AddPackageModal and AddMaintanerDialog. ([c8e85c9](https://github.com/ElJijuna/MyNpmLens/commit/c8e85c9f76793c201cf3024fdc46a24e636a4a1c))

## [1.11.1](https://github.com/ElJijuna/MyNpmLens/compare/v1.11.0...v1.11.1) (2026-04-19)

### Bug Fixes

* close autocomplete list when user select suggesten option (closes [#36](https://github.com/ElJijuna/MyNpmLens/issues/36)) ([747f7e4](https://github.com/ElJijuna/MyNpmLens/commit/747f7e48533e45e4c51fc02db1fd05236d1c5ac8))
* update sidebar to detect window inner width is mobile aprox to initialize value to closed sidebar. ([b977e8b](https://github.com/ElJijuna/MyNpmLens/commit/b977e8bb1239c524ca23c1fdf6485a87d8cc9a42))

## [1.11.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.10.0...v1.11.0) (2026-04-18)

### Features

* add firebase analytics events and update tests. ([a2b6d20](https://github.com/ElJijuna/MyNpmLens/commit/a2b6d20e6acd4a4c77ec668e707851a27560c392))

## [1.10.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.9.0...v1.10.0) (2026-04-18)

### Features

* update @api-hooks/gh to version 1.8.0 to use useGhGists to search in 100 firsts gists the config. ([f8b75ae](https://github.com/ElJijuna/MyNpmLens/commit/f8b75ae863d15fb988403c7553ea025bc177eee1))

## [1.9.0](https://github.com/ElJijuna/MyNpmLens/compare/v1.8.1...v1.9.0) (2026-04-18)

### Features

* add AppSidebar component with navigation and footer (closes [#19](https://github.com/ElJijuna/MyNpmLens/issues/19)) ([4cac0c2](https://github.com/ElJijuna/MyNpmLens/commit/4cac0c2b0ce0ddc5fc96b59d5852850134703264))
* add PathBar navigation and sidebar toggle to Toolbar (closes [#21](https://github.com/ElJijuna/MyNpmLens/issues/21)) ([1f5b774](https://github.com/ElJijuna/MyNpmLens/commit/1f5b774101d97fca4b246f6c7f1c5fd056b3d7e9))
* add route stubs for v2.0.0 pages (closes [#18](https://github.com/ElJijuna/MyNpmLens/issues/18)) ([7423789](https://github.com/ElJijuna/MyNpmLens/commit/742378937cab3466242f6ad9e5a78160d136a572))
* async autocomplete in AddPackageModal (closes [#32](https://github.com/ElJijuna/MyNpmLens/issues/32)) ([b8a5244](https://github.com/ElJijuna/MyNpmLens/commit/b8a524490b7b2661cd5328a487f0b040f4a27329))
* closes all issues and update router and ui to fix responsive. ([703038d](https://github.com/ElJijuna/MyNpmLens/commit/703038dee13cf46279a3dbc9ce0bd4701f9b6e0d))
* expand GistSync to include maintainers — storage, hooks, and conflict resolution (closes [#24](https://github.com/ElJijuna/MyNpmLens/issues/24)) ([c196e71](https://github.com/ElJijuna/MyNpmLens/commit/c196e7137e3b950906400fe33f9b4813062334cf))
* implement AboutPage with version info and links (closes [#27](https://github.com/ElJijuna/MyNpmLens/issues/27)) ([94a1eff](https://github.com/ElJijuna/MyNpmLens/commit/94a1effc7cd5d57d87392d8ea875e2e8603a5c35))
* implement MaintainerPage with profile, stats, and packages dashboard (closes [#23](https://github.com/ElJijuna/MyNpmLens/issues/23)) ([f8d138f](https://github.com/ElJijuna/MyNpmLens/commit/f8d138f138f80ce41bb512b3a7a8b74f93c0c0ce))
* implement MaintainersPage with add maintainer dialog (closes [#22](https://github.com/ElJijuna/MyNpmLens/issues/22)) ([6598f4b](https://github.com/ElJijuna/MyNpmLens/commit/6598f4b5ba96893eb04fa3e4fbbad1d4343f1553))
* implement SettingsPage with theme support and Gist sync (closes [#26](https://github.com/ElJijuna/MyNpmLens/issues/26)) ([9aecff6](https://github.com/ElJijuna/MyNpmLens/commit/9aecff6222e2a414d06092cf201208c21e1872a6))
* migrate Bundlephobia proxy to @api-hooks/bp (closes [#30](https://github.com/ElJijuna/MyNpmLens/issues/30)) ([9e11b79](https://github.com/ElJijuna/MyNpmLens/commit/9e11b79fe74b97935b1f7a10287721cedb688bcb))
* migrate npm proxy and hooks to @api-hooks/npm (closes [#31](https://github.com/ElJijuna/MyNpmLens/issues/31)) ([0f72398](https://github.com/ElJijuna/MyNpmLens/commit/0f7239823923d137bcd834576e4239e36d718804))
* migrate OSV proxy to @api-hooks/osv (closes [#29](https://github.com/ElJijuna/MyNpmLens/issues/29)) ([f73f4ca](https://github.com/ElJijuna/MyNpmLens/commit/f73f4ca932e426044370aafe1cd931af5e9ee1df))
* migrate root layout to OverlaySplitView with AppSidebar (closes [#20](https://github.com/ElJijuna/MyNpmLens/issues/20)) ([984875b](https://github.com/ElJijuna/MyNpmLens/commit/984875bd058be5e4b97fea8341e22c5487f10210))
* persist QueryClient cache with IndexedDB (closes [#33](https://github.com/ElJijuna/MyNpmLens/issues/33)) ([7cfdd13](https://github.com/ElJijuna/MyNpmLens/commit/7cfdd130b1d4e01e7f52602b42ef6db63ccc4c7b))
* replace Gist proxy layer with @api-hooks/gh hooks (closes [#28](https://github.com/ElJijuna/MyNpmLens/issues/28)) ([8b53206](https://github.com/ElJijuna/MyNpmLens/commit/8b53206ce9361f0d454b3a17d58bd2c14b8a0f5e))

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
