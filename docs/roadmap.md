# Roadmap

High-level direction for oakoss/ui. Subject to change. Not a commitment.

## Current

Foundation research and architectural decisions in progress. See [`research/`](research/) for the evidence behind each decision and [`decisions/`](decisions/) for the confirmed decisions themselves.

## Pending decisions

- **Styling layer** — Tailwind v4 recommended by research but not yet locked. See [`research/styling-layer-evaluation.md`](research/styling-layer-evaluation.md).

## Phases

### v0.1 — Foundation

- `@oakoss/tokens` package (DTCG 2025.10 source, Terrazzo build pipeline)
- First 10 components on React Aria Components
- Docs site scaffold (Fumadocs + Next.js)
- Storybook 10 as component explorer + visual/a11y test target
- Initial registry (`registry.json` + per-item manifests)
- `@oakoss/mcp-server` for AI assistant integration

### v0.2 — Expansion

- Component scope grows to ~25
- Initial complementary primitives integration (vaul, cmdk, sonner, @tanstack/react-table, etc.)

### v1.0 — Public OSS launch

- ~50 components at stable status
- Multi-brand theming via separate `@oakoss/theme-*` packages
- Public proposals and roadmap repos modeled on Carbon
- WCAG 2.2 AA + EN 301 549 + Section 508 conformance documentation

### Future (post-v1.0, not committed)

- Lit / Web Components implementation reading the same DTCG tokens
- Additional pre-composed recipes for common enterprise patterns
- Separate `@oakoss/aigc` package for AI/chat/markdown components (TDesign pattern)

## Status legend

Each component and feature carries one of these labels:

- 🟢 **Experimental** — actively explored, no API stability
- 🟡 **Alpha** — usable, breaking changes expected
- 🔵 **Beta** — API mostly stable, may have minor breakages
- 🟣 **Release candidate** — API frozen, awaiting production validation
- ✅ **Stable** — API committed, semver enforced
