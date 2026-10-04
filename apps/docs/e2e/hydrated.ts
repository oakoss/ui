import { expect, type Page } from '@playwright/test';

// The prerendered page shows before React attaches its handlers, and input
// sent in between is lost; the docs page marks <html> once it hydrates.
export async function gotoHydrated(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('html[data-hydrated]')).toBeAttached();
}
