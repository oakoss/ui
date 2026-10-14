declare module 'vitest/browser' {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation merges only with an interface
  interface BrowserCommands {
    emulateReducedMotion: (isReduced: boolean) => Promise<void>;
  }
}

// Runs check with prefers-reduced-motion emulated, then turns it off. Loads
// Vitest's browser module on call, since it throws outside a Vitest run.
export async function withReducedMotion(check: () => Promise<void>) {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('withReducedMotion runs only in the Vitest browser run');
  }
  await browser.commands.emulateReducedMotion(true);
  try {
    await check();
  } finally {
    await browser.commands.emulateReducedMotion(false);
  }
}
