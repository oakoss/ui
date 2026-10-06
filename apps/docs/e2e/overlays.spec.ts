import { expect, type Locator, type Page, test } from '@playwright/test';

import { gotoHydrated } from './hydrated';

// Overlays portal to <body>, outside the preview, so they take the site's
// theme from the class Fumadocs sets on <html>.
async function dialogColors(page: Page) {
  await gotoHydrated(page, '/docs/components/dialog');
  await page.getByRole('button', { name: 'Edit profile' }).click();
  const content = page.locator('[data-slot=dialog-content]');
  await expect(content).not.toHaveAttribute('data-entering');
  return content.evaluate((element) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--color-popover)';
    document.body.append(probe);
    const expected = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { actual: getComputedStyle(element).backgroundColor, expected };
  });
}

test("a dialog follows the site's light theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  const { actual, expected } = await dialogColors(page);
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/u);
  expect(actual).toBe(expected);
});

test("a dialog follows the site's dark theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const { actual, expected } = await dialogColors(page);
  await expect(page.locator('html')).toHaveClass(/\bdark\b/u);
  expect(actual).toBe(expected);
});

async function openSettled(page: Page, trigger: string) {
  await gotoHydrated(page, '/docs/components/dialog');
  await page.getByRole('button', { name: trigger }).click();
  const content = page.locator('[data-slot=dialog-content]');
  await expect(content).not.toHaveAttribute('data-entering');
  await content.evaluate((element) =>
    Promise.all(element.getAnimations().map((a) => a.finished)),
  );
  return content;
}

// Below `sm` the panel sits on the bottom edge with only its top corners
// rounded.
test('on a phone, a dialog sits on the bottom edge', async ({ page }) => {
  await page.setViewportSize({ height: 700, width: 375 });
  const content = await openSettled(page, 'Edit profile');
  const layout = await content.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      bottom: element.getBoundingClientRect().bottom,
      bottomRadius: style.borderBottomLeftRadius,
      topRadius: style.borderTopLeftRadius,
      width: element.getBoundingClientRect().width,
    };
  });
  expect(layout).toMatchObject({
    bottom: 700,
    bottomRadius: '0px',
    width: 375,
  });
  expect(layout.topRadius).not.toBe('0px');
});

// Below 31.25rem of height, the body stops shrinking and the whole panel
// scrolls, so the body isn't squeezed between the header and footer.
test('on a short screen, the whole dialog scrolls', async ({ page }) => {
  await page.setViewportSize({ height: 400, width: 1024 });
  const content = await openSettled(page, 'Read terms');
  const body = content.locator('[data-slot=dialog-body]');
  expect(await scrolls(content)).toBe(true);
  expect(await scrolls(body)).toBe(false);
  const box = await body.boundingBox();
  expect(box?.height).toBeGreaterThan(200);
  // Scrolled to the end, the footer keeps the panel's bottom padding.
  expect(await footerGapAtEnd(content)).toBeGreaterThanOrEqual(24);
});

// The fallback reads the overlay's height, which follows the visible viewport,
// so it also applies when a phone's on-screen keyboard shrinks that viewport.
test('a shrunken visible viewport triggers the short-screen fallback', async ({
  page,
}) => {
  await page.setViewportSize({ height: 700, width: 375 });
  const content = await openSettled(page, 'Read terms');
  const body = content.locator('[data-slot=dialog-body]');
  expect(await scrolls(body)).toBe(true);
  await page
    .locator('[data-slot=dialog-overlay]')
    .evaluate((overlay: HTMLElement) =>
      overlay.style.setProperty('--visual-viewport-height', '300px'),
    );
  await expect.poll(() => scrolls(body)).toBe(false);
  expect(await scrolls(content)).toBe(true);
});

// The gap under the footer once the panel is scrolled to its end.
function footerGapAtEnd(panel: Locator) {
  return panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    const footer = element.querySelector('[data-slot=dialog-footer]');
    const bottom = footer?.getBoundingClientRect().bottom ?? 0;
    return element.getBoundingClientRect().bottom - bottom;
  });
}

function scrolls(element: Locator) {
  return element.evaluate((node) => node.scrollHeight > node.clientHeight);
}

test('on a tall screen, the body scrolls between header and footer', async ({
  page,
}) => {
  await page.setViewportSize({ height: 600, width: 1024 });
  const content = await openSettled(page, 'Read terms');
  expect(await scrolls(content.locator('[data-slot=dialog-body]'))).toBe(true);
  expect(await scrolls(content)).toBe(false);
});

test('the two themes paint the dialog differently', async ({ browser }) => {
  const [light, dark] = await Promise.all([
    browser.newPage({ colorScheme: 'light' }),
    browser.newPage({ colorScheme: 'dark' }),
  ]);
  const [lightColors, darkColors] = await Promise.all([
    dialogColors(light),
    dialogColors(dark),
  ]);
  expect(lightColors.actual).not.toBe(darkColors.actual);
});
