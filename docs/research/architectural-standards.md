# Architectural Standards

- **Status:** Decided — DTCG 2025.10 + Terrazzo; shadcn registry + MCP server pattern; Mitosis dismissed
- **Date:** 2026-05-26
- **Scope:** Standards and integration protocols (tokens, AI assistants, cross-framework compilation)
- **Related:** ADR-0004, ADR-0008

## Decisions

| Area                        | Decision                                                         | Rationale                                                                               |
| --------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Token authoring format      | DTCG 2025.10 (W3C Community Group, first stable Oct 2025)        | Forward-looking; Terrazzo first-party; Tokens Studio Figma round-trip                   |
| Token build pipeline        | Terrazzo (`@terrazzo/parser` + plugins)                          | DTCG-native; plugins for Tailwind, CSS, Sass, JS/TS, vanilla-extract, Swift in one tool |
| AI assistant contract       | shadcn-compliant `registry.json` + per-item `registry-item.json` | Free v0 / shadcn MCP / Cursor / Claude Code compatibility                               |
| AI metadata server          | `@oakoss/mcp-server` (stdio, `npx -y`)                           | Modeled on `npx @ant-design/cli mcp` and `@ui5/mcp-server`                              |
| Component metadata          | `react-docgen` JSON committed per component                      | De-facto React standard; Storybook + most doc generators consume it                     |
| AI assistant entry points   | `AGENTS.md` + `llms.txt` at monorepo root                        | Adobe Spectrum pattern; becoming convention                                             |
| Cross-framework compilation | Dismissed (Mitosis is RAC-incompatible; 2-person project)        | If multi-framework ever needed: per-framework rewrite on shared tokens                  |

## DTCG (Design Tokens Format Module)

### Spec status

First stable version (2025.10) announced 2025-10-28 by the W3C Community Group. **Not a W3C Standard or on the Standards Track**; it is a Community Group Final Report. The 2026-05-07 preview draft carries a `do-not-cite-directly` banner.

### JSON shape

Required: `$value`. Optional: `$type`, `$description`, `$extensions`, `$deprecated`. Standardized `$type` values: `color, dimension, fontFamily, fontWeight, duration, cubicBezier, number`, plus composites `strokeStyle, border, transition, shadow, gradient, typography`. Presence of `$value` definitively marks a node as a token (vs. a group).

### Adopter audit (verify, don't assume)

**Most major DSes are NOT DTCG-compliant in 2026:**

- **Adobe Spectrum** (`@adobe/spectrum-tokens@14.11.0`): uses its own JSON-Schema with `value`/`uuid`; their `package.json` notes "legacy Spectrum token JSON files"
- **IBM Carbon** (`@carbon/themes`): tokens authored as JS exports
- **Shopify Polaris** (`@shopify/polaris-tokens@9.4.2`): the token repo was archived 2022-04; npm still ships v9.4.2 from that frozen source, with JS/CSS/SCSS bindings and no DTCG prefixes
- **shadcn/ui**: flat `cssVars: { theme, light, dark }` map; no `$value`/`$type`

DTCG adoption is real in **tooling** (Style Dictionary v4+, Terrazzo, Tokens Studio), not in established big-vendor token packages. Adobe, Carbon, and Polaris all carry years of migration debt.

### Why we adopt DTCG anyway

oakoss/ui starts fresh. No migration debt. Adopting DTCG buys:

- Tokens Studio Figma round-trip with designers
- Terrazzo's tested plugin matrix (Tailwind v4, CSS, Sass, JS/TS, vanilla-extract, Swift in one shot)
- Style Dictionary v5+ as a fallback build tool
- Forward compatibility with any future tools that align on the spec

### Pipeline

```text
@oakoss/tokens (DTCG JSON source)
       │
       ▼
   Terrazzo
       │
   ┌───┼───┬───┬────────────┐
   ▼   ▼   ▼   ▼            ▼
Tailwind  CSS  Sass  JS/TS  Swift (future)
@theme    vars vars  types  iOS
   │       │    │     │
   └───────┴────┴─────┴──→ shadcn registry-item.json cssVars
```

Ship a generator that emits shadcn-shaped CSS variables alongside the DTCG source. Registry consumers don't need to know we author in DTCG.

## AI integration

### shadcn registry: the de-facto AI contract

`registry-item.json` fields: `$schema, name, title, description, type` (one of `base | block | component | font | lib | hook | ui | page | file | style | theme | item`), `author, dependencies, devDependencies, registryDependencies, files[{path, type, target}], cssVars, css, envVars, font, docs, categories, meta`.

**v0 by Vercel explicitly requires shadcn registry shape.** v0 docs verbatim: _"A registry is a distribution specification designed to pass context from your design system to AI Models."_ Non-shadcn registries are not formally supported by v0.

**shadcn MCP server** works out of the box with any shadcn-compatible registry. Maintain a `registry.json` at a stable public URL; consumers run `pnpm dlx shadcn@latest mcp init --client claude` (or `--client cursor`).

