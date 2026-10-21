# Research: Intent UI v4

Date: 2026-10-20
Related: bead `ui-p95` · [components.md](../best-practices/components.md) (survey rule) · [0002](./0002-shadcn-aria-fork.md)

## Summary

Intent UI v4 (v4.0.0 on 2026-10-12, v4.0.2 on 2026-10-15 at `a03e485`) renames its overlay APIs to "`XTrigger` wraps a `Button` plus `X`", removes `Drawer`, `Modal` and `BarList`, and spells token names out (`bg`/`fg` become `background`/`foreground`, the names we already use). Its `package.json` pins the same `react-aria-components ^1.22.0`, `tailwindcss ^4.3.0` and `tailwind-variants ^3.2.2` as v3.9.0, so it changes no stack and no styling approach. Read component by component against ours, Intent is behind on accessibility in most places; what's worth taking is a handful of behaviors and APIs, each filed as its own bead. Two picks were already planned: 16px input text on touch (`ui-o2f.26`) and swipe gestures in the Drawer (`ui-o2f.62`). The survey read Intent's source only; nothing was run in a browser.

## Findings

### Picks

| Component                                                    | Pick                                                                                                                                                                                                                                    | Cost | Call         | Bead        |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------ | ----------- |
| Tabs                                                         | A sliding selection line with React Aria's `SelectionIndicator`, drawn as a border, animated under `motion-safe:`                                                                                                                       | S    | Adopt        | `ui-o2f.66` |
| Input, Textarea, Select, DateField, NativeSelect, InputGroup | 16px text on touch to stop iOS zoom; Intent and shadcn's new-york-v4 input switch by width instead, which leaves iPads zooming                                                                                                          | S    | Planned      | `ui-o2f.26` |
| Drawer                                                       | Swipe to dismiss, snap points and stacking on React Aria 1.22's `Sheet`, in the planned Drawer; Sheet stays for side panels (`ui-o2f.21`). First decide whether `start`/`end` follow the locale (React Aria) or the page's `dir` (ours) | M–L  | Planned      | `ui-o2f.62` |
| Data Table                                                   | Column resizing through TanStack `columnSizing` with a keyboard-operable handle; a cell-border grid option                                                                                                                              | M    | Consider     | `ui-o2f.68` |
| ScrollArea                                                   | A tab stop only while it overflows (`useScrollRegion`), which drops its lint-disable comment; the scroll-region rule in components.md may need ScrollArea named                                                                         | S–M  | Consider     | `ui-o2f.69` |
| Command                                                      | `isPending` swaps the search icon for a loader; a `shortcut` prop toggles it, matching the sidebar's                                                                                                                                    | S    | Consider     | `ui-o2f.70` |
| Combobox                                                     | Multiple selection with React Aria 1.22's `M` generic and `ComboBoxValue`; overlaps a future tag field                                                                                                                                  | M    | Consider     | `ui-o2f.71` |
| ToggleGroup                                                  | A segmented variant that keeps our outline focus and forced-colors selected styles                                                                                                                                                      | S–M  | Consider     | `ui-o2f.72` |
| DatePicker, DateRangePicker                                  | The calendar opens in a modal on phones instead of a popover                                                                                                                                                                            | M    | Consider     | `ui-o2f.73` |
| Avatar                                                       | A square shape (not Intent's 13 sizes)                                                                                                                                                                                                  | S    | Consider     | `ui-o2f.74` |
| Pagination                                                   | First and last page links, with label props                                                                                                                                                                                             | S    | Consider     | `ui-o2f.75` |
| Card                                                         | A layout that fits a table edge to edge                                                                                                                                                                                                 | S    | Consider     | `ui-o2f.76` |
| ListBox, Select, Combobox, Menu                              | `overscroll-contain` on list popovers                                                                                                                                                                                                   | S    | Consider     | `ui-o2f.77` |
| Every control                                                | One size step larger on touch screens; a token decision, since our hit areas already meet WCAG 2.5.5                                                                                                                                    | M–L  | Later        | `ui-o2f.78` |
| Sidebar                                                      | Nested navigation on React Aria's `NavigationTree`; changes Tab between links to arrow keys, so the WAI-ARIA guidance comes first                                                                                                       | M    | Skip for now | —           |

Also skipped: a hover border on text fields (a state to keep at 3:1 and test), `::-ms-reveal` hiding (only with a password field of our own), larger menu text on narrow screens, and Intent's `"use client"` directive on every file (Next.js isn't a target).

Nothing worth changing in: button-group, checkbox-group, radio-group, slider, field, text-field, search-field, number-field, time-field, calendar, item, empty, contextual-help, alert, badge, kbd, separator, skeleton, spinner, meter, progress, accordion, collapsible, breadcrumb, dialog, alert-dialog, popover, tooltip, hover-card, context-menu, dropdown-menu and table.

### Where Intent is worse

Kept here so a later port doesn't copy them:

- **Strings:** hardcoded English ("Close dialog", "Search", "Pending...", "First page"), where our components take label props.
- **Focus:** date-picker triggers show focus by color change only; Tabs sets `focus:ring-0` and panels `outline-hidden`; several controls rely on `ring` box-shadows, which forced colors remove. Radio had no keyboard focus ring until v4.0.2.
- **Forced colors:** field errors use `forced-colors:text-[Mark]`, invisible on a light page; Meter shows state by threshold color alone.
- **Names:** the required asterisk is CSS `content`, which Chrome can include in the accessible name; ButtonGroup always sets `role="group"`, named or not; CardTitle is a `div`; Breadcrumbs' `nav` has no name.
- **Hidden content:** Skeleton's `isLoading` keeps the real text in the page as `text-transparent`; Table's empty state is entirely `aria-hidden`; ScrollArea isn't focusable at all.
- **Packaging:** its touch-target utility sets `z-index: 9999`, and its CSS was missing from the button registry item until v4.0.2.

### Side finding

`overlays/dialog.tsx:158` and `overlays/alert-dialog.tsx:137` carry lint-disable comments, against the no-disable rule for component code (`ui-o2f.79`).

## Sources

- [Intent UI releases](https://github.com/irsyadadl/intentui/releases), [v4.0.2](https://github.com/irsyadadl/intentui/releases/tag/v4.0.2)
- [Release post: Intent UI v4](https://intentui.com/blog/release-v4)
- [Intent UI source at v4.0.2](https://github.com/irsyadadl/intentui/tree/v4.0.2/src/components/ui)
- [React Aria release notes](https://react-spectrum.adobe.com/releases/index.html) (1.21 `NavigationTree`, 1.22 `Sheet`)
