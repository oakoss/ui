# Label State Machine

Issues and PRs progress through a label-driven state machine. Agents and humans both read these labels to decide what to pick up and where each piece of work stands.

## Status labels (mutually exclusive)

Status describes _where the work is_, not _who picks it up_. Both humans and agents transition Issues through these.

- `status:needs-triage` — newly filed; awaiting maintainer review
- `status:ready` — triaged and free to claim
- `status:in-progress` — actively being worked on
- `status:needs-review` — work is done; awaiting maintainer review
- `status:blocked` — depends on something else; link the blocker in a comment

## Complexity labels (one)

Complexity describes _how much judgment the work needs_, separate from status. Use these to signal which Issues are agent-suitable and which need a senior contributor.

- `complexity:simple` — well-scoped, mechanical, agent-suitable
- `complexity:moderate` — needs some design judgment; agent + maintainer review works well
- `complexity:complex` — architectural impact or cross-cutting; prefer a human contributor

## Type labels (one per Issue)

- `type:bug`
- `type:feature`
- `type:component` — new component proposal
- `type:docs`
- `type:chore`
- `type:proposal` — discussion of a proposal filed in `docs/proposals/`

## Component labels (zero or more)

One per affected component (`component:button`, `component:dialog`, `component:combobox`, etc.) plus cross-cutting areas:

- `area:tokens`
- `area:registry`
- `area:docs-site`
- `area:mcp-server`
- `area:a11y`

## Priority labels (one)

- `priority:critical` — production-affecting; ship within 24h
- `priority:high` — ship in the current week
- `priority:normal` — default; ship in the current milestone
- `priority:low` — nice to have; ship when convenient

## Accessibility labels (zero or more)

- `a11y:wcag-blocker` — blocks WCAG 2.2 AA conformance
- `a11y:i18n` — internationalization concern
- `a11y:rtl` — right-to-left support concern
- `a11y:screen-reader` — screen reader behavior issue
- `a11y:keyboard` — keyboard navigation issue

## Special labels

- `good-first-issue` — accessible to new contributors
- `help-wanted` — actively seeking community contributions
- `breaking-change` — requires a major version bump per semver

## Automation labels (applied by bots)

These live in a separate namespace from the status/type/component labels above. Bots own these; humans don't apply them.

- `dependencies` — Renovate dependency-update PR
- `security` — Renovate security vulnerability alert
- `lockfile` — Renovate lockfile maintenance PR
- Renovate's Dependency Dashboard Issue carries `dependencies` by convention

## Creating labels

Use `gh label create` to create labels. The status labels are shown below as a starting template; extend the same pattern for type, component, area, priority, a11y, special, and automation labels:

```bash
gh label create "status:needs-triage" --color "ededed" --description "Newly filed; awaiting maintainer review"
gh label create "status:ready" --color "0e8a16" --description "Triaged and free to claim"
gh label create "status:in-progress" --color "fbca04" --description "Actively being worked on"
gh label create "status:needs-review" --color "1d76db" --description "Work done; awaiting maintainer review"
gh label create "status:blocked" --color "b60205" --description "Depends on something else"

gh label create "complexity:simple" --color "c2e0c6" --description "Well-scoped, mechanical, agent-suitable"
gh label create "complexity:moderate" --color "fef2c0" --description "Needs some design judgment"
gh label create "complexity:complex" --color "f9d0c4" --description "Architectural impact; prefer a human contributor"
```

A labeler GitHub Action can keep the label set in sync with this file.