### MCP server package pattern

Convergent pattern from UI5 and Ant Design v6:

| Library           | Package                                | Tools                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI5**           | `@ui5/mcp-server@0.2.11` (85k monthly) | `create_integration_card, create_ui5_app, get_api_reference, get_guidelines, get_integration_cards_guidelines, get_project_info, get_typescript_conversion_guidelines, get_version_info, run_manifest_validation, run_ui5_linter` |
| **Ant Design v6** | `@ant-design/cli@6.4.3` (19k monthly)  | `antd_list, antd_info, antd_doc, antd_demo, antd_token, antd_semantic, antd_changelog` + prompts `antd-expert, antd-page-generator`                                                                                               |

**Pattern**: stdio server invoked via `npx -y`. Tools = docs lookup + code scaffolding + project linting/validation (not playground execution).

### `@oakoss/mcp-server` minimum tool surface for v0.1

- `oakoss_list_components`
- `oakoss_component_props` (returns `react-docgen` JSON)
- `oakoss_component_demo`
- `oakoss_token_query`
- `oakoss_install_recipe`
- (later) `oakoss_lint_usage`

### Component manifest equivalents

**Custom Elements Manifest (CEM)** is real (schemaVersion 1.0.0) but Web Components only, so irrelevant for our RAC-based React DS.

**No equivalent React manifest standard exists in 2026.** The closest is **`react-docgen`**: a JSON blob of props, types, and descriptions extracted from a React source via Babel parse. Not a standard, but ubiquitous (Storybook and most doc generators use it).

### Adobe Spectrum convention

Spectrum ships `llms.txt` (8,647 bytes) and `AGENTS.md` at the repo root. Becoming convention.

## Mitosis: dismissed with evidence

`BuilderIO/mitosis`: two contributors carry the project (`steve8708` = Builder.io CEO; `samijaber`). Activity is sparse. Between v0.12.1 (Jul 2025) and v0.13.0 (Jan 2026) the main branch saw essentially one commit cluster, then four more months quiet through May 2026.

The DSL requires `useStore` (its own) and `<Show>`/`<For>` instead of `if`/`.map()`. **RAC compatibility is essentially zero.** RAC depends on stable React context propagation and refs; Mitosis's static control flow cannot author a RAC composition and emit correct React. Voorhoede's published case study: _"I would not create a design system with Mitosis as its core yet."_

For oakoss/ui, **per-framework rewriting is cheaper than a Mitosis port** because RAC's design has no equivalent in Vue/Svelte/Solid; those rewrites happen regardless. See [`web-components-ecosystem.md`](web-components-ecosystem.md) for the full multi-framework strategy.

## Plasmic / Builder.io visual editors

Plasmic: open-sourced December 2023, MIT, still active (`plasmicapp/plasmic` last commit 2026-05-25, 6,827 stars, not acquired). Low public usage signal. **Defer.** Revisit if demand surfaces.

## What to ship in v0.1 (concrete deliverables)

1. **DTCG 2025.10 authoring** for `@oakoss/tokens` with Terrazzo as the build pipeline
2. **shadcn-compliant `registry.json` + per-item `registry-item.json`** at a stable public URL
3. **`@oakoss/mcp-server`** (stdio, `npx -y` invocation) with the minimum tool surface above
4. **`AGENTS.md` + `llms.txt`** at monorepo root
5. **`react-docgen` JSON outputs** committed per component as the machine-readable prop manifest

## Defer to v1.0+

- DTCG composite types (`typography`, `gradient`) — adopt when the design team needs them
- A second MCP tool surface for live demos (sandpack-as-service)
- Plasmic / Builder.io visual-editor adapters
- A token-name lint rule for DTCG-conformant naming

## Sources

- DTCG: `designtokens.org/TR/drafts/format/`, `w3.org/community/design-tokens/2025/10/28/...` (stable announcement)
- Style Dictionary DTCG support docs
- Terrazzo: `terrazzo.app/docs/integrations`, `terrazzo.app/docs/guides/dtcg/`, plugin pages (Tailwind, CSS, vanilla-extract)
- Adobe Spectrum tokens: `adobe/spectrum-design-data` repo, token-file schema (raw)
- Carbon: `carbon-design-system/carbon/packages/themes/src/white.js` (JS exports, not DTCG)
- shadcn registry docs: `ui.shadcn.com/docs/registry/registry-item-json`, `/registry/mcp`
- v0 design systems docs: `v0.app/docs/design-systems`
- UI5 MCP server: `github.com/UI5/mcp-server`, `@ui5/mcp-server` npm
- Ant Design MCP docs: `github.com/ant-design/ant-design/blob/master/docs/react/mcp.en-US.md`, `@ant-design/cli` npm
- `BuilderIO/mitosis` (gh API), Mitosis quickstart docs, Voorhoede design-system production report
- Plasmic: `plasmicapp/plasmic` (gh API)
- Custom Elements Manifest analyzer docs
- `react-docgen.dev`
