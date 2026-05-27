# Release Strategy

- **Status:** Implemented in PR #7 (commit `bec1420`, 2026-05-27). Reviewed and unlikely to change near-term; revisit if pnpm Corepack drifts or npm OIDC trusted publishing semantics shift.
- **Date:** 2026-05-27
- **Scope:** How `@oakoss/*` packages get versioned, changelogged, and published to npm. Internal release tooling, not a consumer-facing contract.
- **Related:** [decision 009](../decisions/009-tokens-and-themes-via-registry.md) (workspace-only packages do not activate the pipeline), [AGENTS.md](../../AGENTS.md) `## Releases (changesets)`, [CONTRIBUTING.md](../CONTRIBUTING.md) `## Changesets`

## Why this is research, not a decision

Internal release tooling does not bind component code or external consumers — they see published artifacts, not the pipeline that produced them. By the rule codified in [`../decisions/README.md`](../decisions/README.md) (`When NOT to write a decision`: internal tooling and vendor choices), the release pipeline belongs here as a recommendation/recording, not as an ADR. Decisions like Chromatic ([005](visual-testing-with-chromatic.md)), Storybook addon-a11y ([006](accessibility-testing-with-storybook-addon-a11y.md)), and Fumadocs ([007](fumadocs-on-tanstack-start-for-docs.md)) were demoted on the same grounds.

## Pipeline overview

1. Per-PR: contributors run `pnpm changeset` (or `pnpm changeset --empty` for docs/CI-only changes). The CLI emits a markdown file in `.changeset/` declaring affected packages + bump magnitudes.
2. On push to `main`: `.github/workflows/release.yml` runs `changesets/action`. If pending changesets exist, the action opens/updates a release PR titled `chore(release): version packages` that bumps `package.json` versions and writes `CHANGELOG.md` entries.
3. When the release PR merges: the same workflow runs `pnpm release` (which calls `changeset publish`) to publish to npm via OIDC trusted publishing. Provenance is enabled via `.npmrc`, so published artifacts carry build attestation.

## Specific config choices and reasoning

### Changesets over alternatives

| Option                | Why not                                                                                                                                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `semantic-release`    | Implicit versioning derived from commit messages. Works well for single-package repos; weaker fit for multi-package monorepos where contributors should explicitly state which packages they're bumping. The "guess from conventional commit prefix" model also makes pre-1.0 inverted-bump conventions harder to express. |
| `release-it`          | Single-package focus; needs custom orchestration to bump multiple packages from one PR.                                                                                                                                                                                                                                    |
| Manual `pnpm publish` | Fine for one or two packages; doesn't scale to `@oakoss/mcp-server` + possible future npm-published packages. No changelog automation. (`@oakoss/tokens` and `@oakoss/themes` are workspace-only per [decision 009](../decisions/009-tokens-and-themes-via-registry.md), so they don't factor into this count.)            |
| `changesets`          | Author declares bump magnitude per package in a markdown file the PR review can see and discuss. Native pnpm `workspace:*` support via `bumpVersionsWithWorkspaceProtocolOnly`. The auto-maintained "Version Packages" PR is the right surface for batching multiple changes into one release.                             |

### npm OIDC trusted publishing over `NPM_TOKEN`

npm trusted publishing (GA in 2025) lets GitHub Actions publish without a long-lived `NPM_TOKEN` secret. The workflow declares `id-token: write` permission; npm verifies the request via OIDC against the registered trusted publisher (this repo + this workflow file).

- Eliminates a secret rotation surface. `NPM_TOKEN` rotation has been a recurring source of release-day breakage in OSS projects.
- Per-package registration on npmjs.com makes the trust relationship explicit and auditable.
- Combined with `provenance=true` in `.npmrc`, published artifacts carry SLSA build attestation, which `npm audit signatures` and supply-chain scanners can verify.

Trade-off: each new `@oakoss/*` package requires a one-time trusted publisher registration on npmjs.com before its first publish. Documented in AGENTS.md's release flow step 3.

### Pre-1.0 semver: breaking → minor, everything else → patch

The conventional reading of semver pre-1.0 is "anything goes; 0.x is unstable." That gives consumers no signal at all. Pre-1.0 oakoss/ui follows the **breaking → minor** convention instead:

- Patch (`0.1.1` → `0.1.2`): non-breaking changes (additions, fixes)
- Minor (`0.1.x` → `0.2.0`): breaking changes
- Major (`0.x` → `1.0`): the v1 stability commitment

This is the convention the changesets docs themselves describe for pre-1.0 projects; Radix UI 0.x packages followed a similar pattern during their pre-stable period. Changeset reviewers verify the declared bump magnitude matches the actual change — a `patch` that's actually breaking will mis-version the release and confuse consumers.

### `commitMode: github-api`

