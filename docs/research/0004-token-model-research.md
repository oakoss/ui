# Research: Token Data Model

Date: 2026-10-02
Related: [0001 — Design System Foundations](./0001-design-system.md) · [0002 — Forking shadcn's React Aria Base](./0002-shadcn-aria-fork.md) · bead `ui-2mi.1`

## Summary

Before writing the token types for `ui-2mi.1`, we checked the proposed model against systems in four groups:

- **Component libraries:** Radix Themes and Radix Colors, Chakra UI v3, Park UI and Panda.
- **Design systems:** Material 3, Adobe Spectrum 2 and Leonardo, GitHub Primer.
- **Token formats and tools:** DTCG 2025.10, Style Dictionary, Terrazzo, Tokens Studio, shadcn's registry and tweakcn.
- **Theme families:** Base16, Base24 and tinted8, Catppuccin, Rosé Pine, Gruvbox and Nord.

The research revises several decisions (see [Decisions](#decisions)). The two biggest:

- **The contrast pick fails.** We planned to pick each foreground from the family's palette by contrast. Measured on the real palettes, that fails WCAG AA for most accents in light flavors: Latte passes for 2 of 14 accents and Rosé Pine Dawn for 1 of 6. It also fails in some dark palettes: Nord's error red reaches 3.55:1 at best against its own neutrals.
- **Hues need scales.** Every library we checked puts a scale between primitives and roles:
  - Radix Colors' 12-step contract;
  - Park UI's variant roles;
  - Chakra's 8 roles per palette;
  - shadcn's own single-hue chart ramp;
  - Catppuccin's Tailwind port, which has 50–950 shades per accent.

  With a scale, hover, subtle backgrounds, borders, accent text and charts all become steps. The primary choice becomes "swap the primary scale", so the hand-picked list of 11 roles goes away.

Contrast checks also widen. 0001 already set 4.5:1 for text and 3:1 for non-text. Now every declared role pair is checked, including plain aliases, and decorative pairs are explicitly unchecked.

Every claim below was observed in the cited source by us or our research agents on 2026-10-01 or 2026-10-02, or measured by us. Contrast ratios were computed with the WCAG 2.x formula on each palette's published hex values, and a reviewer recomputed them. Anything not observed is labeled _inferred_.

## Decisions

Agreed on 2026-10-02. They revise the proposal agreed before this research; rows marked **new** add to it. The scale-building rows come from the follow-up research in [Building scales](#building-scales).

| Decision          | Before                                                        | After                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tiers             | Primitives → roles                                            | Primitives → **hue scales** → roles. Neutrals and surfaces stay explicit aliases.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Scales            | —                                                             | **new:** lightness steps numbered like Tailwind (50 lightest to 950 darkest), extendable (25, 1000) where a palette needs it                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Roles over scales | —                                                             | **new:** scales own numbered steps (`--mauve-500`). Each intent (`primary`, `destructive`, `success`, `warning`, `info`) has a scale (`--primary-50` … `--primary-950`) that aliases the steps of the hue chosen for it, and one set of named roles points at those: `{intent}`, `-hover`, `-subtle`, `-border`, `-text`, `-foreground`. They are CSS variables, and light and dark mode point them at different steps. `-foreground` may instead point at a neutral or another scale's step, such as dark text on a bright fill. Components use roles only. |
| Foregrounds       | Contrast pick from the family palette                         | A declared text-on-fill value per scale, hand-written or derived (Radix, Park UI and Chakra each hand-write one). The typed pair test is the guarantee.                                                                                                                                                                                                                                                                                                                                                                                                      |
| Primary choice    | Overrides a fixed list of 11 roles                            | Swaps the `primary` scale. Roles that point at it follow, including `ring`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `secondary`       | Tinted by the accent                                          | Stays neutral. shadcn's accent themes re-pin it to one near-neutral (`oklch(0.967 0.001 286.375)` in blue, rose and amber).                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Charts            | `chart-1..5` follow the primary                               | A family chooses: a ramp from one scale (shadcn) or categorical hues.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Contrast checks   | 4.5:1 for text and 3:1 for non-text (0001), on computed picks | **new:** applied to every declared pair, for every family × flavor × intent, with a decorative tier that has no requirement                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Theme axes        | Family × flavor × primary                                     | Declared as modifiers, each with contexts and a default (the DTCG Resolver's model). Contrast level and colorblind become new contexts later.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Flavors           | One full palette each                                         | **new:** deltas over a family base (Panda's `themes`). Gruvbox's contrast variants change only `bg0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Light/dark pair   | Every family declares both                                    | A family may have no light flavor (Nord).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Color values      | CSS strings                                                   | **new:** structured `{ space, components, alpha }`, as in DTCG's color type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| References        | `{ ref: 'mauve' }`                                            | **new:** full paths (`color.mauve.500`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Metadata          | —                                                             | **new:** `$type` per group; `description` and `usage` per token; `deprecated`, `renamed`; a tag on derived values                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Building scales   | —                                                             | **new:** generated by a small in-repo generator on `culori`. A family can hand-write any step, and a hand-written step always wins (tinted8's rule).                                                                                                                                                                                                                                                                                                                                                                                                         |
| Anchor step       | —                                                             | **new:** the published color sits unchanged at the step closest to its lightness, not at a fixed step. The other steps follow Tailwind's lightness curve, keeping the input's relative chroma.                                                                                                                                                                                                                                                                                                                                                               |
| Role steps        | —                                                             | **new:** chosen per family × flavor × intent at generation time, and stored as data. The fill uses the anchor step when its foreground passes 4.5:1 and the fill passes 3:1 against the page, otherwise the nearest step where both pass.                                                                                                                                                                                                                                                                                                                    |
| `-border` roles   | —                                                             | **new:** decorative, with no contrast requirement. Control boundaries use the neutral `input` border and the focus ring; the fill, which the role-step rule holds at 3:1 against the page, serves as the ring.                                                                                                                                                                                                                                                                                                                                               |
| Axis independence | —                                                             | **new:** each axis is selected on its own, so the CSS grows by flavors plus intents, not their product                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Drift guard       | —                                                             | **new:** generated output is committed (the registry needs static files). Snapshot tests pin the values, and CI fails when a fresh run differs from the committed output.                                                                                                                                                                                                                                                                                                                                                                                    |
| Gamut             | —                                                             | **new:** sRGB only for v1. Generated colors are gamut-mapped to sRGB and contrast is computed there, since WCAG contrast is defined in sRGB.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Contrast pairs    | —                                                             | **new:** the token data declares which role pairs are checked, each with its requirement type (text, non-text, decorative). Components add pairs as they're built.                                                                                                                                                                                                                                                                                                                                                                                           |

Still agreed and unchanged:

- **Data:** typed TypeScript in a private `packages/tokens`, written through `defineFamily`-style helpers. A plain `satisfies Family` widens the names to `string` and drops the reference checks.
- **Field name:** `primary` in the model.
- **Roles:** shadcn's 31 color names (32 cssVars with `radius`, as 0002 counts), plus `destructive-foreground` and the three status roles. The intent roles (`-hover`, `-subtle`, `-border`, `-text` for each intent) are new; see the table.
- **Style and typography:** separate axes, with Vega's values as the default style.
- **Z-index:** included.

## Findings

### Why the contrast pick fails

| Family                              | Measured                                                                                                                                                                                                                                                                                        | Source                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Catppuccin Latte                    | With the style guide's "On Accent: Base", 12 of 14 accents fail 4.5:1 (yellow 2.31). With the best foreground from the whole palette, only mauve (4.79) and red (4.80) pass. Against `#fff`, only mauve, red and blue pass. 9 accents are under 3:1 on base, so they fail even as a focus ring. | `catppuccin/palette` `palette.json`, style guide |
| Catppuccin Mocha, Macchiato, Frappé | Every accent passes. The lowest is 4.65 (Frappé).                                                                                                                                                                                                                                               | same                                             |
| Rosé Pine Dawn                      | The best in-palette foreground on gold is 3.24 and on rose 2.74; only pine passes. `muted` on base is 2.73.                                                                                                                                                                                     | `rose-pine/palette` `source/index.ts`            |
| Gruvbox soft                        | Dark-soft red on bg0 is 3.82. Light-soft faded yellow is 3.00.                                                                                                                                                                                                                                  | `morhetz/gruvbox` `gruvbox.vim`                  |
| Nord                                | nord10 reaches 3.50 at best and nord11, the error red, 3.55, against every Nord neutral                                                                                                                                                                                                         | `nordtheme/nord` `nord.css`                      |

The Rosé Pine repo's top-level `palette.json` gives Dawn's `text` a different value (`#464261`) from `source/index.ts` (`#575279`). With it, gold's best is 4.24 and rose's 3.34, so only pine still passes.

Existing shadcn ports show the same problem:

- **tweakcn's Catppuccin preset:**
  - light `accent` (sky) on white is 2.79:1;
  - light `chart-5` is 2.34:1;
  - Mocha's `muted` takes Frappé's mantle, a color from another flavor.
- **`arthur404dev/tailwindcss-shadcn-catppuccin-theme`:** sets `--muted-foreground` to the same value as `--background`, so muted text is invisible.

The other systems avoid this in one of three ways:

- **Construction:**
  - Material builds every role with a contrast curve (`onPrimary` is `ContrastCurve(4.5, 7, 11, 21)`).
  - Leonardo generates colors to target ratios.
  - Radix guarantees APCA Lc 60 and Lc 90 for steps 11 and 12 on step 2.
- **Testing:** Primer's `colorContrast.config.ts` lists about 187 pairs and fails the PR in CI.
- **Hand-written foregrounds:** Radix sets `--amber-contrast` to a dark sand. Park UI keeps a `BRIGHT_COLORS` list (amber, yellow, lime, mint, sky) that get dark text.

### Scales

Every library puts a layer between a palette color and the roles components use. They differ in where the meaning lives:

- **In the step number (Radix):** each of the 12 steps has one job, and components use step numbers directly.

  | Steps | Use                                                   |
  | ----- | ----------------------------------------------------- |
  | 1–2   | App background, subtle background                     |
  | 3–5   | Component background at rest, hover, pressed          |
  | 6–8   | Border: non-interactive, interactive, strong or focus |
  | 9–10  | Solid fill, its hover                                 |
  | 11–12 | Low-contrast text, high-contrast text                 |

- **In named roles (Park UI, Chakra):**
  - Park UI's preset generates steps 1–12 plus alpha steps for each palette. Its variant roles (`solid`, `subtle`, `surface`, `outline`, `plain`) include `hover` and `active` tokens.
  - Chakra gives every hue 8 roles: `contrast`, `fg`, `subtle`, `muted`, `emphasized`, `solid`, `focusRing`, `border`. Recipes read them through the `colorPalette` virtual token, so changing the palette changes them all.
- **In a lightness ramp:**
  - shadcn's blue theme sets `chart-1..5` to one hue going from oklch L 0.809 down to 0.424.
  - `catppuccin/tailwindcss` builds 50–950 shades for every accent in Sass.

We put the meaning in named roles, not in step numbers as Radix does, so the steps can be a plain lightness ramp numbered like Tailwind's:

- Tailwind's palette has 11 steps (50 lightest, 950 darkest), and its colors page makes the entire palette available across all color utilities; it gives no step a job. So step numbers mean lightness only.
- A role is a CSS variable pointing at a step. For example, `--primary-subtle` is `var(--primary-100)` in light mode and `var(--primary-900)` in dark mode.
- Components use roles (`bg-primary-subtle`), never steps. A theme or mode switch re-points the roles, and components need no `dark:` variants. The raw steps stay available as Tailwind colors for app code.

The roles also split two jobs that one `-foreground` role does today, as Chakra separates `contrast` from `fg`:

- **`primary-foreground`:** text on the filled background.
- **`primary-text`:** accent-colored text on the page. Links, outline buttons, soft badges and alerts need it, and shadcn's 31 color names have no role for it.

**Neutrals stay hand-mapped:**

- Catppuccin's crust, mantle, base and surface0–2, and Rosé Pine's base, surface and overlay, are each family's own choices.
- In Rosé Pine Dawn, `surface` (`#fffaf3`) is lighter than `base` (`#faf4ed`).
- Base16 Catppuccin puts accents in base06 and base07.

A generated neutral ramp would erase that identity, so neutrals and surfaces alias primitives by name.

**How steps are filled** is covered in [Building scales](#building-scales).

### Contrast requirements

- **Primer** (ADR-010 and `colorContrast.config.ts`) types each pair `contrast.text` (4.5:1) or `contrast.border` (3:1). High-contrast themes raise these to 7:1 and 4.5:1.
- **Material** gives `outline` a curve starting at 3.
- **Primer's checks don't depend on how a value was chosen.** It checks every declared pair, whether hand-written or derived.

Families will mostly be plain aliases to fixed palettes. Those are the roles the measurements above show failing, so the test covers declared pairs, not only computed values.

WCAG 2.2 stays the gate and APCA is advisory, as in 0001. Radix tests with APCA, but WCAG 2.2 is the current W3C Recommendation and APCA is not normative.

### Theme axes

**The DTCG Resolver** is part of the Design Tokens Technical Reports 2025.10, a Final Community Group Report published on 2025-10-28. It models theme dimensions as `modifiers`:

- each modifier has `contexts` (for example `{ light, dark }`) and a `default`;
- `resolutionOrder` sets the merge order;
- every combination resolves to one full token set;
- aliases resolve after the merge, so a modifier can re-point them.

**Tool support for the Resolver:**

- Terrazzo 2.7.1 implements it and writes Tailwind v4 output.
- Style Dictionary 5.5.5 doesn't support it yet (style-dictionary#1590).

**Axes the Resolver model would let us add later:**

- **Contrast:**
  - Material's `contrastLevel` (−1 to 1);
  - Primer's high-contrast themes;
  - Leonardo's `contrast` multiplier;
  - Gruvbox's soft/medium/hard, which changes only `bg0` and applies to light and dark separately.
- **Colorblind:** Primer remaps success from green to blue for protanopia-deuteranopia and tritanopia (`org.primer.overrides`).

Declaring our axes as modifiers leaves room for both without implementing them now.

**Flavors as deltas:** Panda's `themes` hold only the changes, behind `data-panda-theme`. That fits Gruvbox, where three contrast levels per mode would otherwise be six near-identical flavors.

**Families with no light flavor:**

- Nord has no light theme. Its `visual-studio-code` repo ships only `nord-color-theme.json`, and issue nord#46 has been open since 2017.
- On nord6, Nord's lightest neutral, its accents score 1.35–3.55. So we _infer_ a light Nord built from the same accents wouldn't pass.

### Format

| Point          | Finding                                                                                                                                                                                             | Effect on our model                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Color values   | DTCG colors are `{ colorSpace, components, alpha?, hex? }`. There are 14 spaces, including `oklch` and `display-p3`.                                                                                | Store structured values with alpha. shadcn's dark border is `oklch(1 0 0 / 10%)`.                                      |
| References     | `"{color.blue}"` must point at a complete token, and nothing can alias a whole group. A `$ref` JSON Pointer can target one component, so a reference can reuse a color with its own alpha.          | Use full paths. "Which scale this theme uses" belongs to an axis, not an alias.                                        |
| Derived values | DTCG has no operations (#224 and #88 are open), so computed values must be precomputed. Tools must keep `$extensions` data they don't understand.                                                   | Tag generated steps and foregrounds under our own reverse-domain key, so an export doesn't treat them as hand-written. |
| `$type`        | Inherited from the group                                                                                                                                                                            | Set it per group                                                                                                       |
| IDs            | Spectrum gives every token a `uuid` with `deprecated` and `renamed`. Primer keeps `removed.json` with a CI check.                                                                                   | Add `deprecated` and `renamed` now. shadcn's preset code puts IDs in shareable URLs, so IDs stay stable.               |
| Usage          | Primer generates `DESIGN_TOKENS_SPEC.md` for LLMs from per-token `org.primer.llm` usage and rules                                                                                                   | Give each token a `description` and `usage`                                                                            |
| Typography     | DTCG's composite `typography` type maps to Tailwind's `--text-x` and `--text-x--line-height` pairs (Terrazzo `plugin-tailwind` 2.6.0). Chakra's `textStyles` bundle size, line height and tracking. | Make type-scale entries composites, not separate lists                                                                 |

Writing TypeScript first doesn't block a DTCG export, provided the shapes above map one to one (_inferred_). Terrazzo is worth trying once there's a DTCG export: it validates, lints contrast, and writes Tailwind v4 output.

## Leave room for, don't build now

- **Independent gray axis.** Radix and Park UI pair any accent with any gray (Radix's `grayColor: auto` maps blue to slate, red to mauve). For us a shadcn base color _is_ a family's gray, and Catppuccin brings its own. So v1 makes no gray axis. The modifier model can add one.
- **Alpha steps.** For borders and hover fills that work on any background, and translucent panels. Catppuccin's selection is Overlay 2 at 20–30% opacity, and Rosé Pine's highlights each have an alpha variant. Add them when a component needs one. Radix's generator solves each alpha step against the background (`generate-radix-colors.tsx`, about 140 lines, MIT), and that solver doesn't depend on the step count.
- **More roles.** Possible later roles:
  - link and selection (with an inactive state);
  - line, row or search highlight;
  - tooltip;
  - a third text tier;
  - ordered surface levels (Material has seven surface containers, Spectrum has `background-layer-1/2`).

  tinted8's `ui.*` keys (0.2.0-beta11) are a ready list. Components decide which roles exist, and none of ours needs these yet.

- **Shadows.** They differ by mode in Chakra, so when they arrive they belong on the color side, not the style axis.
- **Density sets.** Spectrum gives control height two values (32px desktop, 40px mobile), and Primer switches sizes by pointer type (`size-fine`, `size-coarse`). That is a set of style values per context, not a multiplier, so it fits the modifier model.
- **Contrast level and colorblind contexts.** See [Theme axes](#theme-axes).

## Left to `ui-2mi.2` (CSS and registry output)

The shadcn points below come from reading its source at `d75a96a`; we haven't run `shadcn add` against them (_inferred_ behavior).

- **Re-scoping aliases.** Variables that point at other variables go stale when a nested `[data-theme]` changes the family. Both layers are affected: `--primary-500: var(--mauve-500)` and the roles on top of it, set in `:root`, don't follow a family change on a child element. Terrazzo redeclares aliases in every scope. The other choice is to emit resolved values.
- **shadcn `cssVars`.** Its schema accepts only `theme`, `light` and `dark`, so only `:root` and `.dark` can be targeted. Any other combination goes through the free-form `css` field.
- **Color values in `cssVars`.** The updater adds a `--color-X` bridge only when a value starts with `oklch`, `hsl`, `rgb` or `#`. A `var()` value gets the wrong bridge.
- **`radius` expansion.** shadcn expands `radius` into `--radius-sm` … `--radius-4xl` with fixed multipliers.
- **Item type.** tweakcn emits `registry:style`; shadcn's docs describe `registry:theme` as "for themes". Pick one and test it with `shadcn add`.

## Rejected

- **A density multiplier instead of purpose tokens.** Radix's `scaling` multiplies space, type and radius together. 0002 measured that shadcn's styles don't scale together: button height drops 22% from Vega to Mira while dialog padding drops 33%.
- **APCA as the contrast gate.** See [Contrast requirements](#contrast-requirements).

## Building scales

A follow-up pass answered two questions: build scales by hand or generate them, and whether generated steps are acceptable when a family never published them.

### Generators

| Tool                                                                                  | Keeps the input exactly?                                                                         | Contrast guarantee                                  | Usable here?                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix custom palette (`radix-ui/website` `components/generate-radix-colors.tsx`, MIT) | Yes, at step 9, unless the input is within ΔEOK 0.25 of the scale's step 1 (near the background) | None; one APCA 40 threshold picks the text color    | Our research agent ran it: Latte yellow's step 9 is lighter than its step 8, and Radix picks white text on it (APCA 50.7 passes its threshold), which is 2.62:1 WCAG. Mocha mauve's steps 9 and 11 are nearly the same lightness (0.787 and 0.781). |
| Leonardo `@adobe/leonardo-contrast-colors` 1.1.0 (Apache-2.0)                         | Only when asked for its exact ratio                                                              | Yes, by construction                                | Output depends on the background, so light and dark need separate runs                                                                                                                                                                              |
| Material Color Utilities 0.4.0 (Apache-2.0)                                           | No: `#f38ba8` sits at tone 69.72 and `tone(70)` gives `#f48ca9`                                  | A tone difference of 40 gives ≥3:1, 50 gives ≥4.5:1 | The root import failed on Node 26.10 in our research agent's run (`ERR_MODULE_NOT_FOUND`)                                                                                                                                                           |
| Tailwind v4's palette                                                                 | —                                                                                                | —                                                   | No documented method; PR #14693 calls it a first draft "expecting these will be further refined". We _infer_ it is hand-tuned.                                                                                                                      |
| `catppuccin/tailwindcss` 1.0.0 (MIT)                                                  | Yes, always at 500                                                                               | None                                                | Mixes in linear sRGB toward the flavor's base and white or black. Mocha's 950 comes out mid-light (`#905367`).                                                                                                                                      |
| tints.dev                                                                             | Yes, at a chosen step                                                                            | None                                                | Its `LICENSE` is CC BY-NC 4.0, which rules out reuse in a published library                                                                                                                                                                         |
| chroma-js 3.2.0, culori 4.0.2                                                         | Yes, if the input is a sample point                                                              | None                                                | Building blocks we'd write the ramp logic on                                                                                                                                                                                                        |

No off-the-shelf generator both keeps the published color and guarantees contrast. Pinning the color at a fixed step (Radix's 9, Catppuccin's 500) breaks when its lightness doesn't suit that step.

### Contrast experiment

We generated 50–950 scales from the real Catppuccin (Latte, Mocha), Rosé Pine (Dawn, Main) and Nord accents. Each generator kept the exact accent at the step nearest its lightness, and we measured the planned role pairs against each flavor's real background (WCAG 2.1, colors gamut-fit to sRGB and rounded to hex first). Three generators:

- **a:** Tailwind's mean lightness per step, chroma at Tailwind's relative curve.
- **b:** the same, keeping the input's own relative chroma.
- **c:** each step solved to a contrast target against the background, as Leonardo does.

Results:

- **Text roles pass everywhere.** Accent text on the page and on its subtle background passes 4.5:1 for every accent in every flavor, with every generator. With palette colors alone, Latte passed 2 of 14, Dawn 1 of 6 and Nord on its light background 0 of 9.
- **A fixed light fill at step 600 fails text on the fill.** At that lightness (L ≈ 0.598) the best foreground (family neutrals or white) straddles 4.5:1: 3.8–5.0 depending on family and hue, and Nord tops out at 4.24. With generators a and b, 7 of 14 Latte accents pass, 3 of 6 Dawn and 0 of 9 Nord-light. At step 700, all pass.
- **Borders at 300 (light) never reach 3:1** against the page, and at 700 (dark) only a few do with generators a and b (1–4 of 14 Mocha accents, 3 of 6 Main). In light mode only the fill step does.
- **The fill is rarely the exact published color with fixed steps:** 4 of 14 Latte and 1 of 6 Main with generator a, and none with generator c in Mocha or Main. The mean OKLab distance from the fill to the nearest published color is 0.03–0.12; about 0.02 is just noticeable (_inferred_).
- **Generator b stays closest to the palette's look** for pastel flavors (Nord-dark 0.039 vs 0.072 for a).

So the generator follows b, the anchor step depends on the color's lightness, and role steps are chosen per family rather than fixed, keeping the exact color whenever its foreground passes.

### Fidelity

Every family's official tooling already derives colors:

- **Catppuccin:**
  - The style guide prescribes selection as Overlay 2 at 20–30% opacity and diff backgrounds at 10–25%.
  - The VS Code port derives hovers with tinycolor (`shade(accent, 0.07)`).
  - The Tailwind port ships tints and shades. Those come from palette PR #121, which is still a draft, so the palette itself hasn't ratified them.
- **Rosé Pine:** its builder, rose-pine-bloom 4.0.0, ships alpha variants (`$love/10`) and numbered shades. Its numbering runs the opposite way to Tailwind's: 50 is darkest.
- **Nord:** its ports use alpha colors throughout, and the comment color `#616E88` is a lightened `nord3`.
- **tinted8 (0.2.0-beta11):** derives bright and dim variants by formula, but values a scheme sets are used as-is.
- **Gruvbox:** the exception; it hand-writes three intensities per hue.

So generated steps are acceptable on three conditions, which the decisions above meet:

- The published color appears unchanged at a known step.
- The derivation is deterministic and documented.
- A hand-written value always beats a derived one.

Our docs should say which steps are derived, especially for Catppuccin while PR #121 is open.

## Sources

All accessed 2026-10-01 or 2026-10-02.

- Radix: [radix-ui/themes](https://github.com/radix-ui/themes) (`styles/tokens/color.css`, `radius.css`, `helpers/get-matching-gray-color.ts`), [radix-ui/colors](https://github.com/radix-ui/colors), [Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale), [custom palette tool](https://www.radix-ui.com/colors/custom)
- Tailwind CSS: [Colors](https://tailwindcss.com/docs/colors), [tailwindcss#14693](https://github.com/tailwindlabs/tailwindcss/pull/14693)
- Scale generators: [radix-ui/website](https://github.com/radix-ui/website) (`components/generate-radix-colors.tsx`), [@adobe/leonardo-contrast-colors](https://www.npmjs.com/package/@adobe/leonardo-contrast-colors), [@material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities), [tints.dev](https://github.com/SimeonGriggs/tints.dev), [culori](https://github.com/Evercoder/culori), [chroma-js](https://github.com/gka/chroma.js)
- Chakra UI v3: [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui) (`theme/semantic-tokens/colors.ts`, `recipes/button.ts`)
- Park UI and Panda: [chakra-ui/park-ui](https://github.com/chakra-ui/park-ui) (`packages/preset/src/theme/colors`, `generate-colors.ts`), [Panda multiple themes](https://panda-css.com/docs/theming/multiple-themes)
- Material 3: [material-color-utilities](https://github.com/material-foundation/material-color-utilities) (`dynamic_scheme.ts`, `color_spec_2021.ts`), [material-web tokens](https://github.com/material-components/material-web/tree/main/tokens)
- Adobe: [spectrum-design-data](https://github.com/adobe/spectrum-design-data), [Leonardo](https://github.com/adobe/leonardo)
- Primer: [primer/primitives](https://github.com/primer/primitives) (`scripts/themes.config.ts`, `scripts/colorContrast.config.ts`, `scripts/buildLlm.ts`)
- DTCG 2025.10: [Format](https://www.designtokens.org/TR/2025.10/format/), [Color](https://www.designtokens.org/TR/2025.10/color/), [Resolver](https://www.designtokens.org/TR/2025.10/resolver/); [community-group#238](https://github.com/design-tokens/community-group/issues/238)
- Tools: [style-dictionary#1590](https://github.com/style-dictionary/style-dictionary/issues/1590), [Terrazzo](https://github.com/terrazzoapp/terrazzo), [sd-transforms](https://github.com/tokens-studio/sd-transforms)
- shadcn at `d75a96a`: `apps/v4/registry/themes.ts`, `packages/registry/src/registry/schema.ts`, `packages/registry/src/utils/updaters/update-css-vars.ts`; [tweakcn](https://github.com/jnsahaj/tweakcn) (`utils/theme-presets.ts`)
- Theme families: [tinted-theming/home](https://github.com/tinted-theming/home) (`styling.md`, `specs/tinted8`), [catppuccin/palette](https://github.com/catppuccin/palette), [Catppuccin style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md), [catppuccin/tailwindcss](https://github.com/catppuccin/tailwindcss), [catppuccin/palette#121](https://github.com/catppuccin/palette/pull/121), [catppuccin/vscode](https://github.com/catppuccin/vscode) (`src/theme/utilities.ts`), [rose-pine/rose-pine-bloom](https://github.com/rose-pine/rose-pine-bloom), [rose-pine/palette](https://github.com/rose-pine/palette) (`source/index.ts`), [morhetz/gruvbox](https://github.com/morhetz/gruvbox), [nordtheme/nord](https://github.com/nordtheme/nord)
