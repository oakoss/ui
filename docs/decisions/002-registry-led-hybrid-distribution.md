# Registry-led hybrid distribution

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

oakoss/ui ships internal-first → OSS-later. The distribution model has to work in both phases without forcing a mid-life migration. Most React DSes in 2026 still ship as versioned npm packages (MUI, Mantine, Chakra), but the registry / copy-paste model has become production-grade with shadcn CLI v4 (March 2026), private-registry auth (May 2026), and validated by Openstatus, Origin UI, and JollyUI.

See [`../research/distribution-model.md`](../research/distribution-model.md) for the full comparison.

## Decision

Distribution is a hybrid:

- **Components, recipes, and patterns** ship via a shadcn-compatible registry. Consumers run a CLI to copy source files into their own repos.
- **Tokens and shared utilities** (`@oakoss/tokens`, `@oakoss/mcp-server`, future `@oakoss/theme-*`) ship as small versioned npm packages.
- **`react-aria-components`** is consumed transitively as a peer dependency declared by each registry item.

## Consequences

Easier: low-friction internal adoption (no version negotiation across app teams), consumer ownership of styled source, no distribution mechanic to swap at OSS launch.

Harder: shipping fixes to existing consumers is harder than `npm update`. Mitigations: keep behavior in the RAC primitive layer so bug fixes flow transitively, keep copied files thin (Spectrum UI's wrapper pattern), run `shadcn diff` in CI internally so app teams get nudged, and use postmortems publicly to broadcast significant fixes.

## Alternatives considered

- **Versioned npm packages only** (Mantine, Chakra, Radix Themes). Volume leader, but carries an RSC tax and a customization tax. Chakra v3 downloads dipped during the v2→v3 rewrite — instructive on the upgrade tax.
- **Pure-primitives-as-npm + styled-as-registry split** (where MUI is heading). Park UI's late-2024 pivot from `@park-ui/panda-preset` to pure registry shows the npm half is consolidating to ~2 winners that should be consumed, not built.
