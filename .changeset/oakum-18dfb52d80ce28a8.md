---
'@oakoss/ui': minor
---

Runtime theme switching for registry installs: `npx shadcn@latest add oakoss/ui/themes` installs `styles/themes.css`, with every theme family and primary color scoped by `data-family` and `data-primary`, and imports it from your stylesheet. The import suits Vite's `src/index.css`; with a stylesheet elsewhere, such as Next.js's `app/globals.css`, change it to `../styles/themes.css`. The bundle's selectors now repeat an attribute so they outrank the theme's `:root` and `.dark` wherever those sit.
