// Reads an element while a real mouse holds it down, so CSS :active applies,
// which Storybook's synthetic userEvent never triggers. Loads Vitest's browser
// module on call, since it throws outside a Vitest run.
export async function whilePressed<T>(
  element: HTMLElement,
  read: () => T,
): Promise<T> {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('whilePressed runs only in the Vitest browser run');
  }
  // Read well into the hold, after the element's scale transition has run;
  // read at once, a press that scales still measures its resting size.
  let sample: { value: T } | undefined;
  element.addEventListener(
    'mousedown',
    () => {
      setTimeout(() => {
        sample = { value: read() };
      }, 300);
    },
    { once: true },
  );
  await browser.userEvent.click(element, { delay: 800 });
  if (!sample) throw new Error('The press was never read');
  return sample.value;
}
