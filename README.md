[![Build Status](https://github.com/DependencyTrack/frontend/workflows/Node%20CI/badge.svg)](https://github.com/DependencyTrack/frontend/actions?workflow=Node+CI)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5d481daa38134900abe88e9e064e05c7)](https://www.codacy.com/manual/DependencyTrack/frontend?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=DependencyTrack/frontend&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/badge/license-Apache%202.0-brightgreen.svg)][License]
[![Latest](
https://img.shields.io/npm/v/@dependencytrack/frontend)](https://www.npmjs.com/package/@dependencytrack/frontend)

Dependency-Track Front-End
=========

The Front-End is a Single Page Application (SPA) used in Dependency-Track, an open source Supply Chain Component Analysis platform. 
The project is built with:

* Vue 2.x / CLI 3.x
* Bootstrap Vue
* CoreUI

## Build Setup

``` bash
# Install dependencies
npm install

# Serve with hot reload at localhost:8080
npm run serve

# Build for production with minification
npm run build

# Run linter
npm run lint

# Generates a CycloneDX software bill-of-materials
npm run bom
```

## Development Setup

In order to test with a Dependency-Track instance, the `.env.development` file needs to be modified and the `VUE_APP_SERVER_URL` property updated to 
reflect the base URL of a Dependency-Track server.

## Deployment Options

![Deployment Options](https://raw.githubusercontent.com/DependencyTrack/frontend/master/docs/images/Frontend-Deployment.png)

#### Default Deployment
By default, the front-end is deployed to and accessible from the Dependency-Track server.

#### n-Tier Deployment
The front-end may optionally be deployed to a general purpose web server (e.g. NGINX or Apache). To configure the front-end 
for this scenario, simply change the value of API_BASE_URL in static/config.json.

```json
{
  "API_BASE_URL": "https://drack-server.example.com"
}
```

## Internationalization (i18n)

This project supports internationalization. Currently on English language is supported. Pull requests to support additional languages are encouraged.

Note to developers: Textual labels are defined in `src/i18n/messages.json`. Ensure that all labels are defined here and that components use i18n, not textual labels directly.

Copyright & License
-------------------

Dependency-Track is Copyright (c) Steve Springett. All Rights Reserved.

Permission to modify and redistribute is granted under the terms of the 
Apache 2.0 license. See the [LICENSE] file for the full license.

[License]: https://github.com/DependencyTrack/frontend/blob/master/LICENSE
