# Glossary

Terms used across the oakoss/ui project.

## Component layers

- **Token** — A named design value (color, spacing, typography). Source of truth is `@oakoss/tokens` as DTCG 2025.10 JSON.
- **Primitive** — A headless, unstyled component from a third-party library (React Aria Components in our case). Provides behavior and accessibility.
- **Styled component** — A primitive wrapped in oakoss/ui's visual language and tokens.
- **Recipe** — A pre-composed pattern combining multiple components (e.g. a sign-in form combining Form + TextField + Button).
- **Slot** — A named insertion point inside a styled component (header, body, footer).

## Distribution

- **Registry** — A shadcn-compatible JSON manifest describing components consumers can install via CLI.
- **Registry item** — A single installable unit (a component, a hook, a recipe).
- **Registry-led** — Our distribution model: components, tokens, and themes ship via the shadcn-compatible registry (copy/paste into consumer repos); npm is reserved for runtime binaries like `@oakoss/mcp-server`. See [decision 002](decisions/002-registry-led-hybrid-distribution.md) and [decision 009](decisions/009-tokens-and-themes-via-registry.md).

## Process

- **Decision** — Record of an architectural choice with context and consequences. Lives in [`decisions/`](decisions/).
- **Proposal** — Written change request awaiting community input before implementation. Lives in [`proposals/`](proposals/).
- **Spec** — Implementation plan written after a decision is made.
- **FCP** — Final Comment Period. The last 3 days of a proposal's comment period; last call for objections before merge.
- **Postmortem** — Blameless writeup of an incident, breaking change, or significant bug.

## Tooling

- **DTCG** — Design Tokens Community Group. W3C community group whose 2025.10 Format Module is our token authoring format.
- **Terrazzo** — DTCG-native build pipeline that compiles tokens to Tailwind, CSS, Sass, JS/TS, vanilla-extract, etc.
- **MCP** — Model Context Protocol. Standard for exposing tools to AI assistants (Claude Code, Cursor, etc.). `@oakoss/mcp-server` ships oakoss/ui's tool surface.
- **shadcn CLI** — The command-line tool consumers use to install registry items.

## Workflow

- **`gh` CLI** — GitHub's command-line tool; the primary interface agents use for Issues and PRs.
- **Issue template** — YAML schema in `.github/ISSUE_TEMPLATE/` that structures new Issues and sets their Issue Type for humans and agents alike.
- **Issue Type** — First-class GitHub classification (Bug, Feature, Task, Epic, Proposal) replacing the old `type:*` labels. See [`governance/issue-types.md`](governance/issue-types.md).
- **Readiness labels** — The triage axis (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) for "can this be picked up, and by whom?" Distinct from work-status, which lives in the project board's Status field. See [`governance/labels.md`](governance/labels.md).
- **Project board** — The [Projects v2 board](https://github.com/orgs/oakoss/projects/1) (Backlog / Board / Roadmap views). Its **Status** field (Todo / In Progress / In Review / Done) is the source of truth for where work sits in the pipeline. See [`governance/projects.md`](governance/projects.md).
