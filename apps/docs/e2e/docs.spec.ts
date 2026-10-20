import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { gotoHydrated } from './hydrated';

const components = path.join(
  import.meta.dirname,
  '../dist/client/docs/components',
);

// Each component page with a Manual tab, and the file paths its .md links.
function manualInstalls() {
  return readdirSync(components)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      files: readFileSync(path.join(components, file), 'utf-8')
        .matchAll(/\[`([^`]+)`\]\([^)]*\/blob\/main\/packages\/ui\//gu)
        .map(([, target = '']) => target)
        .toArray(),
      slug: `components/${file.replace(/\.md$/u, '')}`,
    }))
    .filter(({ files }) => files.length > 0);
}

test('a component demo responds after hydration', async ({ page }) => {
  await gotoHydrated(page, '/docs/components/button');
  const demo = page.getByTestId('demo-button');
  await expect(demo).toHaveText('Pressed 0 times');
  await demo.click();
  await demo.click();
  await expect(demo).toHaveText('Pressed 2 times');
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
  // Each file loads on open as a titled, copyable code block.
  const cx = page.getByRole('figure').filter({ hasText: 'createCn' });
  await expect(cx).toBeVisible();
  await expect(cx.locator('figcaption')).toHaveText('lib/cx.ts');
  await expect(cx.getByRole('button', { name: 'Copy Text' })).toBeVisible();
});

for (const { files, slug } of manualInstalls()) {
  test(`the Manual tab loads every file it lists on ${slug}`, async ({
    page,
  }) => {
    await gotoHydrated(page, `/docs/${slug}`);
    // A page can install more than one item, each with its own tabs.
    const tabs = await page.getByRole('tab', { name: 'Manual' }).all();
    await Promise.all(tabs.map((tab) => tab.click()));
    const panels = page.getByRole('tabpanel', { name: 'Manual' });
    await expect(panels.locator('figure figcaption')).toHaveText(files);
  });
}

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

test('a Manual tab whose files fail to load keeps the page', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/components/button');
  // As when a later deploy has replaced the chunks the page was built with.
  await page.route('**/assets/*.js', (route) => route.abort());
  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'The files couldn’t be shown.',
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Button' }),
  ).toBeVisible();
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
