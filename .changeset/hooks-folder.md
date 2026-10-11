---
'@oakoss/ui': patch
---

### Changed

Tooltip and HoverCard install `useOverlayOpen` into your project's hooks folder (the `hooks` alias in `components.json`) instead of `lib`. A project that already has `lib/use-overlay-open.ts` keeps it until it adds either component again, which writes the new file and imports it from hooks.
