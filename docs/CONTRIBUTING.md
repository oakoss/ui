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

GitHub Issues is the source of truth. The full label state machine and triage flow lives in [`governance/labels.md`](governance/labels.md).

1. Browse Issues labeled `status:ready` (filter by `complexity:simple` or `good-first-issue` for a gentler entry point)
2. Comment to claim, then self-label `status:in-progress`
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
- Self-label `status:needs-review` when ready

## New components and significant changes

Anything that adds API surface, changes tokens, or affects multiple components needs an RFC first. See [`rfcs/`](rfcs/) and [`rfcs/_template.md`](rfcs/_template.md).

Smaller architectural decisions (build pipeline, dependency choices, testing strategy) are captured as ADRs in [`adr/`](adr/).

## Accessibility

Every component must meet [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/), EN 301 549, and Section 508. See [`accessibility/README.md`](accessibility/README.md) for the full testing checklist.

## Code of Conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
