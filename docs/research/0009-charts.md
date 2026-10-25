# Research: Charts

Date: 2026-10-24
Related: bead `ui-o2f.64` (the port) · bead `ui-o2f.18` (library decided: TanStack Charts) · bead `ui-2mi.13` (chart palette) · [components.md](../best-practices/components.md)

## Summary

Four surveys fed the Chart port: a re-check of TanStack Charts from its npm tarballs and repository, a feature comparison of eleven chart libraries, chart accessibility guidance mapped to WCAG 2.2 AA, and the most-reacted community issues. TanStack Charts still fits: version 1.1.0 covers every chart type shadcn's examples use at about 40% of recharts' size. Its API is a definition object of composable marks rather than chart components, so our `chart.tsx` is a wrapper of our own that keeps shadcn's `ChartConfig` idea. Two things the library leaves to us decide the baseline: a data table as the guaranteed route to exact values, and an announcement path that doesn't depend on the tooltip. Nothing was rendered in a browser or a screen reader, so whether a point focused inside TanStack's `role="img"` SVG is announced is unknown; the decision below makes that a manual check, not a blocker.

## Findings

### TanStack Charts, re-checked

- **Package:** `@tanstack/charts` 1.1.0 (1.0.0 on 2026-10-03, 1.1.0 on 2026-10-09; `npm view`). Import from `@tanstack/charts/react`; `@tanstack/react-charts` is now a compatibility package. No breaking changes between 1.0.0 and 1.1.0's public types. 1.1.0 added a `"use client"` marker to the React entries.
- **Maintenance:** 41 of 42 commits since 1.0 are by one author, in bursts; npm publish rights are shared by three maintainers. About 36 open issues, most filed in one week by one reporter; 21 have been closed since 1.0.
- **API:** a grammar of marks like Observable Plot: `defineChart({ marks, scales, theme })` with `lineY`, `areaY`, `barX/Y`, `stack`, `dot`, `pie`/`radialArc`, polar marks for radar and radial bars, and D3 scale factories. Tooltip, crosshair, brush and zoom are opt-in extensions; the legend is either static SVG or an HTML `interactiveColorLegend`.
- **Theming:** the default palette is `var(--ts-chart-1…6, <hex>)`, text and grid use `currentColor`, and the tooltip reads `--ts-chart-tooltip-*`, so our tokens map straight onto it. Its own shadcn conformance cases use `var(--border)` and `var(--muted-foreground)`.
- **SSR and motion:** the server renders the SVG at `initialWidth` and the client takes over; `respectReducedMotion` checks `prefers-reduced-motion` (`motion.js:141`).
- **Size (measured, esbuild, minified ESM, gzip -9):** `Chart` plus `lineY` 31.4 KB; line, area, bar, dot, stack, crosshair, tooltip and interactive legend 47.8 KB; plus polar 56.9 KB. recharts 3.10.1 with the same set: 121.3 KB, and 133.4 KB with pie, radar and radial bar. `motion()` adds about 22 KB and a time scale about 10 KB (from the issues, not measured).
- **Coverage:** no chart-type gap against shadcn; the repository carries 71 `shadcn-*` conformance cases (area, bar, line, pie, radar, radial, tooltip variants).
- **Open issues that touch us:** keyboard focus and Escape ([#189](https://github.com/TanStack/charts/issues/189)); gradient paints on focus guides and the crosshair that ignore `idPrefix` ([#211](https://github.com/TanStack/charts/issues/211)); no whole-column radius on stacked bars, which shadcn's stacked bar uses ([#202](https://github.com/TanStack/charts/issues/202)); a custom React tooltip body lagging a frame ([#239](https://github.com/TanStack/charts/issues/239), fix unreleased).

### Accessibility, as TanStack implements it and as guidance asks

- **TanStack's code:** the root is `<svg role="img" aria-roledescription="chart" aria-label>` with a `<desc>` from `ariaDescription`; `ariaLabel` is required. Arrow keys, Home and End move a virtual focus between points while DOM focus stays on the root (no `aria-activedescendant`, marks are hidden); Enter or Space pins the tooltip. The tooltip is a polite `role="status"` region and the only announcement for point navigation, so with the tooltip off, keyboard navigation is silent (read from code). The interactive legend is native buttons with `aria-pressed` in a group; brushes are sliders. It has no data table; its accessibility guide leaves exact values to the app.
- **The risk:** `role="img"` makes its children presentational (ARIA 1.2), so a screen reader may never reach a point focused inside it. SVG-AAM says a focused element is exposed anyway, but no source tests VoiceOver or NVDA on this. MUI X and Highcharts avoid it with DOM proxies kept in sync with focus.
- **Guidance:** W3C's complex-images tutorial and the UK Government Analysis Function ask for a short name plus a visible long description (figure and caption), not text hidden in `aria-describedby`. Chartability treats a missing data table as a critical failure; Highcharts and Visa ship a "view as table". GAF and others ask for direct labels or shapes so color isn't the only cue.
- **WCAG 2.2 AA for a chart:** 1.1.1 (name plus description or table), 1.3.1 (a real HTML table), 1.4.1 (not color alone), 1.4.3 (4.5:1 text inside the SVG), 1.4.10 (the table reflows), 1.4.11 (3:1 for marks that carry meaning and focus rings; lines against the background, not each other), 1.4.13 (tooltips dismissible and hoverable), 2.1.1 and 2.1.2 (keyboard, Tab leaves), 2.4.7 and 2.4.11 (focus visible and not hidden by the tooltip), 2.5.8 (24 px legend targets), 4.1.2 (legend toggles and sliders named with state).
- **Keyboard models elsewhere:** MUI X moves within a series with Left/Right and between series with Up/Down, plus Home/End; Highcharts tabs between chart parts and uses arrows within; Visa drills in and out with Enter and Shift+Enter.

### Features across libraries

From shadcn's `chart.tsx`, Intent UI, Tremor, Mantine Charts, MUI X Charts, Chakra UI charts, Ant Design Charts, Nivo, visx, Adobe's React Spectrum Charts, Untitled UI and Highcharts. React Aria and Spectrum 2 have no charts.

| Feature                              | Who has it                                                                                                                                                  | Note                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Series config map                    | shadcn and Intent (`ChartConfig`), Chakra (`useChart` with totals and percentages), Tremor and Mantine (arrays)                                             | shadcn scopes `--color-<key>` per chart by `[data-chart]`                   |
| Tooltip indicator styles, formatters | shadcn (`dot`, `line`, `dashed`), Tremor, Nivo, MUI                                                                                                         | Shared tooltip and crosshair: Nivo `enableSlices`, visx, MUI `trigger`      |
| Interactive legend                   | Highlight: Intent (React Aria `ToggleButtonGroup`, every item named "Legend Item"), Chakra, Mantine, Tremor. Hide: MUI `hiddenItems`, Nivo, Spectrum Charts | shadcn's legend is static; none offers both modes                           |
| Empty, loading, error states         | MUI overlays, Ant (`errorTemplate` and an error boundary), Spectrum Charts, Tremor `noDataText`                                                             | shadcn and Intent have none                                                 |
| Locale-aware formatting              | Chakra (`Intl` with the locale), MUI `localeText`, Spectrum Charts `locale`                                                                                 | shadcn's tooltip calls `toLocaleString()` and its examples hardcode `en-US` |
| Reference lines, annotations         | Mantine, MUI, Nivo `markers`, visx, Spectrum Charts (`ReferenceLine`, `Trendline`)                                                                          | shadcn composes recharts primitives                                         |
| Sparklines                           | Tremor, Mantine, MUI, Ant `tiny/*`                                                                                                                          | Spectrum Charts' `BigNumber` takes one                                      |
| KPI or stat card                     | Tremor `Metric`, Spectrum Charts `BigNumber`                                                                                                                |                                                                             |
| Axis titles, tick density            | Tremor (`xAxisLabel`, `startEndOnly`), Intent                                                                                                               |                                                                             |
| Export                               | MUI (paid plans), Ant, Highcharts (PNG, SVG, CSV, table)                                                                                                    | No free shadcn-style library has it                                         |

### Community needs

Ordered by relevance to a shadcn-style chart, not by reaction count.

1. **Theming with CSS variables, oklch and dark mode:** shadcn [#7076](https://github.com/shadcn-ui/ui/issues/7076); shadcn's Tailwind v4 update changed `hsl(var(--chart-1))` to `var(--chart-1)`. TanStack's palette is CSS variables.
2. **Responsive sizing and blank charts:** shadcn [#8547](https://github.com/shadcn-ui/ui/issues/8547), recharts [#172](https://github.com/recharts/recharts/issues/172) (43 reactions), nivo [#867](https://github.com/plouc/nivo/issues/867). TanStack measures its container and takes `aspectRatio`.
3. **Upgrades that break code users own:** shadcn's recharts 3 upgrade, [#7669](https://github.com/shadcn-ui/ui/issues/7669) (144 reactions) and [#8486](https://github.com/shadcn-ui/ui/pull/8486). The same risk applies to a library at 1.1 that moves fast.
4. **SSR and bundlers:** recharts 3 can't render on the server ([#5997](https://github.com/recharts/recharts/issues/5997)) and its Redux dependency breaks dev builds ([#6117](https://github.com/recharts/recharts/issues/6117)).
5. **Tooltip placement and control:** recharts [#488](https://github.com/recharts/recharts/issues/488) (98), [#1231](https://github.com/recharts/recharts/issues/1231) (75); shadcn [#8005](https://github.com/shadcn-ui/ui/issues/8005).
6. **More chart types:** MUI X Sankey [#7930](https://github.com/mui/mui-x/issues/7930) (372), treemap (299), heatmap (295), radar (267); shadcn Sankey [#8090](https://github.com/shadcn-ui/ui/issues/8090).
7. **Zoom, pan and brush:** recharts [#710](https://github.com/recharts/recharts/issues/710) (94).
8. **Large data:** recharts 3 bar regressions ([#6267](https://github.com/recharts/recharts/issues/6267)); the shadcn proposal for TanStack ([#11460](https://github.com/shadcn-ui/ui/issues/11460)).
9. **Accessibility:** charts silent to screen readers ([shadcn #4209](https://github.com/shadcn-ui/ui/issues/4209)).
10. **Animation control:** recharts [#375](https://github.com/recharts/recharts/issues/375) (85), nivo [#732](https://github.com/plouc/nivo/issues/732).

## Candidates beyond shadcn's chart

For the user to pick from; each notes who has it and its cost. Candidates 1–3 are what the accessibility guidance treats as required for any chart; 4 and 7 carry the WCAG criteria for legends and color.

| #   | Candidate                                                                                         | Prior art                                | Cost                                                                  |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| 1   | Required title and description, rendered as a visible figure caption                              | W3C, GAF; TanStack requires `ariaLabel`  | Low                                                                   |
| 2   | "View as table": an HTML table from the chart's data, behind a disclosure                         | Highcharts, Visa, Chartability           | Low to moderate                                                       |
| 3   | An announcement for keyboard focus that works with the tooltip off, plus a visible 3:1 focus ring | MUI live region; TanStack's tooltip only | Low; a DOM proxy (MUI, Highcharts) would be moderate, ruled out below |
| 4   | Interactive legend with highlight and hide modes, controlled, each item named, 24 px targets      | MUI, Nivo, Chakra, Intent                | Low to moderate                                                       |
| 5   | Empty, loading and error states on the container                                                  | MUI, Ant, Spectrum Charts, Tremor        | Low                                                                   |
| 6   | Locale-aware value and date formatting from one formatter, defaulting to React Aria's locale      | Chakra, MUI, Spectrum Charts             | Low                                                                   |
| 7   | Series contrast checked as a token test (3:1 in both modes), direct labels and line markers       | GAF, WCAG 1.4.11; pairs with `ui-2mi.13` | Moderate                                                              |
| 8   | Reference lines and annotations as parts                                                          | Mantine, MUI, Nivo, Spectrum Charts      | Low to moderate                                                       |
| 9   | Sparkline and a stat card that takes one                                                          | Tremor, Mantine, MUI, Spectrum Charts    | Moderate                                                              |
| 10  | Shared tooltip and crosshair options, keeping shadcn's indicator styles                           | Nivo, visx, MUI                          | Low                                                                   |
| 11  | Axis titles and edge-only ticks                                                                   | Tremor, Intent                           | Low                                                                   |
| 12  | Image and CSV export                                                                              | Highcharts, Ant, MUI (paid)              | Moderate; later, its own bead                                         |

## Decision

Decided 2026-10-24 (user): a chart is mainly a visual element, so screen-reader behavior doesn't gate the port, but the chart does what it can for it. The caption, description and table carry the data for screen-reader users; point navigation stays as TanStack implements it, with no DOM proxy, and checking it in VoiceOver and NVDA is a manual check rather than a blocker.

- **The Chart port (`ui-o2f.64`):** candidates 1–6, 10 and 11.
- **With the chart palette (`ui-2mi.13`):** candidate 7.
- **Follow-up beads:** candidates 8, 9 and 12.

## Sources

- TanStack Charts: [repository](https://github.com/TanStack/charts), [v1.1.0 release](https://github.com/TanStack/charts/releases/tag/v1.1.0), [accessibility guide](https://github.com/TanStack/charts/blob/main/docs/guides/accessibility.md), [comparison](https://tanstack.com/charts/latest/docs/framework/react/comparison), [shadcn conformance cases](https://github.com/TanStack/charts/tree/main/benchmarks/conformance/cases); npm tarballs of `@tanstack/charts` and `@tanstack/react-charts` 1.0.0 and 1.1.0.
- Accessibility: [W3C complex images](https://www.w3.org/WAI/tutorials/images/complex/), [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [ARIA 1.2 img](https://www.w3.org/TR/wai-aria-1.2/#img), [SVG-AAM](https://www.w3.org/TR/svg-aam-1.0/), [Graphics-ARIA](https://www.w3.org/TR/graphics-aria-1.0/), [Chartability](https://chartability.github.io/POUR-CAF/), [GAF data visualisation](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts), [MUI X accessibility](https://mui.com/x/react-charts/accessibility/), [Highcharts accessibility module](https://www.highcharts.com/docs/accessibility/accessibility-module-feature-overview), [Visa Chart Components](https://github.com/visa/visa-chart-components), [Léonie Watson, accessible SVG line graphs](https://tink.uk/accessible-svg-line-graphs/), [Zong et al. 2022](https://arxiv.org/pdf/2205.04917).
- Libraries: [shadcn chart.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/chart.tsx), [Intent UI chart.tsx](https://github.com/irsyadadl/intentui/blob/4.x/src/components/ui/chart.tsx), npm tarballs of `@tremor/react` 3.18.7, `@mantine/charts` 9.7.3, `@mui/x-charts` 9.16.0, `@chakra-ui/charts` 3.37.0, `@nivo/line` 0.99.0, `@visx/xychart` 4.0.0, `@ant-design/charts` 2.6.7, `@adobe/react-spectrum-charts` 1.53.1, `recharts` 3.10.1; [Untitled UI charts](https://www.untitledui.com/react/components/line-bar-charts.md), [Highcharts export](https://www.highcharts.com/docs/export-module/export-module-overview), [MUI X export](https://mui.com/x/react-charts/export/).
- Community: the shadcn-ui/ui, recharts, mui-x, nivo, tremor and mantine issues linked above (reaction counts from `gh api search/issues` on 2026-10-24); [InfoQ on TanStack Charts](https://www.infoq.com/news/2026/09/tanstack-charts-alpha-introduced/).
