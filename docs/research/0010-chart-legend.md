# Research: Chart Legend

Date: 2026-10-25
Related: bead `ui-o2f.64.2` (legend layer) · [0009 — Charts](./0009-charts.md) (candidate 4) · bead `ui-o2f.64` (the port)

## Summary

The legend layer needs a hide mode and a highlight mode, controlled, with each item named and a 24px target. TanStack Charts 1.1.0 ships `interactiveColorLegend`, which does both, but draws its own buttons with inline styles that our tokens can't reach. A spike found that its hide and highlight mechanics run without its buttons, so the legend is our own React Aria part driving TanStack's mechanics: hide through a zero-height color legend in the definition, highlight through a host control `ChartPlot` adds. Hide works only for series that come from the `color` channel, so charts name their series with `color` rather than `z`. A survey of nine libraries found none with hide, focus-driven highlight, named items and controlled state together.

## Findings

### TanStack Charts' legend mechanics (measured on 1.1.0 in node with happy-dom)

- **Hide keeps the axes.** `interactiveColorLegend` filters each mark's output after scales resolve (`legend.filterMark`, called from `scene.js`), so a hidden series keeps the domain: with series c hidden, y stayed `[10, 34]` for `lineY`, `areaY` and `barY`.
- **Hide runs without TanStack's buttons.** A color legend with `height: () => 0`, an empty `render`, and the `seriesVisible` and `filterMark` that `interactiveColorLegend()` returns, hid the series with no buttons in the DOM. Those two fields are typed on the exported `ChartColorLegend` interface but not described in TanStack's docs; writing our own `filterMark` would need an internal module, so we reuse the returned functions.
- **Hide needs the `color` channel.** Line, area and bar filter only when `color` sets the series and `z` is absent (`seriesFromColor: options.z === undefined && options.color !== undefined`). A `z` plus `stroke` line kept all three series with the legend set to one.
- **Highlight runs from outside, through a documented hook.** Host control extensions receive `setStateFocus(focus)`, which changes inline-state matching only, not focus, the tooltip or the cursor. A control with no DOM calling it with a series' points, plus a mark state `{ when: (c) => c.focus.source === 'legend' && !c.matches('series'), style: { opacity: 0.25 } }`, dimmed the other series on line, area and bar, and under the React adapter. It works for `z` series too. `host.interaction.setControlledFocus` also dims, but moves real focus and opens the tooltip.
- **Highlight can be added by `ChartPlot`.** `defineChart(definition, { controls })` is typed, and a `ChartControl`'s `resolve` returns host controls, which the renderer creates with `setStateFocus` (read from `scene.js` and `renderer.js`). The color scale can't be added that way: definition options cover behavior, not the spec.
- **Filtering rows instead rescales.** Dropping series c's rows moved y from `[10, 34]` to `[10, 24]`; an explicit `domain` option didn't hold it, only a configured scale instance did. Per-series opacity isn't a channel (`strokeOpacity` and `fillOpacity` take numbers only).
- **Speed doesn't decide it.** For 6 series of 50 points: rebuilding the definition took 0.32ms in node and updating the host 0.92ms in happy-dom; `setStateFocus` took 0.79ms.

### Other libraries' interactive legends (from source)

