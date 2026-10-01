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

| Decision        | Choice                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Components      | Fork shadcn's React Aria base (`apps/v4/registry/bases/aria/ui`) and convert it to `tv`                       |
| Variant library | Keep tailwind-variants: slots, built-in merging, `extend`                                                     |
| Styles          | Built from tokens. No `cva`, no `cn-*` hook CSS, no registry build step; shadcn's styles are reference values |
| Themes          | Family × flavor × accent, with a primitive palette tier from the start                                        |
| Typography      | Font roles and a type scale as tokens; presets ship as `registry:font` items                                  |
| Icons           | One `icons.tsx` map with PascalCase keys, written as `IconPlaceholder` elements                               |
| Defaults        | An `oakoss/ui/base` (`registry:base`) item that sets `iconLibrary` and the default theme                      |

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
  - It uses `variant` with 6 options (ours uses `intent` with 5), has 8 sizes and adds a `LinkButton`.
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

## Changes to 0001

- **Primitive token tier:** needed from the start, no longer deferred until a second theme.
- **Status and chart colors:** needed from the start, no longer deferred.
- **`tv({ slots })` for multi-part components:** kept, applied to the forked components.
- **Token schema:** shadcn's 32 names become a subset of ours, replacing the planned ~19, plus the style tokens above.
- **Type scale:** font roles and a type scale become tokens, no longer deferred.
- **Icons:** components use the `icons.tsx` map, replacing icons as injected `ReactNode`. Icons a consumer passes in stay `ReactNode`.
- **Build order:** see below.

## Build order

1. **Docs app (PR 3)**, so later work can be shown live.
2. **Token generator:**
   - families, flavors, accents and style tokens in `@theme` namespaces;
   - the tailwind-merge config;
   - the contrast test;
   - Catppuccin and our default as the first two families.
3. **Foundations:**
   - `icons.tsx` with a runtime `IconPlaceholder` and the icon-name test;
   - the `oakoss/ui/base` item;
   - Button and TextField re-ported as the reference conversions.
4. **Component migration** in batches by category, starting with overlays (Dialog first). Each component records the shadcn commit it was forked from, so upstream fixes can be found by diffing.

## Still unverified

- An end-to-end `shadcn add` from our GitHub registry, with and without `iconLibrary` set.
- Whether Fumadocs' dark-mode toggle switches our components' colors (both use a `.dark` class).
- Whether React Aria popovers keep a per-preview theme when they render outside the preview wrapper.

## Sources

- [shadcn changelog: React Aria (July 2026)](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- [shadcn-ui/ui source](https://github.com/shadcn-ui/ui) at `d75a96a`: `apps/v4/registry/bases/aria`, `apps/v4/examples/aria`, `apps/v4/registry/styles`, `packages/shadcn/src/styles`, `packages/registry/src/utils/transformers/transform-icons.ts`, `packages/registry/src/registry/schema.ts`
- [shadcn registry item types](https://ui.shadcn.com/docs/registry/registry-item-json)
- [shadcn-ui/ui discussion #10269: presets and custom registries](https://github.com/shadcn-ui/ui/discussions/10269)
- [deanjstone/design-system PR #49: shipped `IconPlaceholder` without its file](https://github.com/deanjstone/design-system/pull/49)
- [Radix Themes: Theme component](https://www.radix-ui.com/themes/docs/components/theme)
- [@catppuccin/palette](https://www.npmjs.com/package/@catppuccin/palette) · [@rose-pine/palette](https://www.npmjs.com/package/@rose-pine/palette)
