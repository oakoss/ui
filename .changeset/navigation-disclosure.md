---
'@oakoss/ui': minor
---

### Added

Accordion: built on React Aria's `DisclosureGroup`, `Disclosure` and `DisclosurePanel`. Each trigger sits in a heading, level 3 by default and set with `headingLevel`, and is a 44px target with the focus outline, where upstream's used a box-shadow ring that forced colors drop. The panel animates its height, and a closed one stays findable with find-in-page. The single chevron turns over when open and follows the trigger's text color in Windows High Contrast, and right to left the label and chevron sit at the right ends, where upstream's stayed left-aligned. `allowsMultipleExpanded` keeps several sections open, and a Collapsible inside a section opens on its own rather than closing the section around it. Install with `npx shadcn@latest add oakoss/ui/accordion`.

Tabs: built on React Aria's `Tabs`, `TabList`, `Tab` and `TabPanel`, in a filled `default` look or `variant="line"`, horizontal or vertical. `Tabs` sets the look for all its parts. In Windows High Contrast the selected tab takes the system's selection colors and the line is a border, where upstream's selected tab looked like the others, and a disabled tab takes the system's disabled color. A panel with nothing focusable inside shows the focus outline, where upstream's showed none, and the vertical line sits on the side facing the panel right to left. Install with `npx shadcn@latest add oakoss/ui/tabs`.

Collapsible: a React Aria `Disclosure` whose panel animates its height like Accordion's, where upstream's snapped open. The trigger shows the focus outline and takes any button style. Install with `npx shadcn@latest add oakoss/ui/collapsible`.
