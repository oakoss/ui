# Registry

How to add or change items in `packages/ui/registry.json`. Each entry is a rule and its reason.

- **Every `registry:ui` item depends on `oakoss/ui/theme`,** which installs the tokens and the React Aria Tailwind plugin the variants need.
- **Project setup goes in the `base` item, and its `config` sets only `iconLibrary`.** Only `shadcn init` and `shadcn apply` write a base item's `config`; `shadcn add` ignores it. `apply` merges into an existing `components.json`, so any alias or `style` set here would overwrite the consumer's. `extends: "none"` keeps `init` from also installing shadcn's own style.
- **CSS a theme's `cssVars` can't carry goes in the base item's `css`** (`color-scheme`, the reduced-motion layer). `registry.test.ts` checks the reduced-motion layer against `src/styles/base.css` and `color-scheme` against `src/styles/theme.css`.
- **An item ships what it imports:** every local file in its `files` or through `registryDependencies`, and every package in `dependencies`. `registry.test.ts` checks both.
