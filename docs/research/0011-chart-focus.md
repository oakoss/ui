# Research: Chart Focus Marking

Date: 2026-10-25
Related: bead `ui-o2f.64.3` (data table, focus and states) · [0009 — Charts](./0009-charts.md) (candidate 3) · [0010 — Chart Legend](./0010-chart-legend.md)

## Summary

The chart's keyboard focus needed a visible marker that holds 3:1 (WCAG 1.4.11) on any series color. TanStack Charts draws a dot in the series color at the focused point, which failed on our lightest series, and the browser drew its outline around the whole chart. A survey found that the libraries built for accessibility outline the focused mark in a color independent of the series and treat dimming as a hover extra. We dropped the chart outline, gave line points a two-tone ring in the page's colors, and gave bars an outline on the focused bar.

## Findings

### TanStack Charts' focus (measured on 1.1.0 in Storybook, Chromium)

- **The chart outline is the browser's.** On Tab the `svg` showed `outline: auto 5px` in the browser's blue; nothing of ours.
- **The dot fails on light series.** It drew a white fill with a 2.5px stroke in the point's color; on `--color-chart-1` in the default theme that is about 1.5:1 against the page.
- **The dot is a presentation attribute.** `stroke` and `fill` are attributes on the `circle`, set from the definition's `focusRing` (`{ fill, radius, stroke, strokeWidth }`), or turned off with `focusRing: false`.
- **A chart without focus isn't a tab stop.** With `focus: false` the `svg` had `tabIndex -1`, so no fallback outline is needed for it.
- **Marks are opaque.** `barY(...)` returns `{ initialize }`, so `ChartPlot` can't tell a bar from a line or add states to a mark.
- **Mark states reach a single bar.** A state `{ when: { focus: 'primary', source: ['keyboard', 'pointer'] }, style: { stroke, strokeWidth: 3 } }` outlined the focused bar only. The same state on a line would outline the whole line, which is one path; an `unmatched` dim left lines unchanged for the same reason.
- **SVG strokes keep their colors in forced colors.** A `--color-foreground` stroke stayed near-black on the dark High Contrast palette's black page, so the marker reads `CanvasText` there.
- **Escape closes only a pinned tooltip.** An unpinned one stays up (read from `renderer.js`, and TanStack/charts#189).
- **The tooltip didn't cover the focused mark** at any of 12 points on the bar and line demos.
- **Focus leaves a hidden series.** With March focused, hiding its series and focusing the chart again landed on January's remaining point, its tooltip naming only the shown series.
- **A redraw restores focus under its own source.** The renderer re-paints the focused point with source `restored` (read from `renderer.js`), so the bar outline's state lists it beside `keyboard` and `pointer`.
- **Motion respects reduced motion by default.** The renderer, motion and mark-state transitions each check `prefers-reduced-motion: reduce` unless `respectReducedMotion` is false (read from `renderer.js`, `motion.js` and `mark-state-transition.js`; not run under the media query).

### What libraries do (read from source, unless noted)

| Library                         | Focused bar                                                      | Focused line point                 | Keyboard vs hover                           |
| ------------------------------- | ---------------------------------------------------------------- | ---------------------------------- | ------------------------------------------- |
| MUI X                           | Outline 3px outside the bar, 2px, text color                     | Ring in the text color             | Outline only after a key press (docs)       |
| Visa                            | Black outer halo and white inner ring around a clone of the mark | Same                               | Keyboard halo; hover adds a stroke          |
| Highcharts                      | `focusBorder` rectangle (2px, radius 3); hover brightens         | Bigger marker; others fade to 0.2  | Keyboard reuses hover, then adds the border |
| Recharts / shadcn               | Gray band behind the category                                    | Series-color dot with a white ring | Same; shadcn hides the focus outline        |
| ECharts                         | Brightens the mark, blurs the others                             | Same                               | No keyboard navigation found                |
| Nivo, Chart.js, Observable Plot | Tooltip only                                                     | Tooltip only                       | Little or no keyboard support               |

Chartability asks that focus mirror hover and stand out against the background. Dimming and bands change only color, so they appear as hover extras, not as the focus indicator.

## Decision

Decided 2026-10-25 (user):

- No outline around the chart; the marker on the point is the indicator.
- Line points: a ring with the page's background inside and its foreground outside, 2px wide and 5px in radius, set as `ChartPlot`'s default `focusRing`.
- Bars: a 3px foreground outline on the focused or hovered bar, from `chartBarStates`, with `focusRing: false`. Opt-in, since marks are opaque; ui-o2f.95 is where it can become automatic.
- In forced colors the marker takes `Canvas` and `CanvasText`.
- Escape hides an unpinned tooltip until focus moves, as a workaround for TanStack/charts#189.
- The gray default palette (a ramp of the neutral primary) goes to ui-2mi.13, which rechecks these markers against the palettes it picks.
