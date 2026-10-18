import { expect, type Locator, type Page, test } from '@playwright/test';

import { gotoHydrated } from './hydrated';

// A Select's trigger is named by its value, then its label.
async function choose(
  page: Page,
  group: Locator,
  label: string,
  option: string,
) {
  await group
    .getByRole('button', { name: new RegExp(` ${label}$`, 'u') })
    .click();
  await page.getByRole('option', { exact: true, name: option }).click();
}

function row(group: Locator, token: string) {
  return group
    .getByRole('row')
    .filter({
      has: group.page().getByRole('button', { name: `Copy var(--${token})` }),
    });
}

test('a token table follows its own family and flavor', async ({ page }) => {
  await gotoHydrated(page, '/docs/theming/tokens');
  const neutral = page.getByRole('group', { name: 'Neutral roles' });
  const background = row(neutral, 'background');
  await expect(background).toContainText('white');
  await expect(background).toContainText('oklch(1 0 0)');

  await neutral.getByRole('radio', { name: 'Dark' }).click();
  await expect(background).toContainText('zinc-950');
  // The swatch takes the value inline, so it shows dark on a light page.
  await expect(neutral.locator('[data-token="background"]')).toHaveCSS(
    'background-color',
    'oklch(0.141 0.005 285.823)',
  );

  await choose(page, neutral, 'Family', 'Mauve');
  await expect(background).toContainText('mauve-950');
  await expect(background).toContainText('oklch(0.145 0.008 326)');

  // Each table keeps its own choice.
  const derived = page.getByRole('group', { name: 'Derived roles' });
  await expect(row(derived, 'ring')).toContainText(
    'oklch(0.442 0.017 285.786)',
  );
});

test('the Primary table alone follows the primary choice', async ({ page }) => {
  await gotoHydrated(page, '/docs/theming/tokens');
  const primary = page.getByRole('group', { name: 'Primary' });
  await primary.getByRole('radio', { name: 'Dark' }).click();
  await choose(page, primary, 'Primary', 'Blue');
  await expect(row(primary, 'primary')).toContainText('blue-600');
  await expect(row(primary, 'primary')).toContainText(
    'oklch(0.546 0.245 262.881)',
  );
  await expect(row(primary, 'primary-500')).toContainText('blue-500');

  const derived = page.getByRole('group', { name: 'Derived roles' });
  await expect(row(derived, 'ring')).toContainText('--primary-text');
  await expect(row(derived, 'ring')).not.toContainText('blue');
});

test('a new family keeps the primary it offers, else takes its own', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/theming/tokens');
  const primary = page.getByRole('group', { name: 'Primary' });
  // Zinc's default primary is its gray, which Mauve doesn't offer.
  await choose(page, primary, 'Family', 'Mauve');
  await expect(row(primary, 'primary-500')).toContainText('mauve-500');

  await choose(page, primary, 'Primary', 'Blue');
  await choose(page, primary, 'Family', 'Stone');
  await expect(row(primary, 'primary-500')).toContainText('blue-500');
});

test('alpha sources and the field show their opacity', async ({ page }) => {
  await gotoHydrated(page, '/docs/theming/tokens');
  const neutral = page.getByRole('group', { name: 'Neutral roles' });
  await expect(row(neutral, 'field')).toContainText('transparent');

  await neutral.getByRole('radio', { name: 'Dark' }).click();
  await expect(row(neutral, 'border')).toContainText('white / 10%');
  await expect(row(neutral, 'field')).toContainText('--foreground / 4.5%');
  await expect(row(neutral, 'field')).toContainText('oklch(0.985 0 0 / 4.5%)');
});

test("pressing a token's name copies its var()", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.clipboard.writeText = (text) => {
      document.documentElement.dataset.copied = text;
      return Promise.resolve();
    };
  });
  await gotoHydrated(page, '/docs/theming/tokens');
  const neutral = page.getByRole('group', { name: 'Neutral roles' });
  await neutral.getByRole('button', { name: 'Copy var(--muted)' }).click();
  await expect(neutral.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-copied',
    'var(--muted)',
  );
});
