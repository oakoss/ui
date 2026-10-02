# Research: Docs Site Inspiration

Date: 2026-10-01
Related: [0002 — Forking shadcn's React Aria Base](./0002-shadcn-aria-fork.md) · docs app (`apps/docs`, epic `ui-dqp`)

## Summary

We surveyed 22 docs sites in two rounds to find what the best ones do well, so `ui.oakoss.dev` can borrow it.

- **Round 1:**
  - Component libraries: shadcn/ui, Park UI, Intent UI, React Aria, Radix Themes, Mantine and Chakra UI.
  - General docs sites: Tailwind CSS, Stripe and Vercel.
- **Round 2:**
  - Design systems: GitHub Primer, Shopify Polaris, Atlassian and IBM Carbon, plus Catppuccin as a theme family.
  - Libraries built on React Aria or shadcn registries: HeroUI, Untitled UI, coss ui and Jolly UI.
  - Sites close to our stack: TanStack, Base UI and Ark UI.

We also listed what Fumadocs already ships (fumadocs-ui and fumadocs-core 16.15.17, fumadocs-mdx 15.4.5), so each idea is rated by the work it needs.

The component libraries mostly agree on four things:

- **Page template:** preview → install → usage → examples → props.
- **Sidebar:** grouped by category.
- **Theme panel:** one panel with a way to export the result.
- **AI files:** a set of static files for LLMs and agents.

Round 2 added what the component libraries lack:

- **Token reference pages.** Each semantic token is listed with the primitive it resolves to in every theme.
- **A real accessibility section** on each component page.
- **Per-part API blocks** that document data attributes and CSS variables next to props.

Most of the borrowable ideas are Fumadocs config, not custom code. The big custom pieces are a site-wide theme panel and generated token pages. Both fit our theme-family model, and both depend on the token generator.

Everything was observed on 2026-10-01 by rendering the page (Playwright or Chrome DevTools), fetching it with `curl`, or reading the site's source. Fumadocs claims come from the installed packages in `apps/docs/node_modules`. A claim nobody observed is labeled _inferred_.

## Ranked: what to borrow

**Fit** is the work each idea needs on our stack (Fumadocs on TanStack Start, prerendered, no runtime server):

- **ships:** in use already.
- **config:** Fumadocs provides it; we only configure it.
- **custom:** we build it.
- **server:** needs a backend, so it is rejected for now.

| #   | Idea                                                                                                                                    | Seen on                                                        | Fit    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| 1   | Group the sidebar by category with `meta.json` (separators, a Getting started group, React Aria's categories)                           | Intent UI, Park UI, Chakra, Mantine, Radix                     | config |
| 2   | One component page template (see [Component page](#component-page))                                                                     | shadcn, Intent UI, Park UI, Radix, Chakra                      | config |
| 3   | Remember the package-manager tab across pages (`remarkNpmOptions.persist`)                                                              | Tabs: shadcn, Intent UI; remembered: Vercel's framework picker | config |
| 4   | Search results show category and snippet, with filter tags (Components, Guides)                                                         | React Aria, Radix Primitives, shadcn                           | config |
| 5   | A site-wide theme panel (family × flavor × accent, radius, font) that restyles the whole site, is shareable by URL and exports the code | Park UI, Radix Themes, shadcn /create, Mantine, HeroUI         | custom |
| 6   | Each example as its own registry item, with a copy-install-command button                                                               | Intent UI ("Registry"), coss ui (510 items), React Aria        | custom |
| 7   | A block for each part with Props, Data attributes and CSS variables tables (`isFocusVisible` → `[data-focus-visible]`)                  | React Aria, Base UI, Ark UI, HeroUI                            | custom |
| 8   | An `llms.txt` that gives agents instructions, split by area, with a "this page is authoritative" preamble on every `.md`                | Stripe, Vercel, Base UI, Atlassian                             | custom |
| 9   | Last updated and a visible Edit on GitHub link (the Open menu already links GitHub)                                                     | Radix, Chakra, Vercel (in its `.md` front matter)              | config |
| 10  | A prop playground on the first preview                                                                                                  | React Aria, Mantine                                            | custom |
| 11  | A "Common mistake" callout type                                                                                                         | Stripe                                                         | custom |
| 12  | A static MCP server that reads data published with the site                                                                             | Mantine                                                        | custom |
| 13  | Token reference pages generated from token data: semantic token → primitive in each flavor, copy buttons, a theme switcher per group    | Atlassian, Carbon, Primer, Catppuccin                          | custom |
| 14  | A token naming page and a role → color map for theme authors                                                                            | Primer (`token-names`), Catppuccin style guide                 | custom |
| 15  | An accessibility section on every component: what React Aria provides, a keyboard table, the WAI-ARIA pattern link                      | Ark UI, Carbon, Primer, HeroUI                                 | custom |
| 16  | Usage guidance with Do/Don't pairs                                                                                                      | Primer, Carbon, Atlassian                                      | custom |

Reasons:

- **1–4 are cheap.** They change what every visitor sees on every page.
- **5 is the feature only we can do well.** Our themes are built from tokens, so a live panel can restyle the docs site itself, not only an iframe preview. It depends on the token generator (`ui-2mi`).
- **6 suits a shadcn registry.** Copying a ready command beats picking a variant's code out of a page. It only helps if each example is its own registry item, as Intent UI's are (`shadcn add @intentui/<example>`). Otherwise the button repeats the component's command, so it is a registry-design decision as much as a docs one.
- **7 helps Tailwind users.** The data attributes are what they style against. React Aria, Base UI and Ark UI all document them for each part.
- **13 and 14 explain theme families.** With family × flavor × accent, a user needs to see what `--color-accent` becomes in each flavor. The generator already has that data, so the pages can be generated rather than written. Both depend on `ui-2mi`.
- **15 is why people pick React Aria.** In round 1 only Intent UI had an accessibility section, and it covered touch targets only. Ark UI and Carbon cover keyboard behavior and testing.
- **8–12 and 16 are worth doing, but later.** Each one either has less value or depends on work we haven't done. Do/Don't guidance (16) is content that grows one component at a time.

## Findings by area

### Component page

shadcn, Intent UI, Park UI and Radix Themes converge on this order:

1. Title, description, and a row of links: source, React Aria docs, Copy page.
2. A preview with Preview/Code tabs and a copy button.
3. Install, with CLI/Manual tabs and package-manager tabs. Manual install is numbered steps (shadcn).
4. Usage, or Anatomy: the imports and every part in one snippet (Intent UI, Chakra).
5. Examples. Each starts with one sentence naming the prop it shows (Park UI).
6. Accessibility notes for anyone customizing the component (Intent UI's "Touch hitbox" section, with a 44px utility).
7. API: our own props only, plus "extends React Aria's `<Button>`" with a link (shadcn, Intent UI, Radix). This matches our prop-table decision.

Other patterns:

- **Long API tables:** React Aria groups props by concern (Selection, Value, Validation, Events, …) and collapses the groups. Type names open on click.
- **Tabs for the API:** Mantine splits Documentation, Props and Styles API into tabs, each with its own URL.
- **Parts explorer:** Chakra's Explorer highlights each part in a live preview as you hover its name.
- **Example actions:** React Aria's examples have Copy, Expand code, and an "Open in…" menu (Copy link, Download ZIP, Install with shadcn, StackBlitz).
- **Per-part API blocks:** Base UI gives each part a description, the element it renders, then tables of Props, Data attributes and CSS variables. Ark UI and HeroUI do the same, and HeroUI adds a reference of BEM classes and state attributes.
- **Accessibility:**
  - Ark UI ends each page with a WAI-ARIA pattern link and a Keyboard Support table.
  - Carbon's Accessibility tab lists what the component provides, then the keyboard behavior, then a testing status table (keyboard: tested; screen reader: manually tested; with the version tested).
  - Primer has a separate Accessibility tab covering target size and how to test.
  - HeroUI lists the component's accessible behaviors as bullets and ends with a React Aria link.
- **Design guidance tabs:**
  - Primer splits each component into Overview, Guidelines and Accessibility.
  - Carbon uses Guidelines, Specifications, Code and Accessibility.
  - Both show a status (Primer: Experimental/Ready/Deprecated; Carbon: Stable) and a last-updated date (Carbon).
- **Props tables against React Aria:**
  - HeroUI repeats every inherited prop inline.
  - Jolly UI and coss ui list only their own props, with a one-line "extends React Aria `Select`" and a link.
  - Untitled UI has no props table.
  - The own-props approach matches our decision, and HeroUI's shows how long the alternative gets.
- **Composed parts:** Jolly UI links each component to the parts it is built from (Select → Label, Button, Popover, ListBox). It also shows a ready-made wrapper.

### Navigation (feeds `ui-dqp.12`)

- **Grouping:**
  - Category groups are the norm: Park UI, Intent UI, Chakra, Mantine and Radix all use them.
  - Intent UI uses the same categories as React Aria's docs (Buttons, Collections, Date and Time, Forms, Overlays, Pickers, …). That would suit us, since our components fork React Aria's.
  - shadcn uses one flat alphabetical list of about 70 components.
  - Jolly UI also groups by React Aria's categories. Polaris groups by job (Actions, Feedback, Forms, Layout).
- **Badges:** Chakra and HeroUI mark "New" (HeroUI also "Updated"), Park UI marks "(WIP)", and Atlassian marks Beta, Caution and Deprecated. Fumadocs' `statusBadgesPlugin` reads a `status` field from front matter.
- **Common chrome:** an "On this page" TOC, previous and next links, and section tabs in the top nav (Mantine and Chakra: Get started, Components, Theming).
- **Mobile:** React Aria's header shrinks to two buttons at 390px, Navigation and Table of contents. The other sites weren't checked on mobile.

### Search (examples for the search-display question)

| Site               | Results show                                                              | Static?                                |
| ------------------ | ------------------------------------------------------------------------- | -------------------------------------- |
| React Aria         | Cards with a thumbnail, title and one line; category filter tabs          | —                                      |
| Radix Primitives   | The heading it matched, a breadcrumb trail and a snippet                  | Yes (MiniSearch over a JSON file)      |
| shadcn             | Grouped (Pages, Components, Colors); ⌘C copies the install command        | —                                      |
| Park UI, Intent UI | Title only, grouped by category                                           | —                                      |
| Mantine, Chakra    | Title plus a description or category label                                | —                                      |
| Base UI            | Results grouped, at most 5 per group                                      | Yes (Orama index built in the browser) |
| Carbon             | A separate results page with breadcrumbs; a filter input over the sidebar | —                                      |

Fumadocs already ships the pieces for Radix's style: `TagsList` for filter tabs, `SearchDialogList` with a custom `Item` renderer, and `<mark>` around the matched text. The tag filter runs in the browser, so it works on a static site.

### Theme pickers

| Site           | Where                                                                | What it changes                                                                                | Export                                                               |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Park UI        | A panel in the docs header                                           | The whole site (`data-accent-color` on `<html>`), saved in a cookie                            | None                                                                 |
| Radix Themes   | The Playground page                                                  | Every component on the page                                                                    | "Copy Theme" copies a `<Theme>` JSX snippet                          |
| shadcn /create | Its own page, with an iframe preview                                 | Style, colors, fonts, icons, radius; each can be locked or shuffled                            | A `?preset=` URL, an `init --preset` command, CSS variables          |
| Intent UI      | A separate site                                                      | About 40 presets, with locks and random                                                        | A Google Fonts `<link>` plus CSS                                     |
| Mantine        | The colors generator                                                 | One 10-shade color scale                                                                       | A `createTheme` snippet and a "Copy URL" link                        |
| React Aria     | On each page                                                         | `--tint` (10 accents), only for the Vanilla CSS examples                                       | —                                                                    |
| HeroUI         | A "Design theme" switcher in the docs header, plus a /themes builder | The whole site (`data-design-theme` on `<html>`, localStorage); the builder previews templates | The builder keeps its state in the URL, with locks, shuffle and undo |
| Catppuccin     | The footer                                                           | The whole site (`data-theme="latte"`, localStorage)                                            | —                                                                    |
| Carbon         | Above each token group                                               | That group's values (White, Gray 10, Gray 90, Gray 100)                                        | —                                                                    |

HeroUI's docs run on Fumadocs (16.9.3), so its site-wide switcher shows the pattern works with Fumadocs. Its framework is Next.js, not TanStack Start. We read that version from HeroUI's `apps/docs/package.json`; we did not build it.

The best combination for us:

- Park UI's or HeroUI's site-wide live restyle.
- shadcn's or HeroUI's shareable URL that becomes an install command.
- Radix's single Copy button.

The output should be our `registry:theme` items, so the panel exports `shadcn add oakoss/ui/<family>-<flavor>` plus any accent override. That last point is _inferred_: the item names depend on `ui-2mi.4`.

### Token docs

| Site       | Layout                                                                                | Multiple themes                                                                    | Copy                         |
| ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| Atlassian  | One searchable table with filters (Active, Deprecated) and a CSS/JS syntax switch     | Light and Dark value columns side by side, each named by its primitive (`Lime100`) | Click the name               |
| Carbon     | Tables grouped as Core, Component and AI; Token, Role, Value (primitive, hex, swatch) | A sticky White / Gray 10 / Gray 90 / Gray 100 switcher on each group               | Copy token or Copy hex       |
| Primer     | Tables of Sample, CSS variable, Source value (the alias chain) and Output value       | Shows the active theme only; sends you to Storybook for the rest                   | A copy button on each row    |
| Catppuccin | One table per flavor: Hex, RGB, HSL, OKLCH for 26 colors                              | Four tables on one page; a separate role → color map lists every flavor            | Every value is a copy button |
| HeroUI     | oklch swatches; a tooltip shows the hover state's `color-mix` formula                 | Follows the docs-wide theme switcher                                               | —                            |

Other details:

- **Type and spacing scales:**
  - Atlassian gives type tokens with size and line height in rem and px.
  - Atlassian's spacing tokens get a visual bar and guidance on when to use each size range.
  - Carbon's fluid type has a breakpoint switcher and a slider.
- **Finding a token:**
  - Atlassian has a token picker that starts from "What is the color for?" (text, background, border, icon, …).
  - Primer documents its naming grammar on its own page (`token-names`), so users can guess names.
- **Checks in CI:** Primer's build sets contrast minimums for every theme, 4.5:1 for text and 3:1 for borders. High-contrast themes get 7:1 and 4.5:1.
- **Polaris has no token docs.** Its old site redirects to the web-components reference on shopify.dev, which exposes a `tone` prop instead of token names.

### AI and LLM features

| Feature                                              | Sites                                                                                                                                                                                                                                                       | Ours                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `llms.txt`                                           | shadcn, Intent UI, React Aria, Mantine, Chakra and Atlassian (split by area), Stripe, Vercel, HeroUI, Untitled UI, coss ui, Base UI, Ark UI, Carbon, TanStack (one index per library). Tailwind, Park UI, Radix, Primer, Jolly UI and Catppuccin return 404 | Ships                                              |
| `llms-full.txt`                                      | Mantine, Vercel, Chakra, Atlassian, HeroUI, Base UI. Ark UI redirects it to `llms.txt`, TanStack serves its `llms.txt`, and Primer redirects to its homepage; the others checked return 404                                                                 | Ships                                              |
| A Markdown version of each page                      | Round 1: all except Tailwind (Chakra serves `.mdx`, Park UI an `/api/…` path). Round 2: Polaris, HeroUI (`.mdx`), Untitled UI, coss ui, TanStack, Base UI, Ark UI (an `/llms.txt/…` path); not checked on Primer, Atlassian, Carbon, Catppuccin, Jolly UI   | Ships                                              |
| Copy page and an "Open in…" menu                     | shadcn, Park UI, Intent UI, React Aria, Chakra, Vercel, Stripe                                                                                                                                                                                              | Ships (`MarkdownCopyButton`, `ViewOptionsPopover`) |
| Agent instructions in `llms.txt`                     | Stripe, Vercel, Untitled UI; Atlassian's token tables say "You must ONLY use tokens listed"                                                                                                                                                                 | Not yet (idea 8)                                   |
| "Treat this as authoritative" preamble on each `.md` | Base UI                                                                                                                                                                                                                                                     | Not yet (idea 8)                                   |
| MCP server                                           | shadcn, React Aria, Chakra, Stripe, Vercel, HeroUI, Atlassian, Carbon, Primer, Ark UI; Mantine reads static data                                                                                                                                            | Not yet (idea 12)                                  |
| Agent skills                                         | React Aria, Mantine, Chakra, Intent UI                                                                                                                                                                                                                      | Out of scope here                                  |
| Ask AI chat                                          | Stripe, Vercel                                                                                                                                                                                                                                              | Rejected (needs a server)                          |

A preamble matters more for us than for most: agents know stock shadcn well, and our fork differs from it. Primer's MCP has a `find_tokens` tool and its build stamps "Never use raw values" into the CSS. Both target the same problem: agents inventing tokens.

Big single files run into limits. Ark UI dropped `llms-full.txt` after it outgrew Vercel's 20MB prerender cap, and TanStack's `llms.txt` routes to one small index per library.

The `.md` output can be messy. shadcn's and Intent UI's leak raw JSX (`<CodeTabs>`, `<McpTabs/>`). Our build test already fails on the `~inherited:` marker, and `ui-dqp.7` covers own props in the `.md` output.

### Polish

- **Feedback:** Stripe asks "Was this page helpful?" Vercel uses a four-emoji scale with a text box.
- **Code blocks:** Stripe adds "Report incorrect code". Vercel adds "Open in v0" and a TypeScript/JavaScript switch.
- **Theme control:** Tailwind offers Light, Dark and System, applies the choice before the page paints, and matches shortcut hints to the user's OS.
- **Headings:** Vercel and React Aria have a copy-link button on each heading.
- **Changelog:** shadcn, Park UI, Intent UI and React Aria have a changelog or release notes. Park UI also has a Figma kit page.
- **Previews:** Untitled UI's previews can be resized. coss ui stores each example's preview size in its registry item (`meta.className`), so the gallery sizes previews from data.
- **Moving pages:** TanStack lists old URLs in front matter (`redirect_from`).

### Sites close to our stack

- **TanStack** renders docs on request on Cloudflare Workers. It fetches Markdown from GitHub at runtime, caches it, and purges the edge cache from a push webhook. None of that fits a prerendered site. Its framework blocks, `.md` twins and `redirect_from` do.
- **Base UI** is a static Next.js export on Netlify, the closest match to how we deploy. It generates its `.md` files at build time and builds its search index in the browser.
- **coss ui** is built on Base UI, not React Aria. Origin UI redirects to it.
- **Jolly UI** has not been updated since January 2025 (Tailwind 3.4, React Aria Components 1.6), so it is a reference for structure only.

## Not borrowing

- **Ask AI chat (Stripe, Vercel):** needs an `/api/chat` route and an API key, which our static host doesn't have.
- **Feedback widget:** needs somewhere to send the data, and our traffic is too low to learn from it.
- **Framework picker (Vercel):** we only support React. The package-manager tab (idea 3) covers the same need.
- **Separate docs trees for each base (shadcn: aria, base, radix):** we have one base.
- **A theme picker on a separate site (Intent UI):** the panel belongs on the docs site, where it restyles real pages.
- **Open in StackBlitz or v0, Report incorrect code:** not worth it at our size; the GitHub links cover issue reports.
- **Algolia:** static search is enough for our page count.
- **Every inherited React Aria prop inline (HeroUI):** it repeats React Aria's docs and drifts from them. We decided on own props plus a link.
- **Figma links (Primer, Untitled UI):** we have no Figma kit.
- **Runtime docs fetching and edge purges (TanStack), or an agent search API (HeroUI):** both need a server.
- **Twoslash and OG images:** each needs a new dependency (`fumadocs-twoslash`, `takumi-js`). Revisit once there are more pages.

## Still unverified

- Whether shadcn's /create iframe updates without reloading. Its `src` didn't change.
- Mobile navigation on every site except React Aria.
- Search results on Primer, Ark UI and coss ui; theme switching on Jolly UI. We could not see these pages render.
- Whether Untitled UI's `/react/api/mcp` is an MCP server. It answered 405 to a GET, which fits a POST-only server; nobody sent it a POST.
- Whether `lastModified` shows real dates in the CI build. What we measured: in a depth-1 clone, the `git log` command fumadocs-mdx runs dates every file to the one commit in the clone. `docs.yml` checks out without `fetch-depth`, so it would need `fetch-depth: 0`. We have not run the full build on CI.
- Whether search tags and a custom `Item` renderer work with `staticClient` in our build. The source supports both; we didn't build it.

## Filed beads

Filed on 2026-10-02 with `needs-triage`:

| Bead        | Covers                                                                                                                                                     | Ideas                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `ui-dqp.9`  | The component page template: layout, remembered package-manager tab, per-part API blocks, accessibility section (related to `ui-m92`), Edit on GitHub link | 2, 3, 7, 15, half of 9 |
| `ui-dqp.10` | Token reference pages and a naming page, generated from token data (blocked by `ui-2mi`)                                                                   | 13, 14                 |
| `ui-dqp.11` | A site-wide theme panel with a shareable URL and an install-command export (blocked by `ui-2mi`)                                                           | 5                      |
| `ui-o2f.2`  | Decide whether examples become registry items                                                                                                              | 6                      |
| `ui-dqp.12` | Group the sidebar by category with `meta.json`                                                                                                             | 1                      |
| `ui-dqp.13` | Category and snippet in search results, with filter tags                                                                                                   | 4                      |
| `ui-dqp.14` | Agent instructions in `llms.txt` and an authoritative preamble on each `.md`                                                                               | 8                      |

Not filed: last-updated dates (the other half of idea 9). There are too few pages for it to matter yet, and CI would need `fetch-depth: 0`. Ideas 10–12 and 16 are later work with no bead yet.

`ui-dqp.8` turned out to be the sidebar's width, not its grouping. Fumadocs stretched the sidebar across its centering gutter, and `--fd-layout-width` fixes it.

## Sources

All accessed 2026-10-01.

- shadcn/ui: [React Aria Button](https://ui.shadcn.com/docs/components/aria/button), [/create](https://ui.shadcn.com/create), [Blocks](https://ui.shadcn.com/blocks), [llms.txt](https://ui.shadcn.com/llms.txt), [source](https://github.com/shadcn-ui/ui) (`apps/v4/components/command-menu.tsx`, `apps/v4/content/docs/components/aria/button.mdx`)
- Park UI: [Button](https://park-ui.com/docs/components/button)
- Intent UI: [Button](https://intentui.com/docs/components/buttons/button), [AI guide](https://intentui.com/docs/getting-started/ai.md), [themes](https://design.intentui.com/themes), [llms.txt](https://intentui.com/llms.txt)
- React Aria: [Select](https://react-aria.adobe.com/Select), [AI](https://react-aria.adobe.com/ai.md), [Getting started](https://react-aria.adobe.com/getting-started.md), [llms.txt](https://react-aria.adobe.com/llms.txt)
- Radix: [Themes Select](https://www.radix-ui.com/themes/docs/components/select), [Playground](https://www.radix-ui.com/themes/playground), [Primitives Select](https://www.radix-ui.com/primitives/docs/components/select), [website source](https://github.com/radix-ui/website) (`components/primitives-search.tsx`)
- Mantine: [Button](https://mantine.dev/core/button/), [Select](https://mantine.dev/core/select/), [Colors generator](https://mantine.dev/colors-generator/), [LLMs guide](https://mantine.dev/llms/guides-llms.md)
- Chakra UI: [Select](https://chakra-ui.com/docs/components/select), [Button](https://chakra-ui.com/docs/components/button), [MCP server](https://chakra-ui.com/docs/get-started/ai/mcp-server.mdx), [llms.txt](https://chakra-ui.com/llms.txt)
- Tailwind CSS: [Padding](https://tailwindcss.com/docs/padding), [Install with Vite](https://tailwindcss.com/docs/installation/using-vite)
- Stripe: [Checkout](https://docs.stripe.com/payments/checkout), [Webhooks](https://docs.stripe.com/webhooks), [MCP](https://docs.stripe.com/mcp.md), [llms.txt](https://docs.stripe.com/llms.txt)
- Vercel: [Functions](https://vercel.com/docs/functions), [llms.txt](https://vercel.com/llms.txt)
- GitHub Primer: [Color](https://primer.style/product/primitives/color), [Size](https://primer.style/product/primitives/size), [Token names](https://primer.style/product/primitives/token-names), [Button](https://primer.style/product/components/button), [MCP](https://primer.style/product/getting-started/foundations/mcp), [primer/primitives](https://github.com/primer/primitives) (`scripts/themes.config.ts`, `scripts/colorContrast.config.ts`)
- Shopify Polaris: [Button](https://shopify.dev/docs/api/app-home/latest/web-components/actions/button), [AI toolkit](https://shopify.dev/docs/apps/build/ai-toolkit)
- Atlassian: [All tokens](https://atlassian.design/components/tokens/all-tokens), [Spacing](https://atlassian.design/foundations/spacing), [Button](https://atlassian.design/components/button), [llms.txt](https://atlassian.design/llms.txt)
- IBM Carbon: [Color tokens](https://carbondesignsystem.com/building-blocks/foundations/color/tokens), [Type sets](https://carbondesignsystem.com/building-blocks/foundations/typography/type-sets), [Button](https://carbondesignsystem.com/building-blocks/core/components/button/guidelines), [llms.txt](https://carbondesignsystem.com/llms.txt)
- Catppuccin: [Palette](https://catppuccin.com/palette), [Ports](https://catppuccin.com/ports), [style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md)
- HeroUI: [Select](https://heroui.com/en/docs/react/components/select.mdx), [Themes](https://heroui.com/themes), [llms.txt](https://heroui.com/llms.txt), [source](https://github.com/heroui-inc/heroui) (`apps/docs/package.json`)
- Untitled UI: [Select](https://untitledui.com/react/components/select.md), [MCP](https://untitledui.com/react/integrations/mcp.md), [llms.txt](https://untitledui.com/react/llms.txt)
- coss ui: [Select](https://coss.com/ui/docs/components/select.md), [Particles](https://coss.com/ui/particles), [llms.txt](https://coss.com/ui/llms.txt)
- Jolly UI: [Select](https://jollyui.dev/docs/components/select), [source](https://github.com/jolbol1/jolly-ui)
- TanStack: [Query overview](https://tanstack.com/query/latest/docs/framework/react/overview), [llms.txt](https://tanstack.com/llms.txt), [source](https://github.com/TanStack/tanstack.com) (`src/utils/documents.server.ts`, `src/utils/docs-cache-headers.ts`)
- Base UI: [Dialog](https://base-ui.com/react/components/dialog.md), [llms.txt](https://base-ui.com/llms.txt), [source](https://github.com/mui/base-ui) (`docs/next.config.mjs`)
- Ark UI: [Dialog](https://ark-ui.com/llms.txt/components/dialog), [MCP server](https://ark-ui.com/llms.txt/ai/mcp-server), [source](https://github.com/chakra-ui/ark) (`website/next.config.mjs`)
- Fumadocs: the installed `fumadocs-ui` and `fumadocs-core` 16.15.17 and `fumadocs-mdx` 15.4.5 packages; [Search UI](https://fumadocs.dev/docs/ui/search), [Navigation](https://fumadocs.dev/docs/navigation), [LLMs integration](https://fumadocs.dev/docs/integrations/llms), [Feedback](https://fumadocs.dev/docs/integrations/feedback)
