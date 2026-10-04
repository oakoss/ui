# Registry

How to add or change items in `packages/ui/registry.json`. Each entry is a rule and its reason.

- **Every `registry:ui` item depends on `oakoss/ui/theme`,** which installs the tokens and the React Aria Tailwind plugin the variants need.
- **Project setup goes in the `base` item, and its `config` sets only `iconLibrary`.** Only `shadcn init` writes a base item's `config`; `shadcn add` ignores it, and `shadcn apply` takes only its own presets or a URL, not a GitHub registry address. So new projects run `init oakoss/ui/base`, and existing ones run `add oakoss/ui/base`, keeping the icon library their `components.json` already names. `extends: "none"` keeps `init` from also installing shadcn's own style.
- **CSS a theme's `cssVars` can't carry goes in the base item's `css`** (`color-scheme`, the reduced-motion layer). `registry.test.ts` checks the reduced-motion layer against `src/styles/base.css` and `color-scheme` against `src/styles/theme.css`.
- **An item ships what it imports:** every local file in its `files` or through `registryDependencies`, and every package in `dependencies`. `registry.test.ts` checks both.
