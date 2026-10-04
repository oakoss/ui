# Testing

How to write stories and tests. Each entry is a rule and its reason.

- **Stories are the component tests.** Assert behavior (accessible name and description, computed styles) rather than class names, and check a guard by breaking the code under it: a test that passes either way isn't guarding anything.
- **Type rules get type tests.** `@ts-expect-error` cases in a `*.test.ts` fail the typecheck when a rule stops holding.
- **Stories run axe in the light and dark projects** (stories tagged `forced-colors` run only in their own project, under Windows High Contrast emulation), and RTL stories set `globals: { locale: 'ar-EG' }`.
- **`CssCheck` stories assert values from utilities used only in `packages/ui`,** so they fail if Tailwind stops scanning the package. Keep those class names out of story files.
- **Test state styles by setting React Aria's state attributes.** `hover:` and `pressed:` match `data-hovered` and `data-pressed` on React Aria elements, so set those and read the style. Simulated pointer events don't reliably reach that state on CI: hovers got lost or stuck while the same stories passed locally. Set every state explicitly, the resting read included, since the real pointer may already have set `data-hovered`. This doesn't check that real pointer events reach the element, so a change that blocks them (`pointer-events-none`) goes uncaught. A story whose element has a hover style worth checking ends with `data-hovered` set, so axe checks that state every run.
- **Finish transitions after changing state, before reading styles.** `getComputedStyle` returns a running transition's current value, which right after a class switch is the old one.
- **One press per element.** Storybook's `userEvent` releases a held press without React Aria seeing it, so a second reading on the same element sees a stale `data-pressed`.
