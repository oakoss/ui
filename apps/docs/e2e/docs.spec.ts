import { expect, test } from '@playwright/test';

import { gotoHydrated } from './hydrated';

test('a component demo responds after hydration', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  const demo = page.getByTestId('demo-button');
  await expect(demo).toHaveText('Pressed 0 times');
  await demo.click();
  await demo.click();
  await expect(demo).toHaveText('Pressed 2 times');
});

test('sidebar links navigate without a full page load', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  // Survives client-side navigation and is lost on a full reload.
  await page.evaluate(() => {
    document.documentElement.dataset.e2eMarker = 'kept';
  });
  await page
    .getByRole('complementary')
    .getByRole('link', { name: 'Text Field' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Text Field',
  );
  await expect(page.getByLabel('Work email')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-e2e-marker', 'kept');
});

test('the sidebar keeps its width on a wide screen', async ({ page }) => {
  // Any layout width below 2560px fails here, not only a missing one.
  await page.setViewportSize({ height: 1080, width: 2560 });
  await page.goto('/docs/components/button');
  const box = await page.locator('#nd-sidebar').boundingBox();
  expect(box).toMatchObject({ width: 268, x: 0 });
});

test('collapsing the sidebar keeps the full content width', async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 1024 });
  await gotoHydrated(page, '/docs/components/button');
  await page
    .locator('#nd-sidebar')
    .getByRole('button', { name: 'Collapse Sidebar' })
    .click();
  await expect(page.locator('#nd-sidebar')).toHaveAttribute(
    'data-collapsed',
    'true',
  );
  // The grid animates its columns on collapse.
  await expect
    .poll(async () => {
      const box = await page.locator('#nd-page').boundingBox();
      return box?.width;
    })
    .toBe(900);
});

test('the package-manager choice carries to other pages', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  await page.getByRole('tab', { name: 'pnpm' }).first().click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('package-manager')))
    .toBe('pnpm');
  // A new tab shares localStorage but not the sessionStorage Fumadocs also writes.
  const next = await page.context().newPage();
  await gotoHydrated(next, '/docs/components/text-field');
  await expect(next.getByRole('tab', { name: 'pnpm' }).first()).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(next.getByText('pnpm dlx shadcn@latest add')).toBeVisible();
});

test('the Code tab shows the example source', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  const example = page
    .getByRole('tabpanel')
    .filter({ hasText: 'Publish' })
    .locator('..');
  await example.getByRole('tab', { name: 'Code' }).click();
  await expect(
    example.getByText('[--btn-bg:var(--color-emerald-700)]'),
  ).toBeVisible();
});

test('the Manual tab shows each file it installs', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.getByText('createCn').first()).toBeVisible();
});

test('search finds a component page', async ({ page }) => {
  await gotoHydrated(page, '/docs');
  await page
    .getByRole('button', { name: /search/iu })
    .first()
    .click();
  await page.getByRole('combobox', { name: 'Search' }).fill('validation');
  await expect(
    page.getByRole('option').filter({ hasText: 'Text Field' }).first(),
  ).toBeVisible();
});

test('an unknown URL shows the 404 page', async ({ page }) => {
  const response = await page.goto('/docs/does-not-exist');
  expect(response?.status()).toBe(404);
  // The 404 page hydrates and runs the docs loader, which must keep it.
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Not Found')).toBeVisible();
  await expect(page.getByText('Something went wrong')).toHaveCount(0);
});
