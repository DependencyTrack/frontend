# Releasing OWASP Dependency-Track Frontend

This document describes the process of releasing a new version of the Dependency-Track Frontend.

## Patch Releases

Patch releases (e.g. `5.0.1`) ship bugfixes and security fixes off a release branch.
No new features, no breaking changes.

> [!IMPORTANT]
> Backport, don't forward-port. Merge the fix on `main` first, then cherry-pick onto the patch branch.
> Direct commits on the patch branch are fine for fixes that no longer apply to `main`.

### 1. Cut or check out the patch branch

First patch in a series, branched from the GA tag:

```shell
git checkout -b 5.0.x 5.0.0
git push -u origin 5.0.x
```

Subsequent patches:

```shell
git checkout 5.0.x
git pull
```

Versions are set by the [Release CI], so there is nothing to bump by hand.

### 2. Cherry-pick backports

Open one PR per backport against the patch branch, using the branch name `backport-pr-<original-PR-number>`:

```shell
git checkout -b backport-pr-1234 5.0.x
git cherry-pick -x -s <sha>
```

Resolve any conflicts, then `git cherry-pick --continue`.

> [!TIP]
> Claude Code users can run `/backport <original-PR-number> [target-branch]` to automate this step.
> See [`.claude/skills/backport`](./.claude/skills/backport/SKILL.md).

Localization files (`src/i18n/locales/*.json`) conflict easily, since keys are sorted and every
locale carries every key. Take only the keys the backported commit touches, and run
`npm run prettier-fix` to restore ordering.

### 3. Run the release

Once CI is green on the patch branch, follow the [Stable Version](#stable-version) workflow below,
selecting the patch branch (e.g. `5.0.x`) for the **Branch** parameter and the patch version
(e.g. `5.0.1`) for **Release version**.

## Releasing

### Stable Version

To release a new stable version such as `5.1.0`:

1. Ensure the current state in the target branch is ready to be released.
2. Navigate to the [Release CI] workflow.
3. Run the workflow with the following parameters:

- **Branch**: Select the branch to release from (e.g. `main` for new releases, `5.1.x` for bugfixes, see [Patch Releases](#patch-releases)).
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
