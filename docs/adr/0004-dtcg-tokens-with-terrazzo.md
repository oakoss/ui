# ADR-0004: DTCG 2025.10 token authoring with Terrazzo build pipeline

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

oakoss/ui needs a token format that survives a multi-framework future (see ADR-0003), enables Tokens Studio Figma round-trip with designers, and feeds Tailwind, CSS, Sass, JS/TS, and (eventually) Swift outputs from a single source.

The Design Tokens Community Group (DTCG) shipped its first stable Format Module on 2025-10-28. The big-vendor token packages (Adobe Spectrum, Carbon, Polaris, shadcn/ui) are not DTCG-compliant; their JSON predates the spec and carries migration debt. DTCG adoption in 2026 shows up in tooling (Style Dictionary v4+, Terrazzo, Tokens Studio), not in legacy token JSON. oakoss/ui starts fresh with no debt to migrate.

See [`../research/architectural-standards.md`](../research/architectural-standards.md) for spec status, adopter audit, and pipeline diagram.

## Decision

`@oakoss/tokens` authors tokens as DTCG 2025.10 JSON. Terrazzo (`@terrazzo/parser` + plugins) is the build pipeline. Outputs include Tailwind v4 `@theme`, CSS variables, Sass, JS/TS types, and shadcn-shaped CSS variables emitted into `registry-item.json` `cssVars` fields. Registry consumers do not need to know we author in DTCG.

## Consequences

Easier: one toolchain for every output target. Tokens Studio Figma round-trip works for designers. Any future tool aligned on the spec stays compatible, and Style Dictionary v5+ is available as a fallback.

Harder: the public references (Spectrum, Carbon, Polaris) cannot be copied verbatim because their token JSON predates DTCG. We invent more than we borrow on token naming and structure.

New risks: DTCG is a W3C Community Group Final Report, not a Standards Track document. The 2026-05-07 preview draft carries a `do-not-cite-directly` banner. Mitigation: pin to 2025.10 and treat post-stable drafts as opt-in.

## Alternatives considered

- **Adobe Spectrum's `value`/`uuid` schema.** Strong tooling but locks us to Adobe's ecosystem and predates DTCG.
- **Carbon's JS-exported theme files.** Composable in JS but loses the framework-agnostic JSON property that ADR-0003 depends on.
- **shadcn's flat `cssVars` map.** Sufficient for shadcn's surface area, but no `$type` system means losing the composite token types we'll want by v1.0 (typography, gradient, shadow).
