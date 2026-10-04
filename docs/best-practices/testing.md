# Testing

How to write stories and tests. Each entry is a rule and its reason.

- **Stories are the component tests.** Assert behavior (accessible name and description, computed styles) rather than class names, and check a guard by breaking the code under it: a test that passes either way isn't guarding anything.
- **Type rules get type tests.** `@ts-expect-error` cases in a `*.test.ts` fail the typecheck when a rule stops holding.
- **Stories run axe in the light and dark projects** (stories tagged `forced-colors` run only in their own project, under Windows High Contrast emulation), and RTL stories set `globals: { locale: 'ar-EG' }`.
- **`CssCheck` stories assert values from utilities used only in `packages/ui`,** so they fail if Tailwind stops scanning the package. Keep those class names out of story files.
- **One press per element.** Storybook's `userEvent` releases a held press without React Aria seeing it, so a second reading on the same element sees a stale `data-pressed`.
