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

// The site's one Toaster renders a demo's toast, once.
test('a toast demo shows its toast', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/toast');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alertdialog', { name: 'Changes saved' }),
  ).toHaveCount(1);
});

// The placement demo's own Toaster shows its toast where asked, once, while
// the site's Toaster stays out of it.
test('the placement demo shows its toast at the placement', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/components/toast');
  await page.getByRole('button', { name: 'top start' }).click();
  const toast = page.getByRole('alertdialog', { name: 'Shown at top start' });
  await expect(toast).toHaveCount(1);
  await expect(
    page.getByRole('region', {
      exact: true,
      name: 'Placement example, 1 toast',
    }),
  ).toBeVisible();
  const box = await toast.boundingBox();
  expect(box?.x).toBeLessThan(100);
  expect(box?.y).toBeLessThan(100);
  await expect(page.getByRole('region', { name: /notification/u })).toHaveCount(
    0,
  );
});

// The stack demo's switch opens and closes its own stack, not the site's.
test('the stack demo keeps its stack open', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/toast');
  const add = page.getByRole('button', { name: 'Add a toast' });
  await add.click();
  await add.click();
  const region = page.getByRole('region', {
    exact: true,
    name: 'Stack example, 2 toasts',
  });
  const behind = region.locator('[data-behind]');
  await expect(behind).toHaveCount(1);
  const label = page.getByText('Keep the stack open');
  await label.click();
  await expect(
    page.getByRole('switch', { name: 'Keep the stack open' }),
  ).toBeChecked();
  await expect(region.getByRole('alertdialog')).toHaveCount(2);
  await expect(behind).toHaveCount(0);
  await label.click();
  await expect(behind).toHaveCount(1);
});

// A custom toast is named by its title rather than its drawn text.
test('the custom demo names its toast by its title', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/toast');
  await page.getByRole('button', { name: 'Share a file' }).click();
  await expect(
    page.getByRole('alertdialog', {
      exact: true,
      name: 'Ana shared Q3 roadmap.pdf',
    }),
  ).toContainText('Ana shared a file');
});

// Calendar demos read the visitor's clock, so they render after hydration: a
// visit months after the build hydrates without a mismatch.
test('calendar demos render only on the client', async ({ page }) => {
  const response = await page.request.get('/docs/components/calendar');
  expect(await response.text()).not.toContain('role="grid"');
  const errors: string[] = [];
  const messages: { text: string; type: string }[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  page.on('console', (message) => {
    messages.push({ text: message.text(), type: message.type() });
  });
  await page.clock.install({ time: new Date(2027, 5, 20, 12) });
  await gotoHydrated(page, '/docs/components/calendar');
  await expect(page.getByRole('grid').first()).toBeVisible();
  expect(errors).toEqual([]);
  expect(messages.filter(({ type }) => type === 'error')).toEqual([]);
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
  await expect(
    next.getByText('pnpm dlx shadcn@latest add @oakoss/text-field'),
  ).toBeVisible();
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
  // Each file loads on open as a titled, copyable code block.
  const cx = page.getByRole('figure').filter({ hasText: 'createCn' });
  await expect(cx).toBeVisible();
  await expect(cx.locator('figcaption')).toHaveText('lib/cx.ts');
  await expect(cx.getByRole('button', { name: 'Copy Text' })).toBeVisible();
});

test("a code block's button copies its code", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.clipboard.writeText = (text) => {
      document.documentElement.dataset.copied = text;
      return Promise.resolve();
    };
  });
  await gotoHydrated(page, '/docs/installation');
  const block = page.getByRole('figure').filter({ hasText: 'shadcn@latest' });
  await block.first().getByRole('button', { name: 'Copy Text' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-copied',
    'npx shadcn@latest init https://ui.oakoss.dev/r/base.json',
  );
});

test('a code block that fits is neither a tab stop nor a region', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/installation');
  const block = page.getByRole('figure').filter({ hasText: 'shadcn@latest' });
  const viewport = block.first().locator('pre').locator('..');
  await expect(viewport).not.toHaveAttribute('tabindex');
  await expect(viewport).not.toHaveAttribute('role');
});

test('a page that fails to load keeps the sidebar', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  // As when a later deploy has replaced the page's chunk.
  await page.route('**/assets/text-field.mdx*', (route) => route.abort());
  const sidebar = page.getByRole('complementary');
  await sidebar.getByRole('link', { name: 'Text Field' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'This page couldn’t load' }),
  ).toBeVisible();
  await expect(
    sidebar.getByRole('link', { exact: true, name: 'Checkbox' }),
  ).toBeVisible();
  await expect(
    page.getByText('The site may have been updated since you opened it.'),
  ).toBeVisible();
  await page.unroute('**/assets/text-field.mdx*');
  await page.getByRole('button', { name: 'Reload the page' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Text Field' }),
  ).toBeVisible();
});

test('a page whose data fails to load offers no reload', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  await page.route('**/__tsr/staticServerFnCache/**', (route) => route.abort());
  await page
    .getByRole('complementary')
    .getByRole('link', { name: 'Text Field' })
    .click();
  await expect(
    page.getByText('Something went wrong showing this page.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Reload the page' }),
  ).toHaveCount(0);
});

test('a Code tab whose source fails to load keeps the page', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/components/button');
  await page.route('**/assets/*.js', (route) => route.abort());
  await page.getByRole('tab', { name: 'Code' }).first().click();
  await expect(page.getByRole('alert')).toContainText(
    'The code couldn’t be shown.',
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Button' }),
  ).toBeVisible();
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
