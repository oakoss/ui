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
- **Registry-led hybrid** — Our distribution model: components ship via registry (copy/paste into consumer repos), tokens and shared utilities ship as small npm packages.

## Process

- **ADR** — Architecture Decision Record. Point-in-time decision with context and consequences.
- **RFC** — Request for Comment. Formal proposal awaiting community input.
- **Spec** — Implementation plan written after a decision is made.
- **FCP** — Final Comment Period. The last 3 days of an RFC's comment period; last call for objections before merge.
- **Postmortem** — Blameless writeup of an incident, breaking change, or significant bug.

## Tooling

- **DTCG** — Design Tokens Community Group. W3C community group whose 2025.10 Format Module is our token authoring format.
- **Terrazzo** — DTCG-native build pipeline that compiles tokens to Tailwind, CSS, Sass, JS/TS, vanilla-extract, etc.
- **MCP** — Model Context Protocol. Standard for exposing tools to AI assistants (Claude Code, Cursor, etc.). `@oakoss/mcp-server` ships oakoss/ui's tool surface.
- **shadcn CLI** — The command-line tool consumers use to install registry items.

## Workflow

- **`gh` CLI** — GitHub's command-line tool; the primary interface agents use for Issues, PRs, and Projects.
- **Issue template** — YAML schema in `.github/ISSUE_TEMPLATE/` that structures new Issues for humans and agents alike.
- **Label state-machine** — Status labels (`status:ready`, `status:in-progress`, `status:needs-review`, etc.) that an Issue moves through, plus an orthogonal `complexity:*` axis that signals which work is agent-suitable. See [`governance/labels.md`](governance/labels.md).
- **GitHub Projects v2** — Project board for the roadmap view; one project per release phase.
