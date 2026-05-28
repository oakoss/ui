# Contributing to oakoss/ui

Thanks for your interest. This project is in foundation phase (pre-v0.1) — architectural decisions are locked, component implementation has not started.

For agent-driven workflows, the same rules live in [`AGENTS.md`](../AGENTS.md).

## Quick start

```bash
git clone git@github.com:oakoss/ui.git
cd ui
pnpm install   # lefthook wires up git hooks via postinstall
```

Required tooling:

- Node.js — version pinned in [`.nvmrc`](../.nvmrc)
- pnpm — version is pinned via `packageManager` in `package.json` (use Corepack: `corepack enable`)

## Issue tracking

GitHub Issues is the source of truth. The label model and triage flow live in [`governance/labels.md`](governance/labels.md); the type axis is in [`governance/issue-types.md`](governance/issue-types.md).

1. Browse Issues labeled `ready-for-human` or `ready-for-agent` (or `good first issue` for a gentler entry point)
2. Comment to claim, then assign yourself — the assignee signals in-progress
3. Branch from `main`: `issue/<number>-<short-slug>`
4. Open a PR with `closes #N` in the description

## Quality gates

Every PR must pass:

```bash
pnpm lint           # oxlint
pnpm format:check   # oxfmt --check
pnpm lint:md        # markdownlint-cli2
```

Lefthook runs these automatically on staged files at `pre-commit`. Don't habitually use `--no-verify`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/). The easiest path is `pnpm commit`, which launches a [cz-git](https://cz-git.qbb.sh/) prompt and produces a valid message.

`commitlint` runs as a `commit-msg` hook and on every PR via CI.

## Pull requests

- Title follows Conventional Commits (e.g. `feat(button): add loading state`)
- Reference the Issue: `closes #N`
- One logical change per PR; split unrelated work
- Mark the PR ready for review (out of draft) when it's done — the open PR is the in-review signal
- Add a changeset for consumer-visible changes (see [Changesets](#changesets))

## Changesets

We use [changesets](https://github.com/changesets/changesets) to manage versions and changelogs. The tooling is **dormant during foundation phase**: until the first **publishable** `@oakoss/*` package lands (e.g. `@oakoss/mcp-server`), both `pnpm changeset` and `pnpm changeset --empty` error with "No versionable packages found" — no per-PR action needed yet. Workspace-only packages like `@oakoss/tokens` and `@oakoss/themes` do not activate the pipeline; see [decision 009](decisions/009-tokens-and-themes-via-registry.md).

Once the first versionable package exists:

```bash
pnpm changeset           # consumer-visible change
pnpm changeset --empty   # docs / CI / internal-only change
```

The CLI prompts for affected packages and bump magnitude. Pre-1.0 semver: **breaking changes bump minor** (`0.1.x` → `0.2.0`), **everything else bumps patch**.

The [`changeset-bot`](https://github.com/apps/changeset-bot) GitHub App (installed on this repo at the app level) comments on PRs that lack a changeset — including empty ones — so the bot's presence is what reminds you, not an in-repo workflow.

**Reviewing changesets:** verify the declared bump magnitude matches the actual changes. A `patch` that's actually breaking will mis-version the release and confuse consumers.

### Addressing review feedback

After each review comment, use **"Resolve conversation"** to close the thread once you've addressed it. Convention:

- **Made a code change**: reply with a one-liner referencing the fix commit (e.g. `Fixed in abc1234`), then resolve
- **No code change needed**: reply with the reasoning, then resolve
- **Disagree with the comment**: reply with your reasoning and leave the thread open for further discussion

Reviewers (and Copilot) track what's pending by which threads are still open. Resolving without addressing is worse than not resolving at all.

## New components and significant changes

Anything that adds API surface, changes tokens, or affects multiple components needs a proposal first. See [`proposals/`](proposals/) and [`proposals/000-template.md`](proposals/000-template.md).

Smaller architectural decisions (build pipeline, dependency choices, testing strategy) are captured as decisions in [`decisions/`](decisions/).

## Accessibility

Every component must meet [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/), EN 301 549, and Section 508. See [`accessibility/README.md`](accessibility/README.md) for the full testing checklist.

## Code of Conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
