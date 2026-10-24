export async function atViewportSize(
  width: number,
  height: number,
  check: () => Promise<void>,
) {
  const browser = await loadBrowser();
  const { innerHeight, innerWidth } = globalThis;
  await browser.page.viewport(width, height);
  try {
    await check();
  } finally {
    await browser.page.viewport(innerWidth, innerHeight);
  }
}

// Runs check at a viewport width, so media queries such as `sm:` see it,
// then puts the viewport back. Loads Vitest's browser module on call, since
// it throws outside a Vitest run.
export async function atViewportWidth(
  width: number,
  check: () => Promise<void>,
) {
  await atViewportSize(width, innerHeight, check);
}

// A story's beforeEach that runs the whole story, its Visual capture
// included, at a phone's width, and puts the viewport back after.
export async function phoneWidth() {
  const browser = await loadBrowser();
  const { innerHeight, innerWidth } = globalThis;
  await browser.page.viewport(375, innerHeight);
  return async () => {
    await browser.page.viewport(innerWidth, innerHeight);
  };
}

async function loadBrowser() {
  try {
    return await import('vitest/browser');
  } catch {
    throw new Error('Viewport helpers run only in the Vitest browser run');
  }
}
