# Research: Chart Palette

Date: 2026-10-25
Related: bead `ui-2mi.13` (chart palette) · bead `ui-2mi.15` (chart color as a theme choice) · [0009 — Charts](./0009-charts.md) · [0011 — Chart Focus Marking](./0011-chart-focus.md)

## Summary

`--chart-1` to `--chart-5` were a ramp of the primary at steps 300 to 800, the same in light and dark, as shadcn's `/create` emits. Every one of our 308 family, flavor and primary combinations had a chart color under the 3:1 marks need, and the default neutral primary drew charts in gray. Systems that state a contrast target ship a categorical palette apart from the brand color, with light and dark values of their own. We chose one: five Tailwind hues, each at its own step per mode, ordered and spread in lightness so they reach 3:1 on every surface and stay apart under simulated color blindness. Catppuccin maps the same hues to its own colors.

## Findings

### Our palette before (measured with `@oakoss/tokens`)

- **Every theme failed 3:1.** Across 308 combinations, the lowest chart color sat between 1.28:1 and 2.89:1 against the page. A ramp can't pass in both modes: its light end fails on light pages and its dark end on dark ones.
- **The default primary is gray.** shadcn's `chartColor` defaults to its base gray, our Zinc and Neutral default, so charts carried no hue at all.

### What others do (from the sources linked in the survey)

| System                                                                                                             | Count                     | Light and dark differ | Contrast target                              | Color blindness                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------- | --------------------- | -------------------------------------------- | ------------------------------------------------------ |
| [Carbon](https://github.com/carbon-design-system/carbon-website/blob/main/src/data/data-visualization/palettes.js) | 14, with 1–5 color groups | Yes                   | None stated; all 14 measured at 3:1 per mode | Not stated                                             |
| [Atlassian](https://atlassian.design/foundations/color/data-visualization-color)                                   | 8 tokens                  | Yes                   | 3:1 on every surface (1.4.11)                | Ordered so neighbors differ under every deficiency     |
| [Primer](https://primer.style/product/ui-patterns/data-visualization/)                                             | 15 hues                   | Yes                   | 3:1 for marks                                | Color alone can't cover it; lines vary dash and marker |
| [Observable 10](https://observablehq.com/blog/crafting-data-colors)                                                | 10                        | No                    | None; 4 of 10 reach 3:1 on white             | Tuned for deuteranopia                                 |
| [Okabe–Ito](https://jfly.uni-koeln.de/color/)                                                                      | 8                         | No                    | None; yellow is 1.3:1 on white               | Its purpose                                            |
| [Tremor](https://github.com/tremorlabs/tremor/blob/main/src/utils/chartColors.ts)                                  | 9 Tailwind 500s           | No                    | None                                         | Collapses under deuteranopia                           |
| shadcn `/create`                                                                                                   | 5-step ramp of one hue    | No                    | None                                         | Not applicable                                         |

Sources agree on five or six colors at most, then dashes, markers or labels; separate tokens for categorical and sequential data; and the first two colors far apart in hue and lightness.

### Choosing the five (measured)

- **Search.** Every set of five Tailwind hues at least 45° apart, each at the step per mode that keeps the set furthest apart. Steps were limited to 500–800 in light and 300–500 in dark, so no series turns near-black or near-white. Each color had to reach 3:1 on the background, card, popover and muted surfaces of every gray family. Distance is CIEDE2000, worst case across typical vision and simulated deuteranopia, protanopia and tritanopia (Machado 2009, culori).
- **One step per mode isn't enough.** With every hue at one step per mode, the best set's worst case was about 9–10; varying lightness across the series raised it to about 15–16. A shadcn-style set of blue, emerald, amber, rose and violet fell to 1.2–2.7.
- **The pick.** Blue 600/500, yellow 700/300, red 600/400, teal 600/500 and fuchsia 800/300 (light/dark). Worst case 15.8 in light and 15.4 in dark; blue and yellow lead, the pair furthest apart. Yellow becomes a deep amber in light mode, since a yellow light enough to read as yellow fails 3:1 on white.
- **Catppuccin.** The same hues from its own palette, blue 600/200, yellow 600/200, red 600/500, teal 600/400 and mauve 800/400, searched the same way across Latte and the three dark flavors: worst case 11.7 in Latte and 11.9 in the dark flavors, against about 5 for its published accents.
- **A sixth series.** The chart maps TanStack's sixth color to the muted foreground gray, for an "Other" series. It reaches 3:1, but under tritanopia it can fall to 1.1 from teal, so it isn't held to the distinctness bar; the docs say to label it.

### The focus markers on the new colors

[0011](./0011-chart-focus.md)'s markers were rechecked against these colors. The line point's ring is two-toned: its fill is the page color, which every series holds 3:1 against (the palette test), and its stroke is the foreground, at text contrast with the page. The bar outline is a 3px foreground stroke centered on the bar's edge, so its outer half lies on the page at text contrast. Against the fills themselves the foreground falls as low as 1.03:1 (Catppuccin Macchiato's yellow), which only softens the outline's inner half; neither marker relies on that pair.

## Decision

Decided 2026-10-25 (user):

- Charts are a categorical palette apart from the primary, with a step per mode for each series (strategy 1 of the survey). The chosen five are the pick above, and Catppuccin uses its own colors for the same hues.
- Tests hold every theme's chart colors to 3:1 on its surfaces and to a worst-case distance of 10 under simulated color blindness.
- Choosing the chart colors in the theme generator, a ramp of a hue included, is bead `ui-2mi.15` (strategy 3). Putting the primary first (strategy 2) was dropped.
