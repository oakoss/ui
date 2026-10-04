# Registry

How to add or change items in `packages/ui/registry.json`. Each entry is a rule and its reason.

- **Every `registry:ui` item depends on `oakoss/ui/theme`,** which installs the tokens and the React Aria Tailwind plugin the variants need.
- **An item ships what it imports:** every local file in its `files` or through `registryDependencies`, and every package in `dependencies`. `registry.test.ts` checks both.
