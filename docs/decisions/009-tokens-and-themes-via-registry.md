# Tokens and themes distributed via registry, not npm

- **Status:** Accepted
- **Date:** 2026-05-27
- **Authors:** @jbabin91

## Context

[Decision 002](002-registry-led-hybrid-distribution.md) established a registry-led hybrid model: styled components via the shadcn-compatible registry, tokens and "shared utilities" via npm. The "future `@oakoss/theme-*`" line in that decision also implied multiple sibling theme packages — one per brand or variant.

Two assumptions inside that decision did not hold up on re-examination:

1. **Tokens are brand identity.** They are exactly the surface consumers want to fork, not depend on. Every adopting team swaps the default palette for theirs, retunes the spacing scale, or renames semantic tokens. The "you own the source" philosophy that justifies registry distribution for components applies even more strongly to tokens.
2. **A per-variant package proliferation (`@oakoss/theme-default`, `@oakoss/theme-brand-x`, …) prices each new theme at a published package boundary.** That overhead is wrong for a project where themes are content, not code, and where consumers want to lift a theme into their own repo and modify it freely.

The shadcn registry already supports the distribution we need for both: source files (CSS variables, JS/TS constants, and the Tailwind v4 `@theme` block emitted by `@terrazzo/plugin-tailwind` per [decision 011](011-styling-layer-tailwind-v4.md)) are copied into the consumer's repo when they run `shadcn add @oakoss/tokens` or `shadcn add @oakoss/themes/<variant>`. Raw token access (for charts, canvas, PDF, email — the legitimate "I need JS values" cases) is fully served by shipping a `tokens.ts` file alongside the CSS. Workspace consumers inside this monorepo (mcp-server, registry build script, future internal tools) resolve `@oakoss/tokens` via pnpm's `workspace:*` protocol — no publish required for internal use.

The only true "must publish" trigger is a third-party package needing to peer-depend on tokens. That is not a foundation-phase concern.

## Decision

- `@oakoss/tokens` is a **workspace-only package**. It is never published to npm. Internal `@oakoss/*` packages resolve it via `workspace:*`. External consumers receive it via the shadcn-compatible registry, which ships the compiled outputs (CSS variables, JS/TS constants, and the Tailwind v4 `@theme` block emitted by `@terrazzo/plugin-tailwind` per [decision 011](011-styling-layer-tailwind-v4.md)) as source files copied into the consumer's repo.
- Theming lives in a **single workspace package — `@oakoss/themes`** — containing multiple theme variants (default, dark, and any future brand variants) as DTCG source files. Each variant is exposed as its own registry item. We do not publish `@oakoss/theme-default`, `@oakoss/theme-brand-x`, or any per-variant npm package.
- `@oakoss/mcp-server` and any other binary or runtime package may still be published to npm. This decision narrows decision 002 only for tokens and themes, not for the broader distribution model.

This decision supersedes the "tokens and shared utilities ship as small npm packages" claim and the "future `@oakoss/theme-*` packages" plurality in decision 002.

### Token resolution (inside the monorepo)

`pnpm`'s `workspace:*` protocol resolves `@oakoss/tokens` to the local workspace package. Sibling packages (`@oakoss/mcp-server`, registry build scripts, internal tools) `import { ... } from '@oakoss/tokens'` exactly as if it were a published dependency.

Consumer-side resolution is partially resolved by [decision 011](011-styling-layer-tailwind-v4.md) — see that decision for the styling-layer specifics. The registry build pipeline implementation (how authored workspace imports get rewritten to consumer-side paths, if at all) is TBD; specifics will be addressed in their own decisions.

## Consequences

Easier:

- Consistent mental model for consumers — everything that is content (components, tokens, themes) flows through the registry; everything that is a runtime binary (mcp-server) flows through npm.
- One fewer published surface to maintain. Tokens iterate freely inside the monorepo without consumer-facing semver pressure.
- Themes scale by adding files to one package instead of bootstrapping a new npm publish per variant.
- The MCP server consumes tokens through workspace resolution at build time, so its bundled output is self-contained and version-locked.

Harder:

- Third-party plugins cannot peer-depend on `@oakoss/tokens` directly. Mitigation: deferred problem; revisit if and when a plugin ecosystem materializes. The escape hatch is to publish at that point — registry distribution does not preclude later npm publishing.
- Consumers wanting Renovate to auto-bump tokens lose the option. Mitigation: this is a feature — token changes are exactly the kind teams should vet by hand.
- The changesets tooling stays dormant until `@oakoss/mcp-server` (or another binary package) lands. Tokens cannot validate the publish pipeline end-to-end.

## Alternatives considered

- **Publish `@oakoss/tokens` to npm as decision 002 originally specified.** Maintains the precedent set by `@adobe/react-spectrum-tokens` and `@mui/material-design-tokens`. Rejected because those projects have stable taxonomies and large contributor bases; we are foundation-phase and want consumers to own the source they style with.
- **Dual distribution (npm + registry).** Publish tokens to npm _and_ expose them via the registry; let consumers pick. Rejected because two distribution channels for one artifact creates "which should I use?" confusion and doubles maintenance. The shadcn ecosystem has not adopted dual distribution and it would put us out of step.
- **Per-variant theme packages (`@oakoss/theme-default`, `@oakoss/theme-brand-x`).** Strong governance for multi-brand enterprise scenarios, per the [enterprise design system references](../research/enterprise-design-system-references.md) writeup. Rejected because the registry already supports per-variant addressing (one registry item per theme), and consolidating into one source package is cheaper to author and easier to keep consistent.
- **Publish a deprecated `@oakoss/tokens@0.0.0` placeholder solely to reserve the npm name.** Rejected because publishing a deprecated package is noise on npm and signals weakness. If we do not need to publish, we do not publish.
