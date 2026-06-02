# Releasing OWASP Dependency-Track Frontend

This document describes the process of releasing a new version of the Dependency-Track Frontend.

## Releasing

### Stable Version

To release a new stable version such as `5.1.0`:

1. Ensure the current state in the target branch is ready to be released.
2. Navigate to the [Release CI] workflow.
3. Run the workflow with the following parameters:

- **Branch**: Select the branch to release from (e.g. `main` for new releases, `5.1.x` for bugfixes).
- **Release version**: Specify a custom version (e.g. `5.1.0`), or leave empty to use NPM's version bumping.
- **Version bump type**: Select the bump type (e.g. `minor` to bump `5.0.0` to `5.1.0`). Ignored when _Release version_ was specified.
- **Dry run**: Enable to test the release process without making any changes.

### Release Candidate

To release a prerelease such as `5.2.0-rc.1`:

1. Ensure the current state in the target branch is ready to be released.
2. Navigate to the [Release CI] workflow.
3. Run the workflow with the following parameters:

- **Branch**: Select the branch (usually `main`).
- **Release version**: Enter the prerelease version (e.g. `5.2.0-rc.1`).
- **Version bump type**: Leave empty.

[Release CI]: https://github.com/DependencyTrack/frontend/actions/workflows/ci-release.yaml
