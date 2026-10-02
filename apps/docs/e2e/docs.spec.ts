import { expect, test } from '@playwright/test';

test('a component demo responds after hydration', async ({ page }) => {
  await page.goto('/docs/components/button');
  const demo = page.getByTestId('demo-button');
  await expect(demo).toHaveText('Pressed 0 times');
  await demo.click();
  await demo.click();
  await expect(demo).toHaveText('Pressed 2 times');
});

test('sidebar links navigate without a full page load', async ({ page }) => {
  await page.goto('/docs/components/button');
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

test('search finds a component page', async ({ page }) => {
  await page.goto('/docs');
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
