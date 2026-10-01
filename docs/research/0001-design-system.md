# Research: Design System Foundations & Token Architecture

Date: 2026-06-23
Related: token architecture · component organization · registry distribution
Superseded in part by: [0002 — Forking shadcn's React Aria Base](./0002-shadcn-aria-fork.md)

## Summary

Synthesis of five parallel research streams — design-system best practices & governance, anatomy & architecture, atomic design, enterprise systems (Spectrum, Material, Carbon, Primer, Fluent, Atlassian), and design tokens — applied to oakoss/ui: a solo-maintained, framework-agnostic React component library on react-aria-components (RAC) + Tailwind v4 + tailwind-variants, distributed via the shadcn "open code" registry. The streams converge: adopt the **semantic token tier, role-based naming, and CSS-variable theming** that every mature system shares; lean on RAC for behavior/accessibility (oakoss occupies the same role react-spectrum plays over react-aria); keep **functional category folders**, not atomic-design folders; and treat build pipelines, multi-platform sync, and per-component versioning as enterprise overhead the open-code model lets us skip. The single structurally-urgent action is to kill the `globals.css` ↔ `registry.json` token **hand-sync** with a small typed generator — staying flat today while shaping the source so primitives and themes slot in later without a rewrite. A second, gap-finding verification pass (see [Round 2](#round-2--verification--additions)) confirmed the core, corrected two points (the folders mirror **Mantine**, not RAC; **Style Dictionary v5 is now GA**), and specified the concrete ~19-token set and the component-API conventions to lock. A third pass (see [Round 3](#round-3--final-verification)) fact-checked every version-sensitive claim as current to 2026-06-23, **locked multi-theme as a near-term goal** (tokens-as-data + generator), and surfaced a real contrast bug plus the item-name / RAC-peer-version contracts the plan had missed.

## Findings

### Convergent principles (shared across all mature systems)

- **Three-tier tokens are universal, but only the semantic tier is mandatory at small scale.** primitive (raw ramps) → **semantic/alias** (role-based: `--primary`, `--muted-foreground`) → component. The semantic layer is the theming seam; components must reference it, never raw values. Primitives earn their place at scale (a real ramp, a 2nd brand); component tokens almost never — tailwind-variants already owns component-local decisions.
- **Name semantic tokens by role, never by value** (and the best systems bake in context/state — Carbon's layering `-01/-02`, Atlassian's `…-hovered`). This is free discipline that prevents theme rot. shadcn's `--primary` / `--muted-foreground` is a flattened, namespace-less version of the same idea — keep it at the semantic tier.
- **Behavior/accessibility separated from styling.** Spectrum's react-stately → react-aria → react-spectrum split is the purest form; WAI-ARIA is table stakes. oakoss already inherits layers 1–3 from RAC and supplies only styling — the biggest enterprise-team cost, free.
- **Theme = swap the semantic layer via CSS variables + a selector** (`.dark` / `data-theme`), no runtime Provider. This is the Primer/Carbon/Atlassian model; it's framework-agnostic and fits "open code" since consumers own the CSS. (oakoss already does this with `.dark`.) The enterprise trend toward build-time theming (Spectrum S2 macro, Fluent's Griffel) is the right idea at the wrong cost for a solo maintainer.

### Token decision for oakoss/ui (the actionable core)

- **The real defect today is the hand-sync**: the 14 oklch tokens are duplicated verbatim in `src/styles/globals.css` and `registry.json` `cssVars`. Fix with a **~40-line typed TS generator**: author tokens once in `src/tokens/*.ts` → emit both the `:root`/`.dark`/`@theme` blocks in `globals.css` and the `cssVars` in `registry.json`. One source, two outputs, zero hand-sync, type-checked and Vitest-testable.
- **Stay flat / semantic-only now.** The 14 tokens _are_ the semantic tier; a primitive ramp isn't yet earning its place (the "promote a global only at 3+ shared usages" rule).
- **The generator is the retrofit-proofing**, not the primitive tier itself. Shape the TS source to mirror the DTCG model (semantic values that can later alias `{color.blue.600}` primitives) so adding a ramp, a second brand, DTCG, or Style Dictionary later is mechanical.
- **Defer Style Dictionary and DTCG.** The DTCG spec reached its first stable version (2025.10) in Oct 2025 and is the eventual interop format, but it (and Style Dictionary) is overhead for 14 flat tokens. Adopt only when a real ramp, a second brand, or Figma round-trip forces it.
- **Themes** (multiple palettes / a switcher) become cheap once the generator + data source exist — the generator can fan out per-theme `cssVars` items and/or runtime multi-theme CSS. Add when it's a real goal; the architecture will already support it.

### Structure & atomic design

- **Atomic design is a mental model, not a folder taxonomy** — Brad Frost himself disowns the literal atom/molecule/organism labels, and templates/pages don't exist in an app-less library. The atom-vs-molecule boundary (e.g. the icon-button) is inherently ambiguous and generates classification debate over real work.
- **Keep the functional category folders** (`inputs`, `data`, `feedback`, `overlays`, `navigation`, `surfaces`, `layout` — mirroring **Mantine's** functional grouping, _not_ RAC's; see Round 2 correction). They answer "where does X live?" by function, and the registry `target` (not the folder) sets the consumer's install path — so the layout is a local DX/Storybook-nav choice that can be reorganized later without breaking consumers.
- **Borrow only the layering** as a mental/docs model: **foundations (tokens) → components → patterns**. Patterns live as a future docs/recipes section, not a new top-level directory.

### Distribution, versioning & docs (open-code model)

- **Open code creates ownership, not dependency** — copied source lands in the consumer's repo and they own it. This makes **versioning advisory**: you can't push a breaking change to installed code; consumers re-run `add` to opt in. SemVer + changelog still matter for _communicating_ diffs, and a **visual change counts as breaking** — so note diffs per item.
- **The component source is the primary documentation.** Distribution correctness (registry schema, `registryDependencies`, category targets) replaces package-publish hygiene as the thing that must not break.
- **The registry gives à-la-carte granularity without the versioning tax.** Enterprise systems split into many independently-versioned packages (Atlassian ships 455+ versions of one button) to enable incremental adoption; the open-code model delivers the same granularity from one source tree. Don't add per-component packages or a monorepo.
- **Docs = Storybook organized Foundations → Tokens → Components** (states/variants/a11y per story) — mirrors every system and matches the stories-as-tests strategy.

### Defer until evidence demands (enterprise overhead to skip while solo)

- Primitive token tier (until a real ramp or 2nd brand); Style Dictionary / DTCG pipeline; Tokens Studio / Figma round-trip.
- Patterns/blocks layer (needs a critical mass of components); an unstyled `primitives/` package (RAC _is_ that layer).
- Monorepo / Changesets-driven multi-package split; per-component versioning.
- Generative color engines (Material HCT), custom CSS-in-JS runtimes (Griffel), build-time style macros (Spectrum S2).
- Content/voice & branding standards, data-viz guidelines, a standalone docs site, formal governance (RACI, councils, approval milestones), maturity-model dashboards.

### Net recommendation

Build the token generator now (flat/semantic, DTCG-shaped TS source → `globals.css` + `registry.json` cssVars), keep functional folders, theme via CSS-variable swap, lean on RAC, and defer primitives / Style Dictionary / DTCG / patterns / monorepo until evidence demands them. This kills the only real bug (hand-sync), unblocks themes later for ~40 lines, and avoids every enterprise tax the open-code model lets us skip.

## Round 2 — verification & additions

A second gap-finding pass (five agents tasked to challenge round 1, prioritizing oakoss's closest peers and the full token set). It confirmed the core, corrected two points, and added concrete specifics.

### Corrections to round 1

- **Folders mirror Mantine, not RAC.** RAC actually groups Buttons/Collections/Pickers/Overlays/Forms/Navigation/Status/Content; our set matches Mantine's grouping. Keep the folders — but as a _local source-tree + Storybook-nav_ convenience, since the registry `target` decouples internal layout from consumer import paths (reorganizable later without breaking consumers).
- **Style Dictionary v5 is GA (~5.4.x — later 5.5.0, see Round 3); DTCG 2025.10 is stable and shipping in 10+ tools.** "Defer Style Dictionary" still holds — but as a deliberate cost/benefit call for a solo lib, not a readiness blocker.
- **Functional folders carry the same cross-category ambiguity** round 1 pinned only on atomic design (ComboBox = input+overlay+data; Menu = nav+overlay+data). Mitigation: a written tie-break rule — **file by primary user intent** (ComboBox/Select → `inputs`; Menu → `overlays`/`navigation` by dominant use; Table/GridList/ListBox → `data`) — in CONTRIBUTING.
- **Theme via class-based `.dark` (next-themes), not `data-theme`** — what every copy-paste peer uses, and it stays registry-interoperable. (oakoss already does this.)

### Confirmed (stronger evidence)

- **Closest living peers validate the entire stack.** Intent UI / justd (RAC + Tailwind v4 + tailwind-variants + copy-paste) is oakoss's exact thesis already shipping; JollyUI ports shadcn designs onto RAC and reuses shadcn's exact var names. Don't second-guess the core choices.
- **The generator earns its place.** Tailwind v4 `@theme` removes the JS-object sync, but the `globals.css` ↔ `registry.json` cssVars duplication is real (the GitHub-registry migration would shrink it to two targets).
- **Avoid build-time theming** (Panda recipes, Spectrum-2 macro) — breaks copy-paste ownership; every copy-paste peer uses plain CSS-var runtime.

### New — concrete token schema (grow 14 → ~19 + radius + fonts + z-index)

Missing today: `card`, `card-foreground`, `popover`, `popover-foreground`, `input`, all `--radius-*`, `--font-*`.

- **Colors (semantic, light + dark, oklch):** `background, foreground, card(+foreground), popover(+foreground), primary(+foreground), secondary(+foreground), muted(+foreground), accent(+foreground), destructive(+foreground), border, input, ring` (~19, shadcn-compatible names so the registry stays drop-in).
- **Radius:** one `--radius: 0.625rem` knob → derive `sm/md/lg/xl` via `calc()` (shadcn pattern).
- **Fonts:** `--font-sans`, `--font-mono`.
- **Z-index layering map** (plain CSS vars — Tailwind v4 has no z-index `@theme` namespace): dropdown / sticky / overlay / modal / popover / toast. Essential-now for a library shipping overlays.
- **Don't mint per-state color tokens** (`*-hover`); derive states in `tv`. **Defer** primitive ramps, `success/warning/info`, custom type/space/shadow scales, motion tokens, and P3.

### New — component-API template (lock before component #3)

- **`ref` as a plain prop by default** (React 19) — `forwardRef` only where an imperative handle is needed (`useImperativeHandle`), not banned outright (corrected in Round 3); **`render` prop, not `asChild`** (RAC already provides render props — add no Slot of our own); a fixed compound-naming spine (`Root/Trigger/Content/…`); **`tv({ slots })`** for multi-part components; **icons as injected `ReactNode`** (library-agnostic); **`data-slot` attributes** for consumer override ergonomics.
- **i18n/RTL/focus/forms are inherited from RAC** — style against its `data-*` (focus-visible/pressed/hovered/RTL) via the `tailwindcss-react-aria-components` plugin (already installed), not per-component.
- **6 essential foundations** now (color, spacing, type, radius, shadow, motion); defer breakpoints/density/border-widths/grid.

### New — solo-maintainer levers (open-code)

- **Deprecation:** `@deprecated` / `@deprecatedSince` in the _emitted source_ is the only channel that reaches copy-paste consumers; pair with changelog + replacement/removal notes (SemVer is toothless under copy-paste).
- **Bus-factor ≠ burnout:** externalize decisions continuously — a repo-root `DESIGN.md` doubles as bus-factor insurance and an agent-readable single source.
- **"Pre-system" posture** at 2 components — resist process/governance until a second real consumer exists.
- **Adoption is a proxy, not the goal** — pair it with an outcome signal (consistency / less rework); the real failure metric is "did a missing component force a fork?"

## Round 3 — final verification

A third pass: an adversarial red-team of the plan, color/accessibility depth, theming/multi-theme mechanics, testing/docs strategy, and a currency fact-check — all verified against sources current to 2026-06-23.

### Decision locked — multi-theme is a near-term goal

The maintainer wants swappable palettes for their own apps, so: **author tokens as data (`src/themes/*.ts`) + a generator** that emits `globals.css` (`:root`/`.dark` + a once-authored `@theme inline` bridge) **and** per-theme `registry:theme` cssVars. **Mode** stays on the `.dark` class (next-themes — the copy-paste-peer standard); **brand/theme** goes on `[data-theme]` — two orthogonal axes (theme × mode) over one semantic token set. `@theme inline` is written once against the semantic names, so adding a theme = one data file + one scoped block, never touching components. Do **not** adopt `light-dark()` as the primary mechanism (only two values; parallel to next-themes), but **do** set `color-scheme`. This resolves the generator-vs-`theme.css` fork: the generator earns its place by fanning out themes (killing the hand-sync is a side effect). Caveat: shadcn's CLI injects `cssVars` into `:root`/`.dark`, not `[data-theme]` — multi-brand distribution needs scoped output, not the default injection.

### Currency corrections (verified 2026-06-23)

- **Style Dictionary → 5.5.0** (2026-06-21); repo `style-dictionary/style-dictionary` (not 5.4.x / amzn).
- **Base UI is no longer beta — 1.0 since 2025-12-11**, renamed `@base-ui/react` (1.6.0).
- **`forwardRef`** — React's wording is "will be deprecated in a _future_ release"; it still works in 19.2 and isn't removed (hence "ref-as-prop default", not banned).
- **JollyUI is stale** (no commits since 2025-01); **Intent UI** is the live RAC + tailwind-variants peer.
- **Park UI = Panda CSS + Ark UI, not Tailwind** (now under the Chakra org).
- Confirmed current: React 19.2, Tailwind 4.3.1 (no `--z-index` namespace), shadcn 4.11.0 + GitHub registry, react-aria-components 1.19.0 + `tailwindcss-react-aria-components` 2.2.0, tailwind-variants 3.2.2 (our exact pin), next-themes 0.4.6, Changesets 2.31.0, **WCAG 2.2 is the current REC; APCA is non-normative** (pulled from WCAG 3 in 2023; WCAG 3 ~2029–2030).

### Gaps to close (red-team + accessibility)

- **Contrast bug + CI check.** `--border` at `oklch(0.922 0 0)` on white is **~1.2:1** — fine as a soft divider, but it **fails WCAG 1.4.11 (3:1)** as the boundary of an interactive control. The math (neutral gray → relative luminance `Y = L³`): a _sole_ control boundary needs `Y ≤ 0.30` → `L ≲ 0.66` (`0.66³ ≈ 0.29`, ~3:1 vs white). That's a notably dark border, vs shadcn's soft `0.922` default which instead relies on the input not being the only affordance (fill + label + focus ring). So the real choice is **either darken `--input` to ~`oklch(0.65)` _or_ keep it soft and guarantee non-sole affordances** — pinned by the test. (`~oklch(0.85)` does **not** suffice: `0.85³ = 0.61` → only ~1.58:1.) Add **`src/styles/contrast.test.ts`** (Vitest + culori + wcag-contrast) failing CI under WCAG 2.2 AA (4.5:1 text, 3:1 non-text/focus/border); log APCA Lc as advisory.
- **Item names are the public API.** Folder layout is reorganizable (the registry `target` sets consumer paths), but renaming a registry **item** or splitting a compound silently breaks consumers' `registryDependencies` — never rename/split items without a migration note.
- **Declare a minimum `react-aria-components` peer version** in `DESIGN.md` — consumers bring their own RAC, so a component written against 1.19's API breaks on older RAC with no install-time error.
- **Deprecation channel = changelog / `DESIGN.md`, not `@deprecated`-in-source** (re-running `add` overwrites local edits). **Token renames are breaking too** — note them in the changelog.

### Accessibility owings (RAC gives `data-*`, zero styles)

- **Base layer (`globals.css`):** `color-scheme` per mode; a `prefers-reduced-motion: reduce` reset; `forced-colors` handling via **system color keywords — NOT a hand-maintained high-contrast theme**.
- **Focus ring in the `tv` base:** ≥2px, ≥3:1 vs component and page, with offset (WCAG 2.4.7 / 2.4.11), driven by `data-focus-visible`; preserve the outline under `forced-colors`.
- **Target size** (2.5.8): ≥24×24px hit area on interactive controls.
- **New a11y-forced tokens:** `--ring-offset` and the darker `--input`. Defer `success`/`warning`/`info` until a component needs them.

### Testing & docs (low-effort, high-leverage)

- Flip `parameters.a11y.test` `'todo'` → **`'error'`** so axe failures break CI (axe catches ~57% of issues — keyboard/focus/SR still need `play` tests). **Defer Chromatic** until real consumers (keep it installed). One lean GitHub Actions job (typecheck / lint / test / `registry validate`). Test RAC keyboard in `play` via `userEvent.tab()`/`keyboard()` (real Chromium, accurate focus).
- Per-component **`DESIGN.md`** contract (anatomy/slots, variant×size matrix, states, RAC primitive + ARIA pattern, keyboard contract, token deps, invariants) — human- and agent-readable; doubles as bus-factor insurance and the spec the tests assert against.

### Net — research-complete; build order

1. **Token source-as-data + generator** (multi-theme-ready, default theme), seeding the ~19-token shadcn-compatible schema with the darker `--input`, `--ring-offset`, `--radius` knob, and `--font-*`.
2. **Contrast CI test** (before a second theme exists).
3. **Component-API template + per-component `DESIGN.md`**; a11y base layer + focus-ring recipe.
4. **GitHub-registry migration** (`registryDependencies` → `oakoss/ui/theme`, drop `public/r` + build, `registry validate`).
5. Resume components — **Dialog** next (the portaled-overlay theming test).

## Sources

- [EightShapes — Principles of Designing Systems](https://eightshapes.com/articles/principles-of-designing-systems/)
- [EightShapes — Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
- [EightShapes — Versioning Design Systems](https://medium.com/eightshapes-llc/versioning-design-systems-48cceb5ace4d) · [Visual Breaking Change](https://medium.com/eightshapes-llc/visual-breaking-change-in-design-systems-1e9109fac9c4)
- [Brad Frost — Atomic Design, ch. 2](https://atomicdesign.bradfrost.com/chapter-2/) · [Design System Ecosystem](https://bradfrost.com/blog/post/the-design-system-ecosystem/) · [Governance Process](https://bradfrost.com/blog/post/a-design-system-governance-process/)
- [Qt — Atomic Design: Why the Labels Don't Matter](https://www.qt.io/software-insights/atomic-design-systems-why-the-labels-dont-matter) · [Sparkbox — Iterating on Atomic Design](https://sparkbox.com/foundry/iterating_on_atomic_design)
- [DTCG — First stable version 2025.10 (2025-10-28)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) · [designtokens.org](https://www.designtokens.org/)
- [Style Dictionary — DTCG support](https://styledictionary.com/info/dtcg/)
- [Adobe Spectrum — Design Tokens](https://spectrum.adobe.com/page/design-tokens/) · [Introducing React Spectrum](https://react-aria.adobe.com/blog/introducing-react-spectrum) · [S2 Styling](https://react-spectrum.adobe.com/beta/s2/styling.html)
- [Material 3 — Design Tokens](https://m3.material.io/foundations/design-tokens/overview) · [IBM Carbon — Color Tokens](https://carbondesignsystem.com/elements/color/tokens/) · [GitHub Primer — Primitives](https://github.com/primer/primitives) · [Microsoft Fluent 2 — Tokens](https://fluent2.microsoft.design/design-tokens) · [Atlassian — Design Tokens](https://atlassian.design/foundations/tokens/design-tokens)
- [shadcn/ui — Theming](https://ui.shadcn.com/docs/theming) · [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json)
- [NN/g — UX Maturity Model](https://www.nngroup.com/articles/ux-maturity-model/) · [Lean Design System Teams](https://www.nngroup.com/articles/lean-design-system-teams/) · [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme)

Round 2 (verification & additions):

- [Intent UI / justd](https://intentui.com/) · [github.com/intentui/intentui](https://github.com/intentui/intentui) · [JollyUI](https://www.jollyui.dev/docs) — RAC + Tailwind copy-paste peers
- [Mantine — core package grouping](https://mantine.dev/core/package/) · [Radix Primitives — components](https://www.radix-ui.com/primitives/docs/components) · [Park UI / Ark UI](https://ark-ui.com/) · [Base UI — useRender](https://base-ui.com/react/utils/use-render)
- [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) · [Style Dictionary — DTCG status](https://styledictionary.com/info/dtcg/) · [SD 2025.10 tracking #1590](https://github.com/style-dictionary/style-dictionary/issues/1590)
- [React 19 — ref as a prop](https://react.dev/blog/2024/12/05/react-19) · [tailwind-variants — slots](https://www.tailwind-variants.org/docs/slots) · [components.build — composition](https://www.components.build/composition)
- [Mavik Labs — Design Tokens in Tailwind v4](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/) · [RAC — i18n](https://react-spectrum.adobe.com/react-aria/internationalization.html) · [RAC — forms](https://react-spectrum.adobe.com/react-aria/forms.html) · [Lucide React](https://lucide.dev/guide/react/)
- [Sinha-Saxena — Grouping & naming components](https://medium.com/@shuchisaxena/design-system-grouping-and-naming-components-7cef856906b5) · [USWDS — component lifecycle](https://designsystem.digital.gov/components/lifecycle/) · [Knapsack — adoption isn't success](https://www.knapsack.cloud/blog/why-design-system-adoption-isnt-the-true-measure-of-success)

Round 3 (final verification & currency audit, 2026-06-23):

- [Adrian Roselli — WCAG 3 contrast as of April 2026](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html) · [W3C — WCAG 2.2 (REC)](https://www.w3.org/TR/WCAG22/) · [WCAG 2.4.11 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Evil Martians — OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) · [oklch.com](https://oklch.com) · [Huetone](https://huetone.ardov.me/) · [incluud/color-contrast-checker](https://github.com/incluud/color-contrast-checker) · [MDN — color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- [Tailwind v4 multi-theme (simonswiss)](https://simonswiss.com/posts/tailwind-v4-multi-theme/) · [class-vs-data-attribute theming (eastondev, 2026-03-28)](https://eastondev.com/blog/en/posts/dev/20260328-tailwind-dark-mode-comparison/) · [una.im — modern CSS theming](https://una.im/modern-css-theming) · [tweakcn](https://tweakcn.com/)
- [Storybook — accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing) · [Storybook — Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) · [Deque — axe catches 57%](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/) · [React Aria — testing](https://react-aria.adobe.com/testing)
- Currency audit: [Style Dictionary v5 releases](https://github.com/style-dictionary/style-dictionary/releases) · [Base UI 1.0](https://base-ui.com/react/overview/releases) · [React 19 / forwardRef](https://react.dev/reference/react/forwardRef) · [react-aria-components releases](https://react-spectrum.adobe.com/releases/) · [shadcn changelog](https://ui.shadcn.com/docs/changelog)
