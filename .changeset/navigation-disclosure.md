---
'@oakoss/ui': minor
---

### Added

Accordion: built on React Aria's `DisclosureGroup`, `Disclosure` and `DisclosurePanel`. Each trigger sits in a heading, level 3 by default and set with `headingLevel`, and is a 44px target with the focus outline, where upstream's used a box-shadow ring that forced colors drop. The panel animates its height, and a closed one stays findable with find-in-page. The single chevron turns over when open and follows the trigger's text color in Windows High Contrast, and right to left the label and chevron sit at the right ends, where upstream's stayed left-aligned. `allowsMultipleExpanded` keeps several sections open, and a Collapsible inside a section opens on its own rather than closing the section around it. Install with `npx shadcn@latest add oakoss/ui/accordion`.

Tabs: built on React Aria's `Tabs`, `TabList`, `Tab` and `TabPanel`, in a filled `default` look or `variant="line"`, horizontal or vertical. `Tabs` sets the look for all its parts. In Windows High Contrast the selected tab takes the system's selection colors and the line is a border, where upstream's selected tab looked like the others, and a disabled tab takes the system's disabled color. A panel with nothing focusable inside shows the focus outline, where upstream's showed none, and the vertical line sits on the side facing the panel right to left. Install with `npx shadcn@latest add oakoss/ui/tabs`.

Breadcrumb: built on React Aria's `Breadcrumbs`, `Breadcrumb` and `Link`, current page included. The `nav` takes the name React Aria gives the list, in the user's language, where upstream's was a hardcoded English "breadcrumb"; an `aria-label` on `Breadcrumb` replaces it. The last item is marked as the current page, semibold as well as darker so the cue isn't color alone, and leaves the Tab order, links show the focus outline only on keyboard focus, so Windows High Contrast draws no box around each, and the separator points the other way right to left. The ellipsis is decorative, where upstream's hid its "More" label inside a hidden element. Install with `npx shadcn@latest add oakoss/ui/breadcrumb`.

Collapsible: a React Aria `Disclosure` whose panel animates its height like Accordion's, where upstream's snapped open. The trigger shows the focus outline and takes any button style. Install with `npx shadcn@latest add oakoss/ui/collapsible`.
