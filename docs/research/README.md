# Research

Research notes that inform ideas, specs, and decisions. Each note captures what was investigated, what was found, and the sources — so a decision can cite the research behind it rather than re-deriving it.

## Adding a note

1. Copy [`0000-template.md`](./0000-template.md) to `NNNN-kebab-title.md`, using the next free number.
2. Fill in the summary, findings, and sources. Link related ideas or specs in `Related:`.

## Index

<!-- Add newest first: - [NNNN — Title](./NNNN-kebab-title.md) — one-line hook -->

- [0009 — Charts](./0009-charts.md) — TanStack Charts re-checked, eleven chart libraries, accessibility guidance and the community's top asks behind the Chart port, with the candidates beyond shadcn's chart.
- [0008 — Pinning Registry Installs to a Release](./0008-registry-version-pinning.md) — a GitHub tag pins only the item named; serving each release's `shadcn build` output from the docs site, with dependencies as versioned URLs, pins whole releases with no oakum change.
- [0007 — Toasts](./0007-toasts.md) — 17 libraries, 12 design systems and the community's top asks behind the Toast spec: our own store on React Aria's toast hooks, Sonner's call signature, a neutral card stack.
- [0006 — Intent UI v4](./0006-intent-ui-v4.md) — what v4 changed, the picks worth taking per component (each a bead), and where Intent is behind us on accessibility.
- [0005 — Visual Regression from the Storybook Run](./0005-visual-regression-spike.md) — screenshotting every story in the Vitest run, a 2.2% noise floor across two identical runs, and the comparison options.
- [0004 — Token Data Model](./0004-token-model-research.md) — component libraries, design systems, token formats and theme families checked against the proposed model: lightness scales with named roles, typed contrast pairs, axes as modifiers.
- [0003 — Docs Site Inspiration](./0003-docs-site-inspiration.md) — what 22 docs sites do best, ranked by fit for our static Fumadocs site, and the beads filed from them.
- [0002 — Forking shadcn's React Aria Base](./0002-shadcn-aria-fork.md) — fork shadcn's React Aria base into tv, styles as tokens, theme families, and swappable fonts and icons.
- [0001 — Design System Foundations & Token Architecture](./0001-design-system.md) — semantic-tier tokens, CSS-var theming, functional folders over atomic, and a generator to kill the token hand-sync.
