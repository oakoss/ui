declare module 'vitest' {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation merges only with an interface
  interface TaskMeta {
    didSendInput?: boolean;
  }
}

const inputTypes = [
  'beforeinput',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dragstart',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mouseover',
  'mouseup',
  'paste',
  'pointerdown',
  'pointerover',
  'pointerup',
  'touchstart',
  'wheel',
];

// Undefined until watchInput runs for the story, and again after its capture.
const story: { didSendInput?: boolean } = {};

// Screenshots the page after a story that sent no input, when VITE_VISUAL is
// set, named by story id; a story that did is marked `didSendInput` in its
// test's meta, which the workflow's image count reads. Loads Vitest on call,
// since it throws outside a Vitest run.
export async function captureStory({ id }: { id: string }) {
  if (import.meta.env.VITE_VISUAL !== 'true') return;
  const [vitest, browser] = await Promise.all([
    import('vitest'),
    import('vitest/browser'),
  ]);
  const { didSendInput } = story;
  story.didSendInput = undefined;
  // Soft, like the screenshot: a throw would skip Storybook's afterEach,
  // which removes the stylesheet that pauses every animation on the page.
  if (didSendInput === undefined) {
    vitest.expect
      .soft(didSendInput, "the preview's beforeEach didn't run watchInput")
      .toBeDefined();
    return;
  }
  // Set either way, so a retry's mark is its own attempt's.
  const test = vitest.TestRunner.getCurrentTest();
  vitest.expect.soft(test, 'no current test to mark').toBeDefined();
  if (test !== undefined) test.meta.didSendInput = didSendInput;
  if (didSendInput) return;
  vitest.expect
    .soft(await waitForCarousels(), 'a carousel was still moving after 3s')
    .toBe('settled');
  await vitest.expect.soft(browser.page).toMatchScreenshot(id);
}

// Records whether the story sends input, for captureStory; returns the
// cleanup that stops recording.
export function watchInput(): (() => void) | undefined {
  if (import.meta.env.VITE_VISUAL !== 'true') return undefined;
  story.didSendInput = false;
  for (const type of inputTypes) {
    document.addEventListener(type, recordInput, { capture: true });
  }
  return () => {
    for (const type of inputTypes) {
      document.removeEventListener(type, recordInput, { capture: true });
    }
  };
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

// A plain Event is a library's own signal, not input: input-otp dispatches
// `input` after mounting.
function recordInput(event: Event) {
  if (event instanceof UIEvent || event instanceof ClipboardEvent) {
    story.didSendInput = true;
  }
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
