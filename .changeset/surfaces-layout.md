---
'@oakoss/ui': minor
---

### Added

Card: a surface for related content, with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`. `CardTitle` is a heading (`level`, 3 by default), `size="sm"` tightens every part, and the card keeps a border in Windows High Contrast. The docs show a clickable card built from a stretched link. Install with `npx shadcn@latest add oakoss/ui/card`.

Skeleton: a placeholder shape with a pulse, shown while content loads. It's `aria-hidden` by default, and the docs show marking the loading region `aria-busy` instead. Install with `npx shadcn@latest add oakoss/ui/skeleton`.

Spinner: a spinning indicator announced as an indeterminate progress bar, so screen readers say its `label` ("Loading" by default) instead of reading an unnamed icon. It's a `span`, so it fits inside text and buttons. `size` takes `sm`, `md` and `lg`, and it takes the surrounding text color. Install with `npx shadcn@latest add oakoss/ui/spinner`.

Separator: a horizontal or vertical divider built on React Aria's Separator, drawn as a border so it stays visible in Windows High Contrast. A horizontal separator rendered as a `div` keeps its line, and `data-orientation` is set for both orientations. Install with `npx shadcn@latest add oakoss/ui/separator`.
