# Labels

oakoss/ui classifies work with **GitHub Issue Types** (the type axis) plus a small set of **labels** (readiness, area, and a few special/automation flags). Issue lifecycle state is read from native GitHub signals, not labels — see [Readiness vs. status](#readiness-vs-status).

For the type axis (Bug, Feature, Epic, Proposal, Task), see [`issue-types.md`](issue-types.md).

## Readiness labels (one)

Readiness answers "can this be picked up, and by whom?" Every Issue carries exactly one at a time.

- `needs-triage` — newly filed; awaiting maintainer evaluation
- `needs-info` — waiting on the reporter for more information
- `ready-for-agent` — fully specified; an AFK agent can pick it up with no extra context
- `ready-for-human` — ready to implement; needs a human (design judgment or cross-cutting work)
- `wontfix` — will not be actioned

This is the vocabulary the [`triage` skill](../agents/triage-labels.md) applies.

## Readiness vs. status

We deliberately do **not** track a `status:*` lifecycle (in-progress, in-review, blocked). Those states are already legible from native GitHub signals:

- **In progress** → the Issue has an assignee
- **In review** → a linked PR is open
- **Blocked** → an open sub-issue or tracked dependency

Labels for them would duplicate signals GitHub already maintains.

## Area labels (zero or more)

Cross-cutting areas, for filtering:

- `area:tokens` — tokens package and token pipeline
- `area:registry` — registry distribution
- `area:docs-site` — documentation site
- `area:mcp-server` — MCP server
- `area:a11y` — cross-cutting accessibility

Per-component labels (`component:button`, …) are added lazily as components ship, not pre-created.

## Special labels

- `good first issue` — accessible to new contributors
- `help wanted` — actively seeking community contributions
- `breaking-change` — requires a version bump (pre-1.0: minor; 1.0+: major)

## Automation labels (bot-owned)

- `dependencies` — Renovate dependency-update PR
- `security` — security vulnerability (Renovate or advisory)
- `lockfile` — Renovate lockfile maintenance PR

## Deferred until code exists

Specialized accessibility labels (`a11y:wcag-blocker`, `a11y:i18n`, `a11y:rtl`, `a11y:screen-reader`, `a11y:keyboard`) and per-component labels are provisioned once there's component code to apply them to.

## Provisioning

Labels are created with `gh label create`. The current set was provisioned directly; recreate with `--force` if it drifts:

```bash
gh label create "needs-triage"    --color ededed --description "Newly filed; awaiting maintainer evaluation" --force
gh label create "needs-info"      --color fbca04 --description "Waiting on the reporter for more information" --force
gh label create "ready-for-agent" --color 0e8a16 --description "Fully specified; an AFK agent can pick it up" --force
gh label create "ready-for-human" --color 1d76db --description "Ready to implement; needs a human" --force
gh label create "area:tokens"     --color c5def5 --description "Tokens package and token pipeline" --force
gh label create "area:registry"   --color c5def5 --description "Registry distribution" --force
gh label create "area:docs-site"  --color c5def5 --description "Documentation site" --force
gh label create "area:mcp-server" --color c5def5 --description "MCP server" --force
gh label create "area:a11y"       --color c5def5 --description "Cross-cutting accessibility" --force
gh label create "breaking-change" --color b60205 --description "Breaking change requiring a version bump" --force
gh label create "security"        --color d93f0b --description "Security vulnerability (Renovate or advisory)" --force
```

`wontfix`, `good first issue`, and `help wanted` (GitHub repo defaults) plus `dependencies`/`lockfile` (Renovate-managed) are kept as-is and aren't recreated here.

A declarative label-sync GitHub Action could keep the repo in sync with this file later.
