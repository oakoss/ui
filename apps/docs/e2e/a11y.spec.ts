import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { gotoHydrated } from './hydrated';

const client = path.join(import.meta.dirname, '../dist/client');

// Best-practice rules that flag Fumadocs' own markup, not WCAG failures.
// Storybook still runs both on the components. Tracked in ui-dqp.18.
const disabledRules = [
  // Every code block is a focusable scroll region (role="region"), which
  // keyboard scrolling needs, and an untitled block has no name to tell it
  // apart from the next.
  'landmark-unique',
  // The table of contents sits outside any landmark in Fumadocs' layout.
  'region',
];

// Only docs pages mark <html> once they hydrate.
async function open(page: Page, url: string) {
  await (url.startsWith('/docs/') ? gotoHydrated(page, url) : page.goto(url));
}

// Every prerendered page, as the URL the static host serves it at.
function pageUrls(dir = client): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return pageUrls(file);
    if (!entry.name.endsWith('.html')) return [];
    const url = `/${path.relative(client, file)}`;
    return url.endsWith('/index.html')
      ? url.slice(0, -'index.html'.length)
      : url;
  });
}

// The theme follows the system setting, so each run checks it took.
const themeClass = { dark: /\bdark\b/u, light: /^(?!.*\bdark\b)/u };

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    // The Manual and Code tabs' sources load on open, so the page sweep never
    // sees them.
    test('passes color contrast on open source tabs', async ({ page }) => {
      await gotoHydrated(page, '/docs/components/button');
      await expect(page.locator('html')).toHaveClass(themeClass[colorScheme]);
      await page.getByRole('tab', { name: 'Manual' }).click();
      await expect(
        page.getByRole('figure').filter({ hasText: 'createCn' }),
      ).toBeVisible();
      await page.getByRole('tab', { name: 'Code' }).first().click();
      await expect(
        page
          .getByRole('tabpanel', { name: 'Code' })
          .first()
          .getByRole('figure'),
      ).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      expect(
        violations.map(
          ({ id, nodes }) =>
            `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`,
        ),
      ).toEqual([]);
    });

    for (const url of pageUrls()) {
      test(`passes axe on ${url}`, async ({ page }) => {
        await open(page, url);
        await expect(page.locator('html')).toHaveClass(themeClass[colorScheme]);
        const { violations } = await new AxeBuilder({ page })
          .disableRules(disabledRules)
          .analyze();
        expect(
          violations.map(
            ({ id, nodes }) =>
              `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`,
          ),
        ).toEqual([]);
      });
    }
  });
}
