// Screenshots the page after a story when VITE_VISUAL is set, named by story
// id. Loads Vitest on call, since it throws outside a Vitest run.
export async function captureStory({ id }: { id: string }) {
  if (import.meta.env.VITE_VISUAL !== 'true') return;
  const [vitest, browser] = await Promise.all([
    import('vitest'),
    import('vitest/browser'),
  ]);
  // Soft, so a failed capture doesn't throw past Storybook's afterEach, which
  // would skip removing the stylesheet that pauses every animation on the page.
  await vitest.expect.soft(browser.page).toMatchScreenshot(id);
}
