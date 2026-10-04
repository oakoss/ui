# Research: Forking shadcn's React Aria Base

Date: 2026-10-01
Related: [0001 — Design System Foundations](./0001-design-system.md) (parts superseded below) · token generator · docs site

## Summary

In July 2026 shadcn/ui shipped an official React Aria base (`shadcn init --base aria`). It has 59 components built on react-aria-components, and they work with shadcn's eight styles, presets and shadcn/create. Most of what oakoss/ui planned to build already exists there under the MIT license. 0001 predates it.

We audited it against our two components and decided to:

- fork the base and convert it to tailwind-variants;
- implement shadcn-style "styles" as design tokens rather than shadcn's per-style CSS;
- support full theme families (Catppuccin, Rosé Pine, Gruvbox, Nord) with swappable fonts and icons from the start.

Every claim below comes from shadcn's source at commit `d75a96a` (2026-10-01) or from a command we ran. Unverified claims are labeled as such.

## Decisions

| Decision        | Choice                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Components      | Fork shadcn's React Aria base (`apps/v4/registry/bases/aria/ui`) and convert it to `tv`                                                        |
| Variant library | Keep tailwind-variants (slots, `extend`), using its `lite` build                                                                               |
| Class merging   | The `cn` package, through `cx`, replacing `tailwind-merge`; configured with our custom token names                                             |
| Styles          | Built from tokens. No `cva`, no `cn-*` hook CSS, no registry build step; shadcn's styles are reference values                                  |
| Themes          | Family × flavor × accent, with a primitive palette tier from the start                                                                         |
| Typography      | Font roles and a type scale as tokens; presets ship as `registry:font` items                                                                   |
| Icons           | One `icons.tsx` module, a PascalCase named export per icon written as an `IconPlaceholder` element; components import it as `import * as Icon` |
| Defaults        | An `oakoss/ui/base` (`registry:base`) item that sets `iconLibrary` and the default theme                                                       |

## Findings

### shadcn's React Aria base compared with ours

|                   | oakoss/ui             | shadcn React Aria base                             |
| ----------------- | --------------------- | -------------------------------------------------- |
| Components        | 2 (Button, TextField) | 59                                                 |
| Examples          | Storybook stories     | 501                                                |
| Structural styles | 0                     | 8 (Vega, Nova, Maia, Lyra, Mira, Luma, Rhea, Sera) |
| Themes            | 1 + dark              | 24 (7 neutrals, 17 accents)                        |
| Tokens per mode   | 14                    | 32                                                 |

Its interactive components wrap React Aria's own building blocks: Select, ComboBox, Dialog and Modal, Checkbox, Tooltip, Calendar and Tabs.

