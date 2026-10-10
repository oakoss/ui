// Runs check at a viewport width, so media queries such as `sm:` see it,
// then puts the viewport back. Loads Vitest's browser module on call, since
// it throws outside a Vitest run.
export async function atViewportWidth(
  width: number,
  check: () => Promise<void>,
) {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('atViewportWidth runs only in the Vitest browser run');
  }
  const { innerHeight, innerWidth } = globalThis;
  await browser.page.viewport(width, innerHeight);
  try {
    await check();
  } finally {
    await browser.page.viewport(innerWidth, innerHeight);
  }
}
