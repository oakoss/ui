import { expect, type Page, test } from '@playwright/test';

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