| Library               | State                                        | Hide / highlight                       | Axes on hide                     | Element and keyboard                                                        |
| --------------------- | -------------------------------------------- | -------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| TanStack Charts       | `visible` signal, controlled                 | Both; highlight on hover and focus     | Keep                             | `button` with `aria-pressed`, "Toggle {name} series", one Tab stop per item |
| Intent UI             | Internal                                     | Highlight by click                     | n/a                              | RAC single-select group: radios, every item named "Legend Item"             |
| Chakra UI             | `useChart` highlight state                   | Highlight on hover or click            | n/a                              | `div`, no role or keyboard                                                  |
| Mantine               | Internal                                     | Highlight on hover                     | n/a                              | `div`, no role or keyboard                                                  |
| Tremor                | Internal, `onValueChange`                    | Select one by click                    | n/a                              | `li` with click, not focusable                                              |
| MUI X                 | `hiddenItems`, `highlightedItem`, controlled | Hide by click; legend never highlights | Keep by default (`domainSeries`) | `button` named by label, no `aria-pressed`                                  |
| Nivo                  | Internal                                     | Hide                                   | Rescale                          | SVG, no role or keyboard                                                    |
| React Spectrum Charts | `hiddenSeries`, `highlightedSeries`          | Both; highlight on hover               | Rescale                          | Vega SVG, entries ignored by assistive tech                                 |
| Highcharts            | `series.visible`                             | Both; focus highlights                 | Rescale by default               | `button` with `aria-pressed`, "Show {name}", arrow keys between items       |

- **Naming.** A verb in the name reads backwards with `aria-pressed`: Highcharts' "Hide X" announced as off when shown (highcharts #14837), and renamed it "Show X". The APG button pattern keeps a toggle's label constant across states, so the item is named by its series alone.
- **Focus mirrors hover.** Chartability lists hover-only interaction as critical; highlight follows keyboard focus as well as the pointer, and a hidden series can't be highlighted (Highcharts, React Spectrum Charts and TanStack agree).
- **State without color.** A hidden or dimmed state needs a cue besides color (WCAG 1.4.1) and 3:1 against the previous state (Chartability).

## Decision

Decided 2026-10-25 (user): charts name their series with the `color` channel, and the legend is our own part.

- `ChartLegend` is a React Aria multi-select toggle group: one Tab stop with arrow keys, each item a button named by its series with `aria-pressed`, a 24px target, highlight on hover and focus, no highlight for a hidden series, and a hollow swatch and muted, struck-through label when hidden.
- Hide is controlled: the consumer holds the hidden series and passes them to the legend and, through a helper that builds the color scale from `ChartConfig` with the zero-height legend, to the definition. Highlight needs no wiring: `ChartPlot` adds the host control, and the legend calls it through context.
- A series from `z` (when color means something else) can be highlighted but not hidden.
- A story fails if hiding stops removing a series or the axes move, since the hide functions are typed but undocumented.

## Sources

- `@tanstack/charts` 1.1.0: `dist/interactive-legend.js`, `dist/scene.js`, `dist/renderer.js`, `dist/line.js`, `docs/reference/scales-guides-and-color.md` (interactive categorical legend), `docs/reference/custom-extensions.md` (host controls)
- [Intent UI chart](https://github.com/irsyadadl/intentui/blob/4.x/src/components/ui/chart.tsx)
- [Chakra UI use-chart](https://github.com/chakra-ui/chakra-ui/blob/main/packages/charts/src/use-chart.ts)
- [Mantine ChartLegend](https://github.com/mantinedev/mantine/blob/master/packages/@mantine/charts/src/ChartLegend/ChartLegend.tsx)
- [Tremor LineChart](https://github.com/tremorlabs/tremor-npm/blob/main/src/components/chart-elements/LineChart/LineChart.tsx)
- [MUI X legend](https://mui.com/x/react-charts/legend/) and [hiding series](https://mui.com/x/react-charts/hiding-series/)
- [Nivo legends](https://github.com/plouc/nivo/blob/master/packages/legends/src/svg/LegendSvgItem.tsx)
- [React Spectrum Charts legend](https://github.com/adobe/react-spectrum-charts/blob/main/packages/react-spectrum-charts/src/components/Legend/Legend.tsx)
- [Highcharts legend accessibility](https://github.com/highcharts/highcharts/blob/master/ts/Accessibility/Components/LegendComponent.ts) and [#14837](https://github.com/highcharts/highcharts/issues/14837)
- [WAI-ARIA APG button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Chartability](https://github.com/Chartability/POUR-CAF)
