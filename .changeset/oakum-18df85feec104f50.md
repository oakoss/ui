---
'@oakoss/ui': minor
---

Catppuccin theme family: install it with `npx shadcn@latest add oakoss/ui/theme-catppuccin` for Latte in light mode and Mocha in dark, or `theme-catppuccin-frappe` or `theme-catppuccin-macchiato` for the other dark flavors. Each accent's scale is generated from Catppuccin's published color, kept unchanged at the step nearest its lightness, with roles picked to pass WCAG AA in all four flavors; primary defaults to mauve and can be any of the 14 accents. The runtime `themes.css` adds Catppuccin's Latte and Mocha blocks, and a primary hue whose values differ between families is now scoped to each family, so the Mauve family's mauve primary moves to `[data-family='mauve'][data-primary='mauve']`.
