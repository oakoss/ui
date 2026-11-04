import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { gotoHydrated } from './hydrated';

const client = path.join(import.meta.dirname, '../dist/client');

// Only docs pages mark <html> once they hydrate. Axe reads colors mid-fade,
// such as the table of contents button's heading, so finite animations
// finish first.
async function open(page: Page, url: string) {
  await (url.startsWith('/docs/') ? gotoHydrated(page, url) : page.goto(url));
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().endTime !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  );
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

// Visible text React Aria announces as a description, not the label; the
// demo's prices wait on ui-rxj. axe's selectors lack :has(), so mark them.
// axe skips an exempt item whole, so its name is checked against its label.
const labelInName = 'label-content-name-mismatch';
const extraText = '[data-slot$="-shortcut"], [slot="description"]';
const exemptItems = `[data-slot$="-item"]:has(${extraText}):not(:has(a, button, input, select, textarea, [tabindex]))`;
const exemptCells =
  '[data-slot="calendar"][aria-label^="Departure date"] [data-slot="calendar-cell"]';

async function markLabelInNameExempt(page: Page) {
  const items = await page.evaluate(
    ({ cells, extra, items: selector }) => {
      for (const cell of document.querySelectorAll<HTMLElement>(cells)) {
        cell.dataset.labelInNameExempt = '';
      }
      return [...document.querySelectorAll<HTMLElement>(selector)].map(
        (item) => {
          item.dataset.labelInNameExempt = '';
          const visible = item.cloneNode(true);
          if (!(visible instanceof HTMLElement)) return { label: '', name: '' };
          for (const part of visible.querySelectorAll(extra)) part.remove();
          const ids = (item.getAttribute('aria-labelledby') ?? '')
            .split(' ')
            .filter(Boolean);
          return {
            label: (visible.querySelector('[slot="label"]') ?? visible)
              .textContent,
            name:
              ids.length > 0
                ? ids
                    .map(
                      (id) =>
                        document.querySelector(`#${CSS.escape(id)}`)
                          ?.textContent ?? '',
                    )
                    .join(' ')
                : (item.getAttribute('aria-label') ?? ''),
          };
        },
      );
    },
    { cells: exemptCells, extra: extraText, items: exemptItems },
  );
  return items
    .filter(({ label, name }) => !normalize(name).includes(normalize(label)))
    .map(({ label, name }) => `${labelInName}: "${name}" lacks "${label}"`);
}

function normalize(text: string) {
  return text.replaceAll(/\s+/gu, ' ').trim().toLowerCase();
}

function report(violations: { id: string; nodes: { target: unknown[] }[] }[]) {
  return violations.map(
    ({ id, nodes }) =>
      `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
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
      expect(report(violations)).toEqual([]);
    });

    for (const url of pageUrls()) {
      test(`passes axe on ${url}`, async ({ page }) => {
        await open(page, url);
        await expect(page.locator('html')).toHaveClass(themeClass[colorScheme]);
        const { violations } = await new AxeBuilder({ page })
          .disableRules([labelInName])
          .analyze();
        const mismatched = await markLabelInNameExempt(page);
        const labels = await new AxeBuilder({ page })
          .withRules([labelInName])
          .exclude('[data-label-in-name-exempt]')
          .analyze();
        expect([
          ...report([...violations, ...labels.violations]),
          ...mismatched,
        ]).toEqual([]);
      });
    }
  });
}
