import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

import { gotoHydrated } from './hydrated';

const shared = '/docs/components/popover?family=mauve&primary=red&radius=none';

function cssVar(locator: Locator, name: string) {
  return locator.evaluate(
    (element, variable) => getComputedStyle(element).getPropertyValue(variable),
    name,
  );
}

async function openPanel(page: Page) {
  await page.getByRole('button', { exact: true, name: 'Theme' }).click();
  const panel = page.getByRole('dialog', { name: 'Theme' });
  await expect(panel).toBeVisible();
  return panel;
}

// The value a variable takes under a theme, read from a probe element.
function themed(page: Page, attributes: string, name: string) {
  return page.evaluate(
    ([attrs, variable]) => {
      const probe = document.createElement('div');
      const entries = new URLSearchParams(attrs);
      for (const [key, value] of entries) {
        probe.setAttribute(`data-${key}`, value);
      }
      document.body.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(variable);
      probe.remove();
      return value;
    },
    [attributes, name] as const,
  );
}

test('a shared link applies its theme before any script loads', async ({
  page,
}) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.goto(shared);
  await expect(page.locator('html')).toHaveAttribute('data-family', 'mauve');
  await expect(page.locator('html')).toHaveAttribute('data-primary', 'red');
  await expect(page.locator('html')).toHaveAttribute('data-radius', 'none');
});

test('the theme reaches previews and their popovers, not the site', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await gotoHydrated(page, '/docs/components/popover');
  const siteBackground = await cssVar(
    page.locator('html'),
    '--color-fd-background',
  );
  await gotoHydrated(page, shared);
  const trigger = page.getByRole('button', { name: 'Dimensions' });
  await expect(trigger).toHaveCSS('border-top-left-radius', '0px');
  await trigger.click();
  const popover = page.locator('[data-slot=popover]');
  await expect(popover).toBeVisible();
  const mauve = await themed(page, 'family=mauve', '--popover');
  expect(mauve).not.toBe(await themed(page, 'family=zinc', '--popover'));
  expect(await cssVar(popover, '--popover')).toBe(mauve);
  const red = await themed(page, 'primary=red', '--primary');
  expect(red).not.toBe(await themed(page, 'primary=zinc', '--primary'));
  expect(await cssVar(popover, '--primary')).toBe(red);
  expect(await cssVar(page.locator('html'), '--color-fd-background')).toBe(
    siteBackground,
  );
});

test('a chosen theme stays on the next page', async ({ page }) => {
  await gotoHydrated(page, shared);
  await gotoHydrated(page, '/docs/components/button');
  await expect(page.locator('html')).toHaveAttribute('data-family', 'mauve');
});

test('an unknown family falls back to the default theme', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button?family=plaid');
  await expect(page.locator('html')).toHaveAttribute('data-family', 'zinc');
});

test('the panel restyles the page and builds the install command', async ({
  page,
}) => {
  await gotoHydrated(page, shared);
  const panel = await openPanel(page);
  await panel.getByRole('radio', { name: 'Large' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-radius', 'large');

  // Mauve's own gray isn't one of Olive's primaries, so the primary resets.
  await panel.getByRole('radio', { name: 'mauve' }).click();
  await panel.getByRole('button', { name: /Family/u }).click();
  await page.getByRole('option', { name: 'Olive' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-family', 'olive');
  await expect(page.locator('html')).toHaveAttribute('data-primary', 'olive');
  await expect(panel.getByRole('code')).toHaveText(
    'npx shadcn@latest add https://ui.oakoss.dev/r/themes/olive-olive-large.json',
  );
});

test('a choice made in the panel stays on the next page', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  const panel = await openPanel(page);
  await panel.getByRole('radio', { name: 'Large' }).click();
  await gotoHydrated(page, '/docs/components/popover');
  await expect(page.locator('html')).toHaveAttribute('data-radius', 'large');
});

test('a refused clipboard write says so', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.clipboard.writeText = () =>
      Promise.reject(new Error('NotAllowedError'));
  });
  await page.clock.install();
  await gotoHydrated(page, '/docs/components/button');
  const panel = await openPanel(page);
  await panel.getByRole('button', { name: 'Copy command' }).click();
  const failed = panel.getByRole('button', { name: 'Copy failed' });
  await expect(failed).toBeVisible();
  // A retry keeps its label for the full two seconds.
  await page.clock.runFor(1500);
  await failed.click();
  await page.clock.runFor(800);
  await expect(failed).toBeVisible();
});

test('serves the theme item the command installs', async ({ request }) => {
  const response = await request.get('/r/themes/mauve-red-none.json');
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toMatchObject({
    cssVars: { light: { radius: '0rem' } },
    name: 'theme-mauve-red-none',
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the open panel passes axe in the ${colorScheme} theme`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await gotoHydrated(page, shared);
    await openPanel(page);
    const { violations } = await new AxeBuilder({ page })
      .include('[data-slot=popover]')
      .analyze();
    expect(violations.map(({ id }) => id)).toEqual([]);
  });
}
