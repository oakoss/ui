# ADR-0008: AI integration via shadcn registry + @oakoss/mcp-server

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

oakoss/ui has to be legible to AI assistants (v0, shadcn MCP, Cursor, Claude Code) from v0.1. v0 by Vercel explicitly requires shadcn registry shape; v0 docs verbatim describe a registry as "a distribution specification designed to pass context from your design system to AI Models." The shadcn MCP server works out of the box with any shadcn-compatible registry at a stable public URL.

The MCP-server-package pattern is convergent: UI5 (`@ui5/mcp-server`, 85k monthly) and Ant Design v6 (`npx @ant-design/cli mcp`, 19k monthly) both ship stdio servers invoked via `npx -y`, exposing docs lookup + code scaffolding + project linting tools (not playground execution). Adobe Spectrum ships `AGENTS.md` and `llms.txt` at repo root — that pair is becoming convention.

`react-docgen` is the only ubiquitous React component-manifest format. Custom Elements Manifest is real but Web Components only.

See [`../research/architectural-standards.md`](../research/architectural-standards.md) for the v0.1 tool surface and convention sources.

## Decision

The AI integration surface for v0.1 ships five concrete artifacts:

1. **shadcn-compliant `registry.json` + per-item `registry-item.json`** at a stable public URL.
2. **`@oakoss/mcp-server`** (stdio, `npx -y` invocation) with minimum tools `oakoss_list_components`, `oakoss_component_props` (returns `react-docgen` JSON), `oakoss_component_demo`, `oakoss_token_query`, `oakoss_install_recipe`. (Later: `oakoss_lint_usage`.)
3. **`AGENTS.md`** at monorepo root (Adobe Spectrum convention).
4. **`llms.txt`** at monorepo root (Adobe Spectrum convention).
5. **`react-docgen` JSON outputs** committed per component as the machine-readable prop manifest.

## Consequences

Easier: v0, shadcn MCP, Cursor, and Claude Code all work once the registry URL is stable. The MCP server gives us a versioned, installable tool surface that consumers can pin. `react-docgen` JSON unlocks Storybook docs generation as a side effect.

Harder: every component needs both a registry item and a `react-docgen` JSON output kept in sync. Automate in CI rather than relying on author discipline. `AGENTS.md` and `llms.txt` need the same discipline; regenerate both from source on release.

New risks: MCP is a moving spec, and the stdio + `npx -y` convention is current best practice but may shift. Keep the server surface narrow (docs lookup, scaffolding, lint; not playground execution) to limit blast radius if tools change.

## Alternatives considered

- **Ship `@oakoss/cli` (Ant Design pattern).** Considered and dropped for v0.1 — `@oakoss/mcp-server` alone covers the AI-assistant tool surface. Ant Design's `@ant-design/cli` remains a useful comparative reference.
- **Custom Elements Manifest as the metadata format.** Web Components only; irrelevant for a RAC-based React DS.
- **Defer AI integration to v0.2.** v0 and shadcn MCP are table stakes in 2026; deferring would put oakoss/ui behind shadcn/ui's own surface.
