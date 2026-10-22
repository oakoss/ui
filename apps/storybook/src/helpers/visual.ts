// Screenshots the page after a story when VITE_VISUAL is set, named by story
// id. Loads Vitest on call, since it throws outside a Vitest run.
export async function captureStory({ id }: { id: string }) {
  if (import.meta.env.VITE_VISUAL !== 'true') return;
  const [vitest, browser] = await Promise.all([
    import('vitest'),
    import('vitest/browser'),
  ]);
  // Soft, like the screenshot: a throw would skip Storybook's afterEach,
  // which removes the stylesheet that pauses every animation on the page.
  vitest.expect
    .soft(await waitForCarousels(), 'a carousel was still moving after 3s')
    .toBe('settled');
  await vitest.expect.soft(browser.page).toMatchScreenshot(id);
}

function carouselTransforms(): string | undefined {
  const moving = document.querySelectorAll<HTMLElement>(
    '[data-slot="carousel-content"] > *, [data-slot="carousel-item"]',
  );
  if (moving.length === 0) return undefined;
  return [...moving].map((element) => element.style.transform).join('|');
}

function nextFrame(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
    setTimeout(resolve, Math.max(timeout, 0));
  });
}

// Embla moves slides from script, which the screenshot's animation pause
// doesn't stop, and its 0.01px rounding can hold a value ~350ms before a last
// step, so a transform held 400ms has settled.
function waitForCarousels(): Promise<'moving' | 'settled'> {
  const start = carouselTransforms();
  if (start === undefined) return Promise.resolve('settled');
  const end = performance.now() + 3000;
  const hold = async (
    previous: string,
    since: number,
  ): Promise<'moving' | 'settled'> => {
    const now = performance.now();
    if (now - since >= 400) return 'settled';
    if (now >= end) return 'moving';
    await nextFrame(end - now);
    const current = carouselTransforms() ?? '';
    return hold(current, current === previous ? since : performance.now());
  };
  return hold(start, performance.now());
}
