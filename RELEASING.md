# Releasing the OWASP Dependency-Track Frontend

This document describes the process of releasing a new version of the Dependency-Track Frontend via GitHub Actions.

## Releasing

### Release a new major of minor version

1. Ensure the current state in `master` is ready to be released
2. Head over to the *Actions* tab in GitHub
3. Select the *Release CI* entry in the *Workflows* section
4. The following UI element will have a button to trigger the workflow. Once clicked, the Use workflow from dialog will appear:

![Create a release from `master`](./.github/images/release-master.png)

5. Ensure that `master` is selected in the branch dropdown
6. Select the part that should be bumped for this release (see [Semantic Versioning](https://semver.org/))
7. Finally, once all inputs are checked press the *Run Workflow* button
8. **Manually** create a release branch by selecting `master` in the branch dropdown and entering the branch name:

![Create a release branch](./.github/images/)

### Release a new bugfix version

> **Warning**
> This process is currently only semi-automated and involves manual execution of the steps defined in [`ci-release.yaml`](.github/workflows/ci-release.yaml).
> Besides NPM, the [GitHub CLI](https://cli.github.com/) is required. Ensure the CLI is configured for authenticated use (`gh auth login`).

1. Ensure the current state in the release branch is ready to be released
2. Clone the repository and checkout the release branch:
```shell
git clone https://github.com/DependencyTrack/frontend
cd frontend
git checkout 4.6.x
```
3. Run `npm version` to automatically bump the project version, commit and tag this change:
```shell
npm version patch -m "prepare-release: set version to %s"
```
4. Push this change:
```shell
git push origin
```
5. Create a GitHub release:
```shell
VERSION=`jq -r '.version' package.json`
gh release create "${VERSION}" --title "${VERSION}" --notes-file ".github/default-release-notes.md"
```
6. This will kick off the `ci-publish.yaml` workflow, which will build and push the container images, as well as update the previously created release with build artifacts
