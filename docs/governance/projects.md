# Project board (Projects v2)

Work is tracked on the org-level **[oakoss/ui project board](https://github.com/orgs/oakoss/projects/1)** (Projects v2), linked to this repo. It's a view over the repo's Issues — it doesn't replace [Issue Types](issue-types.md) or the [readiness labels](labels.md); it adds work-status and roadmap tracking on top.

## Views

- **Backlog** (table) — the full issue list; filter and sort.
- **Board** (kanban, grouped by Status) — the work pipeline.
- **Roadmap** (timeline, grouped by Milestone) — the v0.1 → v1.0 arc.

## Fields

| Field                              | Type          | Notes                                                                           |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| **Status**                         | single-select | Todo / In Progress / In Review / Done — the work-status source (see below)      |
| **Priority**                       | single-select | P0 / P1 / P2 — backlog ordering                                                 |
| **Iteration**                      | iteration     | time-boxing; unused until iterations are defined                                |
| Milestone                          | built-in      | mirrors the Issue milestone (`v0.1` / `v0.2` / `v1.0`); drives the Roadmap view |
| Parent issue / Sub-issues progress | built-in      | epic → sub-issue rollup                                                         |

## Status field

The **Status** field is the source of truth for where work sits in the pipeline — not labels (there is no `status:*` label) and no longer inferred from native signals. The [readiness labels](labels.md) remain a _separate_ axis answering "can this be picked up, and by whom?" (intake), while Status answers "where is it in the pipeline?" (workflow).

Automation covers only the ends of the pipeline; the middle is manual:

- **Todo** — set automatically when an item is added (built-in workflow).
- **In Progress / In Review** — moved **by hand** (GitHub has no built-in "assigned → In Progress" or "PR opened → In Review" workflow). Set Status when you start work and when you open a PR.
- **Done** — set automatically when the issue closes or its PR merges (built-in workflow).

## Conventions

- New issues are added to the board (auto-add workflow, or `gh project item-add`).
- Set **Priority** during triage; leave **Iteration** unset until the project actually time-boxes.
- Epics ([Issue Type](issue-types.md) `Epic`) and their sub-issues both appear; the board groups by parent via the built-in Sub-issues fields.

## What's scriptable vs. UI-only

`gh` / the GraphQL API can manage the **data and schema** — create the project, fields (iteration via GraphQL only), items, and field values. **Views** (layout, grouping, sorting) and **workflow automations** are **UI-only**; there is no API to create or configure them.
