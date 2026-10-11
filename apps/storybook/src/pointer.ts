declare module 'vitest/browser' {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation merges only with an interface
  interface BrowserCommands {
    movePointerOffscreen: () => Promise<void>;
  }
}

// Moves the real mouse outside the viewport. Vitest's browser clicks move the
// real pointer, and a story that renders under where it stopped starts
// hovered, so :hover styles leak into its style reads. Loads Vitest's browser
// module on call, since it throws outside a Vitest run, where there's no
// pointer to park.
export async function parkPointer() {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    return;
  }
  await browser.commands.movePointerOffscreen();
}
