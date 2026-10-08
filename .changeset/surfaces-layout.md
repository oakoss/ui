---
'@oakoss/ui': minor
---

### Added

Card: a surface for related content, with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`. `CardTitle` is a heading (`level`, 3 by default), `size="sm"` tightens every part, and the card keeps a border in Windows High Contrast. The docs show a clickable card built from a stretched link. Install with `npx shadcn@latest add oakoss/ui/card`.

Separator: a horizontal or vertical divider built on React Aria's Separator, drawn as a border so it stays visible in Windows High Contrast. A horizontal separator rendered as a `div` keeps its line, and `data-orientation` is set for both orientations. Install with `npx shadcn@latest add oakoss/ui/separator`.
