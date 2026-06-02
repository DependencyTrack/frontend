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
| [Vue CLI](https://cli.vuejs.org/)               | Build tooling     |
| [BootstrapVue](https://bootstrap-vue.org/)      | Component library |
| [CoreUI](https://coreui.io/vue/)                | Admin template    |
| [Vue Router](https://v3.router.vuejs.org/)      | Routing           |
| [vue-i18n](https://kazupon.github.io/vue-i18n/) | Localization      |
| [Axios](https://axios-http.com/)                | HTTP client       |
| [ESLint](https://eslint.org/)                   | Linting           |
| [Prettier](https://prettier.io/)                | Formatting        |

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
