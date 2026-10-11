# Developing

> Please also read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Prerequisites

- Node.js 22+
- npm 10+
- Docker or Podman (for [container image builds](#container-image))
- A running [API server](https://github.com/DependencyTrack/dependency-track)

## Core Technologies

| Technology                                      | Purpose           |
| :---------------------------------------------- | :---------------- |
| [Vue 2](https://v2.vuejs.org/)                  | UI framework      |
| [Vite](https://vite.dev/)                       | Build tooling     |
| [BootstrapVue](https://bootstrap-vue.org/)      | Component library |
| [CoreUI](https://coreui.io/vue/)                | Admin template    |
| [Vue Router](https://v3.router.vuejs.org/)      | Routing           |
| [vue-i18n](https://kazupon.github.io/vue-i18n/) | Localization      |
| [Axios](https://axios-http.com/)                | HTTP client       |
| [ESLint](https://eslint.org/)                   | Linting           |
| [Prettier](https://prettier.io/)                | Formatting        |
| [Playwright](https://playwright.dev/)           | End-to-end tests  |

## Install

```shell
npm ci
```

## Dev Server

```shell
npm run serve
```

Defaults to `http://localhost:8080`, incrementing the port if it is already in use (e.g. `8081`).
The API base URL is configured at runtime via `public/static/config.json`.

## Build

```shell
npm run build
```

Output is written to `dist/`.

## Container Image

```shell
npm run build-image
```

Produces `ghcr.io/dependencytrack/frontend:local`.

## Linting and Formatting

```shell
npm run eslint-fix
npm run prettier-fix
```

## End-to-End Tests

Tests in [`e2e`](e2e) run against a production build and an API server started from [`e2e/compose.yaml`](e2e/compose.yaml).

```shell
docker compose -f e2e/compose.yaml up -d
npx playwright install chromium
npm run e2e
```

The stack can be reused across runs. Run `docker compose -f e2e/compose.yaml down` after changing `compose.yaml`, or when Postgres runs out of space.
`npm run e2e` builds and serves the app, or tests whatever already listens on port 18081.

CI uses the API server image for the target branch: `5-snapshot` for `main`, the image of the same name for `feature-*` branches,
and the latest release for release branches, e.g. `5.2.0` for `5.2.x`. Set `APISERVER_VERSION` to do the same locally.
A change that needs a new API server feature only passes once that feature is merged and `5-snapshot` is published.

Debugging:

```shell
npm run e2e -- --ui
npx playwright show-trace e2e/test-results/<test>/trace.zip
```

CI uploads the HTML report as the `playwright-report` artifact.

Writing tests:

- Find elements by role, label or text, not by CSS classes or component structure.
- Keep interaction with specific widgets, such as date pickers and switches, in helpers in [`e2e/test.mjs`](e2e/test.mjs).
  Specs must not change when a UI library is replaced.
- Add new routes to [`e2e/routes.spec.mjs`](e2e/routes.spec.mjs), with seeded data as the landmark where the route shows it.
- Add data that many tests share to the `seed` in [`e2e/global-setup.mjs`](e2e/global-setup.mjs). Create other data through the `api` fixture.
- Name test data with `uniqueName()`.
- Tests fail on console errors, uncaught exceptions and responses with status 400 or above. Allow expected ones with `problems.allow()` and a comment.
- Restore global settings that a test changes.

## Localization

Locale files live in [`src/i18n/locales`](src/i18n/locales).

Adding a key:

1. Add it to `en.json` with the English translation.
2. Add the same key with a `null` value to every other locale file.
3. Run `npm run prettier-fix` to sort keys.

Reports and cleanup:

```shell
npm run vue-i18n-extract
npm run remove-unused-i18n
```
