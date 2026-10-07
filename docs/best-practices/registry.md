# Registry

How to add or change items in `packages/ui/registry.json`. Each entry is a rule and its reason.

- **Every `registry:ui` item depends on `oakoss/ui/theme`,** which installs the tokens and the React Aria Tailwind plugin the variants need.
- **Project setup goes in the `base` item, and its `config` sets only `iconLibrary`.** Only `shadcn init` writes a base item's `config`; `shadcn add` ignores it, and `shadcn apply` takes only its own presets or a URL, not a GitHub registry address. So new projects run `init oakoss/ui/base`, and existing ones run `add oakoss/ui/base`, keeping the icon library their `components.json` already names. `extends: "none"` keeps `init` from also installing shadcn's own style.
- **CSS a theme's `cssVars` can't carry goes in the base item's `css`** (`color-scheme`, the reduced-motion layer). `registry.test.ts` checks the reduced-motion layer against `src/styles/base.css` and `color-scheme` against `src/styles/theme.css`.
- **A forked item names its source in `meta.upstream`** (`shadcn-ui/ui@<commit>:<path>`), so diffing upstream from that commit finds fixes to port. `meta` stays in the registry and never reaches the installed files; `registry.test.ts` checks the format.
- **Docs demos aren't registry items.** An item per demo buries the components in `shadcn search`, forces a demo's packages (a router, a form library) on whoever installs it, and a pinned `demo#v0.1.0` still installs its components from `main`, since a ref doesn't carry to dependencies. Multi-component compositions get curated as `registry:block` items after every component is ported.
- **An item ships what it imports:** every local file in its `files` or through `registryDependencies`, and every package in `dependencies`. `registry.test.ts` checks both.
