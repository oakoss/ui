# @oakoss/tokens

DTCG source tokens compiled by [Terrazzo](https://terrazzo.app) into a Tailwind v4
`@theme` block. **Workspace-only** — this package is never published to npm. Its
compiled output is distributed to external consumers as registry-copied source
files via the shadcn-compatible registry (see
[decision 009](../../docs/decisions/009-tokens-and-themes-via-registry.md)).

## What it emits

`pnpm --filter @oakoss/tokens build` runs `terrazzo build` and writes to `dist/`:

- **`dist/theme.css`** — a Tailwind v4 `@theme` block exposing the token values as
  custom properties (e.g. `--color-mauve-1` … `--color-mauve-12`). Importing this
  file makes the `mauve` color scale available to Tailwind utilities
  (`bg-mauve-9`, `text-mauve-1`, `border-mauve-12`, …).
- **`dist/tokens.css`** — the raw `:root` custom-property declarations emitted by
  `@terrazzo/plugin-css`, independent of `theme.css` (which inlines the same values
  into its `@theme` block via `@terrazzo/plugin-tailwind`).

## Source

- **`src/mauve.tokens.json`** — DTCG 2025.10 source for the Mauve primitive ramp
  (`color.mauve.1`–`color.mauve.12`), expressed in OKLCH. Values are the Radix
  Colors `mauve` light scale (`@radix-ui/colors`) converted from sRGB hex to OKLCH
  (Radix is the upstream ramp that shadcn's mauve theme derives from). The
  semantic contract layered on top is decided separately in the token-taxonomy
  proposal (#46).
- **`tailwind.template.css`** — the Tailwind v4 template; `@terrazzo/plugin-tailwind`
  injects the resolved color custom properties at the `@tz` directive inside `@theme`.
- **`terrazzo.config.js`** — wires `@terrazzo/plugin-css` + `@terrazzo/plugin-tailwind`
  and maps `color.mauve.*` onto the Tailwind `color` theme.

## Build

```bash
pnpm --filter @oakoss/tokens build
```

Never hardcode raw color values in component code — add or extend tokens here and
rebuild. Do not edit anything in `dist/`; it is generated.
