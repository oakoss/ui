# `@oakoss/mcp-server` narrowed (decision 008 partial supersede)

- **Status:** Accepted
- **Date:** 2026-05-27
- **Authors:** @jbabin91

## Context

[Decision 008](008-ai-integration-shadcn-registry-and-mcp.md) bundled five artifacts under "AI integration" — a shadcn registry surface, a `@oakoss/mcp-server` binary with an enumerated tool list, an `AGENTS.md` at root, an `llms.txt` at root, and `react-docgen` JSON per component. On re-examination against the scope discipline added to [`./README.md`](README.md), two of those five are doing different work than the rest:

- The **shadcn `registry.json` + `registry-item.json` surface** is the project's distribution channel, not an AI-specific commitment. It is already decided by [decision 002](002-registry-led-hybrid-distribution.md) (and narrowed for tokens/themes by [decision 009](009-tokens-and-themes-via-registry.md)). Restating it inside decision 008 implies AI integration is the reason we picked shadcn, when in reality the distribution choice stands on its own and the AI tooling benefits transitively.
- The **specific MCP tool list** (`oakoss_list_components`, `oakoss_component_props`, `oakoss_component_demo`, `oakoss_token_query`, `oakoss_install_recipe`) is an implementation detail of an as-yet-unbuilt server. Naming the tools at ADR time pre-commits to an API surface without the implementation pressure that usually shapes it. Per the "Scope tightly" guidance, that belongs in a [proposal](../proposals/) when the server is actually scaffolded, not in a decision now.

The remaining four commitments in 008 (`@oakoss/mcp-server` existence + stdio/`npx -y` invocation, `AGENTS.md` at root, `llms.txt` at root, `react-docgen` per component) still belong as architectural decisions.

## Decision

This decision narrows decision 008 in two specific places:

- **The shadcn registry-discovery claim is dropped from the AI integration scope.** It remains the project's distribution channel per decisions 002 and 009, not an artifact of AI integration. AI clients (v0, shadcn MCP, Cursor, Claude Code) benefit from a public, shadcn-shaped registry transitively — that is a consequence of the distribution decision, not a separate AI commitment.
- **The specific `@oakoss/mcp-server` tool surface is removed from ADR scope and routes to a future proposal.** When the server is actually scaffolded, file a proposal under [`../proposals/`](../proposals/) enumerating the tool list, prompt templates, and any resource exposures. The proposal is the right surface for argued-over implementation details that may change before the server ships.

The rest of decision 008's commitments stand without modification:

- `@oakoss/mcp-server` is the binary AI tool surface for oakoss/ui consumers — stdio transport, `npx -y` invocation, narrow scope (docs lookup, scaffolding, lint — not playground execution).
- `AGENTS.md` at the monorepo root (Adobe Spectrum convention; already present in this repo).
- `llms.txt` at the monorepo root (same convention; not yet present).
- `react-docgen` JSON committed per component as the machine-readable prop manifest.

## Consequences

Easier:

- The AI integration ADR is about the binary commitment, not about every detail of how that binary works. Reading 010 plus the future tool-surface proposal gives a future contributor the same information that 008's enumerated list did, with cleaner separation between architectural commitment and implementation choice.
- The shadcn registry-distribution decision lives in one place ([002](002-registry-led-hybrid-distribution.md) / [009](009-tokens-and-themes-via-registry.md)). AI tooling is a consequence, not a separate commitment to maintain.
- The MCP tool surface can iterate freely as a proposal until the server ships. Renaming `oakoss_component_props` to `oakoss_get_component_metadata`, for example, does not require an ADR amendment.

Harder:

- One more cross-reference for readers: the full AI integration story now spans 008 + 010 + (eventually) the tool-surface proposal. The cross-references are explicit; this is the same pattern 002 + 009 already established.
- The tool surface lives in a proposal, which by convention can be revised before merge but is more lightweight than an ADR after. If we later want to lock specific tools, file a follow-up decision that supersedes the proposal.

## Alternatives considered

- **Leave decision 008 as-is.** Five-artifact bundle is fine if you accept ADRs can mix architectural commitments with conventions and implementation details. Rejected because the demote-005/006/007 pass and the scope-discipline addition in [`./README.md`](README.md) committed us to a tighter ADR style. Consistency matters once the discipline is written down.
- **Aggressively restructure 008.** Pull `AGENTS.md`, `llms.txt`, and `react-docgen` choices into separate decisions or research notes. Rejected because this pass targets the registry-discovery and tool-list overreach; a full restructure risks undoing more than intended. `AGENTS.md` / `llms.txt` are convention choices that arguably belong in a research note; `react-docgen` is more load-bearing. Worth revisiting if 008's remaining scope feels too broad.
- **Write the tool-surface proposal now.** Rejected per scope discipline — the server is not yet scaffolded, and committing to a tool surface before there is implementation pressure is exactly the pattern this discipline exists to prevent.