`changesets/action` defaults to git CLI commits. The org has a `required_signatures` ruleset that rejects unsigned commits. `commitMode: github-api` makes the action use GitHub's REST API to author commits, which GitHub auto-signs with its bot key. The Version Packages PR + release tags all carry valid signatures without needing to manage a bot GPG key.

### `cancel-in-progress: true`

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Multiple pushes to `main` in quick succession would otherwise queue multiple release-action runs that race. Cancelling in-progress is safe because `changeset publish` is idempotent — npm rejects duplicate version publishes, so a cancelled-and-restarted publish either republishes (no-op) or publishes the missing piece.

### `bumpVersionsWithWorkspaceProtocolOnly: true`

pnpm uses `workspace:*` to reference sibling packages inside the monorepo. With this flag, changesets only rewrites `workspace:*` ranges to concrete versions in published `package.json`s — leaving regular `npm:` ranges alone. Matches our intended workspace structure where internal deps use the workspace protocol.

### `privatePackages: { version: false, tag: false }`

Our workspace root (`package.json` at the repo root) is `"private": true`. With this config, changesets ignores it entirely — no version bumps, no git tags. The foundation-phase "no versionable packages found" state is intentional, not an error.

### `prettier: false`

Changesets defaults to running Prettier on generated files. We use oxfmt, not Prettier. Disabling Prettier here prevents changesets from trying to invoke a tool we don't have installed.

### `release:version` runs `pnpm install --lockfile-only` and `pnpm format`

```jsonc
"release:version": "changeset version && pnpm install --lockfile-only && pnpm format"
```

`changeset version` rewrites `package.json` versions but doesn't update `pnpm-lock.yaml`. Without the lockfile update, CI on the Version Packages PR would fail `pnpm install --frozen-lockfile`. The pattern is taken from Cloudflare Wrangler's `changeset-version.js`. `pnpm format` keeps the regenerated files within our oxfmt style so the PR is mergeable without a follow-up format commit.

## Foundation-phase dormancy

`pnpm changeset` and `pnpm changeset --empty` both error with "No versionable packages found" until the first **publishable** `@oakoss/*` package lands (e.g. `@oakoss/mcp-server`). Workspace-only packages like `@oakoss/tokens` and `@oakoss/themes` do not activate the pipeline per [decision 009](../decisions/009-tokens-and-themes-via-registry.md) — they are never npm-published.

The release workflow runs on every push to `main` during foundation phase but is a no-op without changesets. The Skip-the-changeset-step guidance in AGENTS.md and CONTRIBUTING.md reflects this dormancy.

## Gotchas observed during setup

- **The `changeset-bot` GitHub App is repo-level, not an in-repo workflow.** It comments on PRs missing a changeset, including the "satisfies bot reminder without triggering a release" empty changeset case. Install at the app level on the repo; not configurable in `.github/`.
- **The org tag ruleset originally covered `refs/tags/v*` only.** Scoped npm package tags use the `@oakoss/<pkg>@<version>` format, which is `refs/tags/@oakoss/<pkg>@<version>`. The ruleset needed extending to `refs/tags/@*` for changesets-generated tags to pass.
- **`CHANGELOG.md` files would otherwise trip the formatter and the markdown linter.** Both tools were excluded:
  - `.markdownlint-cli2.mjs` `ignores`: `['**/CHANGELOG.md', '.changeset/*-*.md']`
  - `.oxfmtrc.json` `ignorePatterns`: `'**/CHANGELOG.md'`, `'.changeset/*-*.md'`
- **pnpm's `minimumReleaseAge` setting** is a supply-chain protection that delays new package versions from being installable (commonly set to `1440` / 24h, as in pnpm's own monorepo). The field is undefined by default per current pnpm `Config.ts`. Worth knowing about; doesn't affect our publish flow but affects how soon consumers can pin a release after it ships.

## Alternatives considered for `NPM_TOKEN`-era hardening

If trusted publishing weren't an option (e.g., for a registry that didn't support OIDC), the fallback chain would be:

1. Short-lived granular access tokens scoped to specific packages
2. GitHub Environments with manual approval for the `release` job
3. Provenance still enabled via `.npmrc` for build attestation

Trusted publishing collapses all three into one mechanism.

## Sources

- Changesets docs and `@changesets/cli` `v2.31.0` (`github.com/changesets/changesets`)
- `changesets/action@v1.8.0` SHA-pinned to `63a615b9cd06ba9a3e6d13796c7fbcb080a60a0b` (verified via gh API)
- npm trusted publishing docs at `docs.npmjs.com/trusted-publishers` (feature reached GA in 2025; specific announcement date not traceable from current docs)
- GitHub Actions OIDC docs (`docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect`)
- Cloudflare Wrangler `changeset-version.js` pattern as the reference for the lockfile+format step in `release:version`
- The `commitMode: github-api` option was added in `changesets/action` v1.5 specifically for orgs that enforce signed commits
