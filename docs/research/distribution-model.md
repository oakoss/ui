# Distribution Model

- **Status:** Decided — Registry-led hybrid
- **Date:** 2026-05-26
- **Scope:** How oakoss/ui ships components, tokens, and tooling to consumers
- **Related:** [decision 002](../decisions/002-registry-led-hybrid-distribution.md)

## Decision

Registry-led hybrid distribution:

- **Components, recipes, and patterns** ship via a shadcn-compatible registry. Consumers run a CLI to copy source files into their own repos.
- **Tokens and shared utilities** (`@oakoss/tokens`, `@oakoss/mcp-server`, eventually `@oakoss/theme-*`) ship as small versioned npm packages.
- **Primitive layer** (`react-aria-components`) is consumed transitively. Consumers install it directly per the registry items' instructions.

## Context

oakoss/ui targets internal-first → OSS-later. The distribution model needs to work at both phases without forcing a migration when we flip the project public.

## Options evaluated

### Registry / copy-paste (shadcn-style)

The default assumption for new React design systems in mid-2026. shadcn CLI v4 (March 2026) plus `registry include`, `registry validate`, namespaces, and private-registry auth (May 2026) have made it production-grade for enterprise. State of React 2025 shows it as the fastest-growing consumption pattern (Stack Overflow 2025 at 8.7%).

### Versioned npm packages (Mantine v8, Chakra v3, Radix Themes)

Still the volume leader (MUI ~6.7M weekly, Mantine ~500k, Chakra ~533k). Momentum is mixed. The model carries an RSC tax (high `"use client"` boundaries from context-heavy theming) and a customization tax (overrides require className gymnastics or forking). Chakra v3 downloads dipped post-rewrite as teams stalled on v2→v3.

### Hybrid (unstyled primitives as npm + styled compositions as registry)

The architecturally cleanest model and where MUI is moving (Base UI v1.1 stable; shadcn ships components for both Radix and Base UI). Park UI's pivot is instructive: it dropped its `@park-ui/panda-preset` npm package in late 2024 and went pure registry. Ark UI's modest ~311k weekly downloads suggest the "primitives as npm" half is consolidating to ~2 winners (Radix, Base UI) that should be **consumed**, not built.

## Reasoning

Internal-first → OSS-later is exactly what the registry model solves and exactly what the npm model punishes:

- **Internally:** zero-friction adoption (no version negotiation across app teams), consumers own and can patch their copies, no breaking-change panic
- **At OSS launch:** no distribution mechanic change. Flip auth on the namespace and submit to `registry.directory`.
- **Openstatus's writeup** is the canonical proof. Every other approach (tsup bundling, webpack aliases, monorepo packages) failed; registry won.

The hybrid layering accepts that some surfaces benefit from semver (tokens, MCP server, theme packages) and others benefit from consumer ownership (components, recipes).

## Hybrid specifics

- Most surface area (components, recipes, patterns) ships via registry. Consumers own the source and can patch.
- `@oakoss/tokens` ships as a versioned npm package. Semver makes sense for tokens because visual changes need to be coordinated across consumers.
- `@oakoss/mcp-server` ships as a versioned npm package; the AI assistant tool surface needs to be installable.
- `@oakoss/theme-default`, `@oakoss/theme-brand-x` ship as versioned npm packages for multi-brand theming.
- `react-aria-components` is the primitive layer; registry items list it as a peer dependency.

## Risks

**Shipping fixes to existing consumers is harder than `npm update`.** Once a team copies a `Combobox`, our security/a11y/RSC fix sits in their repo until they re-run the CLI.

Mitigations:

- Keep behavior in the npm primitives layer (RAC) so bug fixes flow through transitively
- Keep copied files thin and composition-heavy (Spectrum UI's "wrapper pattern")
- Ship a `shadcn diff` CI check internally so app teams get nudged when registry items drift
- Use the postmortem process publicly when significant fixes need broadcast (see [`../postmortems/`](../postmortems/))

## References to study

- **Openstatus** (`openstatus.dev/blog/shadcn-component-registry`): the canonical writeup of building an internal shadcn registry. Their `@openstatus/ui`-as-alias find-replace trick avoids the `@/` alias collision that kills most first attempts.
- **Origin UI**: closest analog to our ambition (hundreds of components, registry-distributed, recently moved onto Base UI). Shows "registry as a serious component library" at scale.
- **Park UI**: cautionary hybrid. Started with `@park-ui/panda-preset` on npm, discontinued that package, and went pure source-distributed in late 2024.

## Sources

- shadcn/ui Registry docs (`ui.shadcn.com/docs/registry`)
- shadcn changelog: 2026-01 (Base UI registry), 2026-02 (unified Radix UI Package), 2026-05 (package imports & target aliases)
- shadcn Authentication for Private Registries docs
- State of React 2025 — Component Libraries section
- Openstatus blog: "How We Built Our shadcn Component Registry"
- Park UI Changelog (npm preset discontinuation)
- LogRocket: "I tried shadcn CLI 4.0" (March 2026)
- Spectrum UI: "How to Make shadcn Components Actually Yours"
