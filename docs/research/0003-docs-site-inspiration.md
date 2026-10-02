# Research: Docs Site Inspiration

Date: 2026-10-01
Related: [0002 — Forking shadcn's React Aria Base](./0002-shadcn-aria-fork.md) · docs app (`apps/docs`, epic `ui-dqp`)

## Summary

We surveyed ten docs sites to find what the best ones do well, so `ui.oakoss.dev` can borrow it. Seven are component libraries: shadcn/ui, Park UI, Intent UI, React Aria, Radix Themes, Mantine and Chakra UI. Three are general docs sites: Tailwind CSS, Stripe and Vercel. We also listed what Fumadocs already ships (fumadocs-ui and fumadocs-core 16.15.17, fumadocs-mdx 15.4.5), so each idea is rated by the work it needs.

The component libraries mostly agree on four things:

- **Page template:** preview → install → usage → examples → props.
- **Sidebar:** grouped by category.
- **Theme panel:** one panel with a way to export the result.
- **AI files:** a set of static files for LLMs and agents.

Most of the borrowable ideas are Fumadocs config, not custom code. The one big custom piece is a site-wide theme panel. It also fits our theme-family model best.

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
| 5   | A site-wide theme panel (family × flavor × accent, radius, font) that restyles the whole site, is shareable by URL and exports the code | Park UI, Radix Themes, shadcn /create, Mantine                 | custom |
| 6   | Each example as its own registry item, with a copy-install-command button                                                               | Intent UI ("Registry"), React Aria                             | custom |
| 7   | A table mapping each state to the data attribute that styles it (`isFocusVisible` → `[data-focus-visible]`)                             | React Aria                                                     | custom |
| 8   | An `llms.txt` that gives agents instructions, not only links                                                                            | Stripe, Vercel                                                 | custom |
| 9   | Last updated and a visible Edit on GitHub link (the Open menu already links GitHub)                                                     | Radix, Chakra, Vercel (in its `.md` front matter)              | config |
| 10  | A prop playground on the first preview                                                                                                  | React Aria, Mantine                                            | custom |
| 11  | A "Common mistake" callout type                                                                                                         | Stripe                                                         | custom |
| 12  | A static MCP server that reads data published with the site                                                                             | Mantine                                                        | custom |

Reasons:

- **1–4 are cheap.** They change what every visitor sees on every page.
- **5 is the feature only we can do well.** Our themes are built from tokens, so a live panel can restyle the docs site itself, not only an iframe preview. It depends on the token generator (`ui-2mi`).
- **6 suits a shadcn registry.** Copying a ready command beats picking a variant's code out of a page. It only helps if each example is its own registry item, as Intent UI's are (`shadcn add @intentui/<example>`). Otherwise the button repeats the component's command, so it is a registry-design decision as much as a docs one.
- **7 helps Tailwind users.** The data attributes are what they style against, and React Aria's own docs have this table.
- **8–12 are worth doing, but later.** Each one either has less value or depends on work we haven't done.

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

### Navigation (feeds `ui-dqp.8`)

- **Grouping:**
  - Category groups are the norm: Park UI, Intent UI, Chakra, Mantine and Radix all use them.
  - Intent UI uses the same categories as React Aria's docs (Buttons, Collections, Date and Time, Forms, Overlays, Pickers, …). That would suit us, since our components fork React Aria's.
  - shadcn uses one flat alphabetical list of about 70 components.
- **Badges:** Chakra marks "New" items and Park UI marks "(WIP)". Fumadocs' `statusBadgesPlugin` reads a `status` field from front matter.
- **Common chrome:** an "On this page" TOC, previous and next links, and section tabs in the top nav (Mantine and Chakra: Get started, Components, Theming).
- **Mobile:** React Aria's header shrinks to two buttons at 390px, Navigation and Table of contents. The other sites weren't checked on mobile.

### Search (examples for the search-display question)

| Site               | Results show                                                       | Static?                           |
| ------------------ | ------------------------------------------------------------------ | --------------------------------- |
| React Aria         | Cards with a thumbnail, title and one line; category filter tabs   | —                                 |
| Radix Primitives   | The heading it matched, a breadcrumb trail and a snippet           | Yes (MiniSearch over a JSON file) |
| shadcn             | Grouped (Pages, Components, Colors); ⌘C copies the install command | —                                 |
| Park UI, Intent UI | Title only, grouped by category                                    | —                                 |
| Mantine, Chakra    | Title plus a description or category label                         | —                                 |

Fumadocs already ships the pieces for Radix's style: `TagsList` for filter tabs, `SearchDialogList` with a custom `Item` renderer, and `<mark>` around the matched text. The tag filter runs in the browser, so it works on a static site.

### Theme pickers

| Site           | Where                                | What it changes                                                     | Export                                                      |
| -------------- | ------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Park UI        | A panel in the docs header           | The whole site (`data-accent-color` on `<html>`), saved in a cookie | None                                                        |
| Radix Themes   | The Playground page                  | Every component on the page                                         | "Copy Theme" copies a `<Theme>` JSX snippet                 |
| shadcn /create | Its own page, with an iframe preview | Style, colors, fonts, icons, radius; each can be locked or shuffled | A `?preset=` URL, an `init --preset` command, CSS variables |
| Intent UI      | A separate site                      | About 40 presets, with locks and random                             | A Google Fonts `<link>` plus CSS                            |
| Mantine        | The colors generator                 | One 10-shade color scale                                            | A `createTheme` snippet and a "Copy URL" link               |
| React Aria     | On each page                         | `--tint` (10 accents), only for the Vanilla CSS examples            | —                                                           |

The best combination for us:

- Park UI's site-wide live restyle.
- shadcn's shareable preset URL that becomes an install command.
- Radix's single Copy button.

The output should be our `registry:theme` items, so the panel exports `shadcn add oakoss/ui/<family>-<flavor>` plus any accent override. That last point is _inferred_: the item names depend on `ui-2mi.4`.

### AI and LLM features

| Feature                          | Sites                                                                                                                  | Ours                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `llms.txt`                       | shadcn, Intent UI, React Aria, Mantine, Chakra (split by area), Stripe, Vercel. Tailwind, Park UI and Radix return 404 | Ships                                              |
| `llms-full.txt`                  | Mantine, Vercel. Most others return 404                                                                                | Ships                                              |
| A Markdown version of each page  | All except Tailwind (Chakra serves `.mdx`, Park UI an `/api/…` path)                                                   | Ships                                              |
| Copy page and an "Open in…" menu | shadcn, Park UI, Intent UI, React Aria, Chakra, Vercel, Stripe                                                         | Ships (`MarkdownCopyButton`, `ViewOptionsPopover`) |
| Agent instructions in `llms.txt` | Stripe, Vercel                                                                                                         | Not yet (idea 8)                                   |
| MCP server                       | shadcn, React Aria, Chakra, Stripe, Vercel; Mantine reads static data                                                  | Not yet (idea 12)                                  |
| Agent skills                     | React Aria, Mantine, Chakra, Intent UI                                                                                 | Out of scope here                                  |
| Ask AI chat                      | Stripe, Vercel                                                                                                         | Rejected (needs a server)                          |

The `.md` output can be messy. shadcn's and Intent UI's leak raw JSX (`<CodeTabs>`, `<McpTabs/>`). Our build test already fails on the `~inherited:` marker, and `ui-dqp.7` covers own props in the `.md` output.

### Polish

- **Feedback:** Stripe asks "Was this page helpful?" Vercel uses a four-emoji scale with a text box.
- **Code blocks:** Stripe adds "Report incorrect code". Vercel adds "Open in v0" and a TypeScript/JavaScript switch.
- **Theme control:** Tailwind offers Light, Dark and System, applies the choice before the page paints, and matches shortcut hints to the user's OS.
- **Headings:** Vercel and React Aria have a copy-link button on each heading.
- **Changelog:** shadcn, Park UI, Intent UI and React Aria have a changelog or release notes. Park UI also has a Figma kit page.

## Not borrowing

- **Ask AI chat (Stripe, Vercel):** needs an `/api/chat` route and an API key, which our static host doesn't have.
- **Feedback widget:** needs somewhere to send the data, and our traffic is too low to learn from it.
- **Framework picker (Vercel):** we only support React. The package-manager tab (#3) covers the same need.
- **Separate docs trees for each base (shadcn: aria, base, radix):** we have one base.
- **A theme picker on a separate site (Intent UI):** the panel belongs on the docs site, where it restyles real pages.
- **Open in StackBlitz or v0, Report incorrect code:** not worth it at our size; the GitHub links cover issue reports.
- **Algolia:** static search is enough for our page count.
- **Twoslash and OG images:** each needs a new dependency (`fumadocs-twoslash`, `takumi-js`). Revisit once there are more pages.

## Still unverified

- Whether shadcn's /create iframe updates without reloading. Its `src` didn't change.
- Mobile navigation on every site except React Aria.
- Whether `lastModified` shows real dates in the CI build. What we measured: in a depth-1 clone, the `git log` command fumadocs-mdx runs dates every file to the one commit in the clone. `docs.yml` checks out without `fetch-depth`, so it would need `fetch-depth: 0`. We have not run the full build on CI.
- Whether search tags and a custom `Item` renderer work with `staticClient` in our build. The source supports both; we didn't build it.

## Candidate beads

Not filed. They would get `needs-triage` once approved.

1. **Group the docs sidebar by category with `meta.json`** (idea 1 with separators and status badges, plus the Edit on GitHub half of idea 9). Related to `ui-dqp.8`, which may be a layout bug rather than grouping.
2. **Write the component page template and persist package-manager tabs** (ideas 2 and 3). Apply it to Button and TextField.
3. **Show category and snippet in search results, and add filter tags** (idea 4).
4. **Add a site-wide theme panel with a shareable URL and an install-command export** (idea 5). Blocked by `ui-2mi`; related to `ui-dqp.6`.
5. **Decide whether examples become registry items, then add a copy-install-command button** (idea 6). Touches the registry design in `ui-o2f`.
6. **Add a state-to-data-attribute table to component pages** (idea 7).
7. **Add agent instructions to `llms.txt`** (idea 8).
8. **Show last-updated dates, with a full-history checkout in the docs workflow** (the Last updated half of idea 9).

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
- Fumadocs: the installed `fumadocs-ui` and `fumadocs-core` 16.15.17 and `fumadocs-mdx` 15.4.5 packages; [Search UI](https://fumadocs.dev/docs/ui/search), [Navigation](https://fumadocs.dev/docs/navigation), [LLMs integration](https://fumadocs.dev/docs/integrations/llms), [Feedback](https://fumadocs.dev/docs/integrations/feedback)
