// Presses Tab on the real keyboard. Storybook's userEvent moves focus itself
// after dispatching the key, so it misses a component that moves focus on
// Tab and leaves the rest to the browser, as React Aria's toolbar does.
export async function tabReal() {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('tabReal runs only in the Vitest browser run');
  }
  await browser.userEvent.keyboard('{Tab}');
}
