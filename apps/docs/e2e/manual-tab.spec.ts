import { expect, type Page, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { gotoHydrated } from './hydrated';

const components = path.join(
  import.meta.dirname,
  '../dist/client/docs/components',
);

function chunkStemOf(url: string) {
  return path.basename(new URL(url).pathname).replace(/-[\w-]{8}\.js$/u, '');
}

// The source each "Couldn’t load the source for <path>" warning names.
function collectFailedSources(page: Page) {
  const sources: string[] = [];
  page.on('console', (message) => {
    const [, source] =
      /^Couldn’t load the source for (\S+)/u.exec(message.text()) ?? [];
    if (source !== undefined) sources.push(source);
  });
  return sources;
}

// React renders lazy siblings one at a time, so a Manual tab that left its
// files to React fetched them one after another. With every response held,
// a tab that requests them together still reaches all of them.
async function expectFilesRequestedTogether(page: Page, tab: number) {
  await gotoHydrated(page, `/docs/${largestManualInstall().slug}`);
  const held: { release: () => Promise<void>; url: string }[] = [];
  await page.route('**/assets/*.js', (route) => {
    held.push({ release: () => route.continue(), url: route.request().url() });
  });
  await page.getByRole('tab', { name: 'Manual' }).nth(tab).click();
  const panel = page.getByRole('tabpanel', { name: 'Manual' });
  const files = await panel.getByRole('listitem').allTextContents();
  // A file's chunk is named after it (button.tsx: button-<hash>.js), so
  // other chunks the tab loads don't count toward its files.
  const stems = new Set(files.map((file) => stemOf(file)));
  expect(stems.size).toBe(files.length);
  await expect
    .poll(() => held.filter(({ url }) => stems.has(chunkStemOf(url))).length)
    .toBeGreaterThanOrEqual(files.length);
  await Promise.all(held.map(({ release }) => release()));
  await page.unroute('**/assets/*.js');
  await expect(panel.locator('figure figcaption')).toHaveText(files);
}

function largestManualInstall() {
  const [largest] = manualInstalls().toSorted(
    (a, b) => b.files.length - a.files.length,
  );
  if (largest === undefined) throw new Error('no page has a Manual tab');
  return largest;
}

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

function stemOf(file: string) {
  return path.basename(file).replace(/\.[^.]+$/u, '');
}

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

// Each tab opens on its own page, since one tab's files can cover another's.
test('each Manual tab requests its files together', async ({ context }) => {
  const probe = await context.newPage();
  await gotoHydrated(probe, `/docs/${largestManualInstall().slug}`);
  const tabs = await probe.getByRole('tab', { name: 'Manual' }).count();
  await probe.close();
  expect(tabs).toBeGreaterThan(1);
  const indexes = Array.from({ length: tabs }, (_, index) => index);
  for (const tab of indexes) {
    // oxlint-disable-next-line no-await-in-loop -- one tab at a time keeps each tab's requests apart
    await expectFilesRequestedTogether(await context.newPage(), tab);
  }
});

test('a Manual tab whose files fail to load keeps the page', async ({
  page,
}) => {
  const uncaught: string[] = [];
  page.on('pageerror', (error) => {
    uncaught.push(error.message);
  });
  const failedSources = collectFailedSources(page);
  await gotoHydrated(page, '/docs/components/button');
  // As when a later deploy has replaced the chunks the page was built with.
  await page.route('**/assets/*.js', (route) => route.abort());
  await page.getByRole('tab', { name: 'Manual' }).click();
  const panel = page.getByRole('tabpanel', { name: 'Manual' });
  await expect(page.getByRole('alert')).toContainText(
    'The files couldn’t be shown.',
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Button' }),
  ).toBeVisible();
  // The files load together, so those after the first fail too: each one is
  // named in a warning (by its path in packages/ui, under src/), and none
  // reaches the page as uncaught.
  const files = await panel.getByRole('listitem').allTextContents();
  await expect
    .poll(() => files.filter((file) => failedSources.includes(`src/${file}`)))
    .toEqual(files);
  expect(uncaught).toEqual([]);
});