- **Button.**
  - It uses one `variant` prop with 6 options, has 8 sizes and adds a `LinkButton`. Ours splits look from color; see [Button](#button).
  - It sets `data-slot`, `data-variant` and `data-size` attributes.
  - It drops React Aria's function-style `className` (`Omit<…, "className">`), which our `cx` keeps.
- **Fields.** shadcn wires `Field`, `FieldLabel`, `Input` and `FieldDescription` together manually with `htmlFor`/`id`.
  - `FieldDescription` is a plain `<p>`, so nothing links it to the input through `aria-describedby`. Their `field-input` example shows this.
  - React Aria's own validation isn't used.
  - Our `TextField` composes React Aria's `TextField`, which connects all of this automatically. **We keep our field pattern.** This finding comes from reading the source, not from running a screen reader.
- **Styles.** Components carry `cn-*` hook classes. Each style is a CSS file of about 1,740 lines mapping hooks to Tailwind classes, with 416 hooks in Lyra. A build-time transform (`packages/shadcn/src/styles/transform-style-map.ts`) inlines them per style.
  - It reads variant definitions only from calls named `cva`, so `tv` definitions would be skipped. It also rewrites `className` attributes and `cn()` calls.

### Styles as tokens

We compared Vega's style file with five others, hook by hook. A hook counts as token-like when it differs only in these utilities:

- size: height, width, `size-*`, min and max sizes, padding, margin, gap, `space-*`;
- position and translate;
- radius, shadow, and border and ring utilities, both width and color;
- font size (including `text-xs/relaxed` and arbitrary sizes), weight, tracking, leading;
- opacity, backdrop blur and `bg-clip-padding`.

Border and ring colors count here, so a style that changes a part's focus treatment (`focus-visible:ring-ring/50`) is counted as token-like.

| Vega vs | Identical hooks | Only token-like differences | Some other difference |
| ------- | --------------- | --------------------------- | --------------------- |
| Nova    | 269             | 131                         | 21                    |
| Maia    | 252             | 129                         | 38                    |
| Luma    | 225             | 143                         | 52                    |
| Lyra    | 170             | 221                         | 23                    |
| Mira    | 174             | 197                         | 49                    |

Most "other" differences are which background color role a part uses (`bg-transparent` vs `bg-input/20`) and transition properties. Real layout changes are rare.

The values don't scale together, though. From Vega to Mira, button height drops from `h-9` to `h-7` (−22%), while dialog padding drops from `p-6` to `p-4` (−33%). So one global `--spacing` value can't reproduce the styles. They need about 10–15 purpose-named tokens: control height and padding, panel padding, ring width and opacity, UI text size, field background, badge radius.

Two Tailwind behaviors make this workable. We confirmed both with Tailwind 4.3.3 and tailwind-merge 3.7.0:

- **Tokens in `@theme` namespaces generate normal classes.** `--spacing-control` produced `.h-control { height: var(--spacing-control) }` and `.px-control`, and `--radius-control` produced `.rounded-control`.
- **tailwind-merge has to be told about custom names.** By default, `twMerge('h-control h-9')` returned both classes, so a user's override wouldn't reliably win. With `extendTailwindMerge({ extend: { theme: { spacing: ['control'], radius: ['control'] } } })`, it returned `h-9`.

### Class merging with `cn`

In September 2026 shadcn moved its components to the `cn` package, a replacement for `clsx` plus `tailwind-merge`. We tested `cn` 0.4.0 with tailwind-variants 3.3.1 and tailwind-merge 3.7.0:

- **Same output:** on 9 typical class sets (variant conflicts, state prefixes, arbitrary values, conditional objects), `cn(...)` matched `twMerge(clsx(...))` in all 9.
- **Custom tokens:** `createCn({ extend: { theme: { spacing: ['control'], radius: ['control'] } } })` from `cn/config` resolved `h-control h-9` to `h-9`, the same as `extendTailwindMerge`.
- **tailwind-variants bundles its own merger:** `tv` 3.3.1 includes a copy of the tailwind-merge engine, so full `tv` plus `cn` would run two merge engines, each needing the token config.
- **`tailwind-variants/lite` doesn't merge:** on its own it returned `inline-flex px-2 h-9 rounded-md px-4 h-8`. Passed through `cn` with a `rounded-none` override, it returned `inline-flex px-4 h-8 rounded-none`, the same as full `tv` plus `cn`. Slot functions behave the same way.

So components use lite `tv`, and `cx` does all merging with a `cn` instance built from the generated token config. Every `tv` result has to pass through `cx`; one that skips it ships unresolved conflicts, so the foundations step adds a lint rule or test for it.

Why tokens rather than shadcn's hook CSS:

- every class stays visible and autocompletes in the component file;
- `className` overrides merge normally;
- the docs picker switches styles live with no build;
- users can change style after installing without losing their edits. Re-adding components to switch shadcn styles overwrites edits (shadcn-ui/ui discussion #10269).

### Theme families

The palettes we checked differ in shape:

- **Catppuccin** (`@catppuccin/palette` 1.8.0) has one light flavor (latte) and three dark ones (frappe, macchiato, mocha), each with 26 colors including 14 accents.
- **Rosé Pine** (`@rose-pine/palette` 4.0.1) has two dark variants (main, moon) and one light one (dawn), each with 15 colors.
- **Gruvbox and Nord** were not checked: Gruvbox has dark and light variants in three contrast levels, and Nord is primarily a dark palette.

Light and dark therefore become a property of each flavor. Each family declares a default light/dark pair, so a system light/dark setting still works.

The accent is a choice within the palette. Status colors (success, warning, info) and five chart colors are needed from the start.

Editor palettes aren't designed for WCAG-compliant UI, so the generator picks the text color on each colored background by contrast. The contrast test also covers every flavor × accent.

### Icons

shadcn's install-time icon transform (`packages/registry/src/utils/transformers/transform-icons.ts`):

- **What it rewrites:** self-closing `<IconPlaceholder lucide="…" tabler="…" hugeicons="…" phosphor="…" remixicon="…" />` elements, replaced with the icon for the project's `iconLibrary`. Other props, including spreads, are kept.
- **Imports:** it removes the `IconPlaceholder` specifier from imports whose path contains `icon-placeholder`, and drops the declaration only when nothing else is imported from it.
- **Missing library prop:** an element without a prop for the project's `iconLibrary` is skipped, but its import is still removed, which leaves an `IconPlaceholder` with no import.
- **File types:** it runs on every registry file type except `registry:file` and `registry:item` (and `.env` files).
- **References:** a plain map such as `{ Check: CheckIcon }` is not transformed. Each `icons.tsx` entry must be an `IconPlaceholder` element.
- **Missing `iconLibrary`:** the file is returned unchanged, which leaves an import nobody installed.

Our approach:

- The `oakoss/ui/base` item sets `iconLibrary: "lucide"`, because only `registry:base` items can set `components.json` config.
- The icons item ships a fallback `icon-placeholder.tsx` that renders an empty square and logs how to fix the setup. A Lucide fallback would force `lucide-react` on everyone.
- Our items don't declare an icon package, because `shadcn init` installs the chosen one.
- Storybook and the docs need a runtime `IconPlaceholder`.
- A test checks that every `icons.tsx` entry sets all five library props and that each name exists in its package.

Settled in `ui-lwb.2` (2026-10-03):

- **Named exports, not an object.** Bundlers tree-shake per export but keep an object literal whole. Bundling an app that uses one icon, after the Lucide transform, esbuild kept every icon from the map and only that icon from named exports (6,584 B against 4,432 B); rolldown did the same (9,050 B against 5,402 B).
- **`import * as Icon` in components.** Icon names overlap component names (`Calendar`, `Menu`), and a namespace keeps them apart. A static namespace import tree-shakes like a named one: in a separate six-icon test, both forms bundled to the same size (esbuild 4,314 B, rolldown 5,404 B), against 5,423 B and 7,278 B when every icon was used. A lint rule rejects named imports from `icons.tsx`, and another keeps icon libraries out of component code.
- **Plain names, no `Icon` suffix or prefix.** After install, `icons.tsx` imports each library's icon by name: Lucide and Phosphor use `CheckIcon`, Tabler uses `IconCheck`. An export with either form would share that name and render itself. A test runs shadcn's `transformIcons` for all five libraries and fails on any such collision. Phosphor's plain names (`Check`) are deprecated in 2.1.10, so its `…Icon` names are used.
- **A wrapper per icon, not inline placeholders.** Upstream writes `<IconPlaceholder>` inside each component, so installs render the library icon directly. Ours adds one pass-through function per icon in exchange for a single tested source of names across every component.
- **`IconProps` omits `children` and narrows `strokeWidth` to a number**, because Remix Icon rejects children and HugeIcons wants a numeric stroke width. A typecheck-enforced assignment covers every library.
- **VS Code autocomplete** excludes the icon libraries and `icons.tsx` (`.vscode/settings.json`), so typing `Calendar` offers the component.

Settled in `ui-lwb.3` (2026-10-03), measured with shadcn 4.21.0 against local registry files:

- **`init` or `apply`, never `add`.** `shadcn add oakoss/ui/base` writes the item's CSS but leaves `components.json` byte-identical, so `iconLibrary` stays unset. `shadcn init` writes it into a new `components.json`. Over an existing one, `init` asks to overwrite and then replaces aliases and `style`; `apply` merges, keeping aliases and `style` while setting `iconLibrary`. `apply` also reset `baseColor` to neutral, which the item can't prevent. After `init`, `add button` installed `icons.tsx` with Lucide imports and no `IconPlaceholder` left.
- **`config` sets only `iconLibrary`,** since `apply` would overwrite any alias or `style` set there. **`extends: "none"`** stops `init` from also installing shadcn's own style and its packages.
- **The base item carries the CSS the theme's `cssVars` can't:** `color-scheme` lands in the `:root` and `.dark` blocks, and the reduced-motion `@layer base` block arrives intact; re-adding changes nothing, and Tailwind 4.3.3 compiles the result. The theme comes in through `registryDependencies`.

### Button

Settled in `ui-lwb.4` (2026-10-03), after comparing 15 libraries' button APIs from their source. Every React Aria-based one (HeroUI, Intent UI, Untitled UI, Jolly UI, shadcn's base) uses one flat `variant` prop; Radix Themes, Chakra, Park UI, Mantine, MUI, Ant Design and Catalyst split look from color.

- **Two props:** `variant` sets the look (`solid`, `soft`, `outline`, `ghost`, `link`) and `intent` the color (`primary`, `neutral`, `destructive`, `success`, `warning`, `info`), so each look reaches all five intent role sets. No aliases for shadcn's names: several would mean something else here (`secondary`).
- **CSS variables:** each intent sets `--btn-*` colors and each look reads them, so the styles grow as looks plus intents, not looks × intents. oxlint allows Button to set those variables to named theme colors and neutral's hover mix only; a test pins how `@shadcn/lint`'s allow patterns match.
- **Hover and press as a state layer.** Soft, outline and ghost tint their surface with their own text color, 8% on hover and 12% on press (Material's pattern), drawn as a gradient so it sits over the fill; solid fills swap to `<intent>-hover` on hover and press, plus a press scale; links underline. A whole-surface tint is a stronger cue than a 1px border change, and deriving it from the text color keeps it visible where `primary-subtle` equals the page in the gray families. Accent text sat at the 4.5:1 line, so the generator keeps it AA under the press layer (note 0004); a foreground layer on solid fills failed on keyboard and touch presses (3.83:1), hence the hover fill. `neutral` has no role set and uses the gray roles with opacity. The tokens package tests every hover and press across every theme.
- **One component plus `buttonStyles()`.** Icon sizes (`icon-sm`, `icon`, `icon-lg`) require `aria-label` or `aria-labelledby` in the props type. A link styled as a button is React Aria's `Link` with `buttonStyles({ className })`, which also serves TanStack Router's `createLink`; `render` can't change a button's element type. Other components export a `<name>Styles` helper only when something needs it.
- **Pending:** React Aria's `isPending`, with the label faded (not hidden) so the width and accessible name stay, and a `ProgressBar` named by `pendingLabel`.
- **`hover:` and `pressed:` come from `tailwindcss-react-aria-components`,** which matches React Aria's `data-hovered` and `data-pressed` (absent while pending or disabled) and falls back to `:hover` on plain elements, so `buttonStyles` on an `<a>` still hovers.
- **Checks:** Storybook renders every look × intent in light, dark, RTL and two other palettes for axe, hovers and presses each one, and a forced-colors project checks every look keeps a border in Windows High Contrast.

### Fields

Settled in `ui-lwb.4` (2026-10-03), after surveying 16 libraries' text fields from their docs and source. shadcn's React Aria `field.tsx` is plain DOM: `Field` is a `div`, `FieldDescription` a `<p>` and `FieldError` a `role="alert"` div, wired to the input by hand with `htmlFor`/`id` and `aria-invalid`, so the description never reaches `aria-describedby` and React Aria's validation is bypassed.

- **A `field` item** keeps upstream's names and `data-slot`s (`FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend`, `FieldGroup`, `Input`) but backs the first three with React Aria's `Label`, `Text slot="description"` and `FieldError`. They find their field through context, so they wire up inside any React Aria field (`SearchField` is tested). `Field`, `FieldContent`, `FieldTitle` and `FieldSeparator` wait for the checkbox and radio ports that use them.
- **`TextField` takes props or children.** `label`, `description`, `errorMessage`, `errors`, `placeholder` and `size` render the common layout; children replace it for custom layouts. The props type is a union, so mixing the two is a type error. This is the shape React Aria's starter, Jolly, Untitled and Spectrum call `TextField`, and the other fields will copy it.
- **`errors`** accepts what form libraries produce (TanStack Form types it as whatever the validators return): strings and objects with a `message` render, deduplicated, one per line (`FieldError` renders a span, and `aria-describedby` reads the text flat). Children win over `errors` unless empty. `FieldError` keeps React Aria's rule of rendering only while the field is invalid.
- **`Input` takes `size`** (`sm`, `md`, `lg`) on Button's control-height tokens, replacing HTML's character-width `size`. No variant or color props, and invalid is the only state, as in nearly every library surveyed.
- **Borders** use `input` at rest and `destructive-text` when invalid, both 3:1 (note 0004, Control borders). The required asterisk is `aria-hidden`, since React Aria already exposes the field as required.
- **Conventions** these decisions produced (state from render props, empty values mount nothing, message separators) live in [best practices](../best-practices/components.md).

## Changes to 0001

- **Primitive token tier:** needed from the start, no longer deferred until a second theme.
- **Status and chart colors:** needed from the start, no longer deferred.
- **`tv({ slots })` for multi-part components:** kept, applied to the forked components.
- **Token schema:** shadcn's 32 names become a subset of ours, replacing the planned ~19, plus the style tokens above.
- **Type scale:** font roles and a type scale become tokens, no longer deferred.
- **Icons:** components use `icons.tsx` through `import * as Icon`, replacing icons as injected `ReactNode`. Icons a consumer passes in stay `ReactNode`.
- **Build order:** see below.

## Build order

1. **Docs app (PR 3)**, so later work can be shown live.
2. **Token generator:**
   - families, flavors, accents and style tokens in `@theme` namespaces;
   - the `cn` merge config for custom token names;
   - the contrast test;
   - Catppuccin and our default as the first two families.
3. **Foundations:**
   - `icons.tsx` with a runtime `IconPlaceholder` and the icon-name test;
   - the `oakoss/ui/base` item;
   - `cx` on `cn`, with a lint rule or test that every `tv` result passes through it;
   - Button and TextField re-ported as the reference conversions.
4. **Component migration** in batches by category, starting with overlays (Dialog first). Each component records the shadcn commit it was forked from, so upstream fixes can be found by diffing.

## Still unverified

- An end-to-end install from our GitHub registry: `shadcn init` and `shadcn apply` with `oakoss/ui/base`, then `shadcn add`, with and without `iconLibrary` set. The base-item behavior above was measured with local registry files only.
- Whether Fumadocs' dark-mode toggle switches our components' colors (both use a `.dark` class).
- Whether React Aria popovers keep a per-preview theme when they render outside the preview wrapper.

## Sources

- [shadcn changelog: React Aria (July 2026)](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- [shadcn-ui/ui source](https://github.com/shadcn-ui/ui) at `d75a96a`: `apps/v4/registry/bases/aria`, `apps/v4/examples/aria`, `apps/v4/registry/styles`, `apps/v4/content/docs/changelog/2026-09-cn.mdx`, `packages/shadcn/src/styles`, `packages/registry/src/utils/transformers/transform-icons.ts`, `packages/registry/src/registry/schema.ts`
- [cn package](https://github.com/shadcn-ui/cn) (0.4.0 README: `cn/config`, tailwind-merge parity)
- [shadcn registry item types](https://ui.shadcn.com/docs/registry/registry-item-json)
- [shadcn-ui/ui discussion #10269: presets and custom registries](https://github.com/shadcn-ui/ui/discussions/10269)
- [deanjstone/design-system PR #49: shipped `IconPlaceholder` without its file](https://github.com/deanjstone/design-system/pull/49)
- [Radix Themes: Theme component](https://www.radix-ui.com/themes/docs/components/theme)
- [@catppuccin/palette](https://www.npmjs.com/package/@catppuccin/palette) · [@rose-pine/palette](https://www.npmjs.com/package/@rose-pine/palette)
