# Testing

How to write stories and tests. Each entry is a rule and its reason.

- **Stories are the component tests.** Assert behavior (accessible name and description, computed styles) rather than class names, and check a guard by breaking the code under it: a test that passes either way isn't guarding anything.
- **Type rules get type tests.** `@ts-expect-error` cases in a `*.test.ts` fail the typecheck when a rule stops holding.
- **Stories run axe in the light and dark projects** (stories tagged `forced-colors` run only in their own project, under Windows High Contrast emulation), and RTL stories set `globals: { locale: 'ar-EG' }`.
- **`CssCheck` stories assert values from utilities used only in `packages/ui`,** so they fail if Tailwind stops scanning the package. Keep those class names out of story files.
- **Test state styles by setting React Aria's state attributes.** `hover:` and `pressed:` match `data-hovered` and `data-pressed` on React Aria elements, so set those and read the style. Simulated pointer events don't reliably reach that state on CI: hovers got lost or stuck while the same stories passed locally. Set every state explicitly, the resting read included, since the real pointer may already have set `data-hovered`. This doesn't check that real pointer events reach the element, so a change that blocks them (`pointer-events-none`) goes uncaught. A story whose element has a hover style worth checking ends with `data-hovered` set, so axe checks that state every run.
- **Check that an overlay stayed open with `stayedOpen`,** which waits past the exit transition and checks the overlay is still mounted without `data-exiting`. A settled overlay stays visible and findable by role while it closes, so `toBeVisible` and a fresh `getByRole` both pass on one that's closing: Sheet's `NotDismissable` did.
- **Read where an overlay enters from by setting `data-entering` or `data-exiting` on the settled panel.** By the time a story can measure, the real entering state has ended.
- **Hover tooltip stories click the page and wait 600ms first.** React Aria opens tooltips on hover only after pointer input, and a tooltip closed in the last half second leaves it warmed up, so an earlier story's tooltip makes the next open at once and a delay check passes or fails by story order.
- **Finish transitions after changing state, before reading styles.** `getComputedStyle` returns a running transition's current value, which right after a class switch is the old one.
- **Docs e2e tests open pages with `gotoHydrated`** (`apps/docs/e2e/hydrated.ts`) before clicking or typing. The prerendered page shows before React hydrates it, and input in between is lost; on CI that dropped a demo click and a tab choice. A plain `goto` waits only for the preloaded scripts, not the page's own MDX chunk.
- **One press per element.** Storybook's `userEvent` releases a held press without React Aria seeing it, so a second reading on the same element sees a stale `data-pressed`.
