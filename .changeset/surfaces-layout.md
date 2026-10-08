---
'@oakoss/ui': minor
---

### Added

Avatar: a person's image with initials in `AvatarFallback` that show until it loads, and stay when it fails. The image reads its state when mounted, so a server-rendered image that loaded before hydration shows; it starts over when `src` changes, and a lazy image still loads. `size` takes `sm`, `md` and `lg`; `AvatarBadge` marks a status at the end edge, and `AvatarGroup` overlaps avatars as a `group`. The parts are spans, so an avatar fits in a link or button. Install with `npx shadcn@latest add oakoss/ui/avatar`.

Card: a surface for related content, with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`. `CardTitle` is a heading (`level`, 3 by default), `size="sm"` tightens every part, and the card keeps a border in Windows High Contrast. The docs show a clickable card built from a stretched link. Install with `npx shadcn@latest add oakoss/ui/card`.

Skeleton: a placeholder shape with a pulse, shown while content loads. It's `aria-hidden` by default, and the docs show marking the loading region `aria-busy` instead. Install with `npx shadcn@latest add oakoss/ui/skeleton`.

Spinner: a spinning indicator announced as an indeterminate progress bar, so screen readers say its `label` ("Loading" by default) instead of reading an unnamed icon. It's a `span`, so it fits inside text and buttons. `size` takes `sm`, `md` and `lg`, and it takes the surrounding text color. Install with `npx shadcn@latest add oakoss/ui/spinner`.

Separator: a horizontal or vertical divider built on React Aria's Separator, drawn as a border so it stays visible in Windows High Contrast. A horizontal separator rendered as a `div` keeps its line, and `data-orientation` is set for both orientations. Install with `npx shadcn@latest add oakoss/ui/separator`.
