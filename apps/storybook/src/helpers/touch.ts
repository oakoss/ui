// Chromium's touch emulation makes `any-pointer: coarse` match. vitest/browser
// loads on call because it throws outside a Vitest run.
export async function withTouch(check: () => Promise<void>) {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('withTouch runs only in the Vitest browser run');
  }
  const session = browser.cdp();
  await session.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    await check();
  } finally {
    await session.send('Emulation.setTouchEmulationEnabled', {
      enabled: false,
    });
  }
}
