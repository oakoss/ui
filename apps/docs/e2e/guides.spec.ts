import { expect, type Locator, type Page, test } from '@playwright/test';

import { gotoHydrated } from './hydrated';

test('the localization demo flips direction and translates strings', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/guides/localization');
  const demo = page.getByTestId('localized');
  await expect(demo).toHaveAttribute('dir', 'ltr');
  await expect(
    demo.getByRole('button', { name: 'Clear search' }),
  ).toBeAttached();

  await page.getByRole('button', { name: 'العربية' }).click();
  await expect(demo).toHaveAttribute('dir', 'rtl');
  await expect(demo).toHaveAttribute('lang', 'ar-EG');
  // The app's own string, passed as a prop.
  const email = demo.getByRole('textbox', { name: 'البريد الإلكتروني' });
  await expect(email).toBeVisible();
  // React Aria's built-in string, translated with no work from the app.
  await expect(demo.getByRole('button', { name: 'مسح البحث' })).toBeAttached();
  // Logical padding: the search input's end padding (room for the clear
  // button) moves to the left in RTL.
  const padding = await demo
    .getByRole('searchbox', { name: 'بحث' })
    .evaluate((input) => {
      const style = getComputedStyle(input);
      return { left: style.paddingLeft, right: style.paddingRight };
    });
  expect(padding).toEqual({ left: '36px', right: '10px' });
});

test('the TanStack Form demo validates, shows server errors and submits', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/guides/tanstack-form');
  const name = page.getByRole('textbox', { name: 'Name' });
  const email = page.getByRole('textbox', { name: 'Email' });
  const submit = page.getByRole('button', { name: 'Sign up' });

  // Nothing validates before the first submit. A browser-invalid email still
  // reaches TanStack Form, so validationBehavior="aria" kept the submit going.
  await name.fill('A');
  await email.fill('nope');
  await expect(name).not.toHaveAttribute('aria-invalid');
  await submit.click();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription(
    'Enter at least 2 characters.',
  );
  await expect(email).toHaveAccessibleDescription(/Enter a valid email\./u);

  // After a submit, fixing a field clears its error as the user types, and
  // leaves the other field's error alone once async checks settle.
  await name.fill('Ada');
  await expect(name).not.toHaveAttribute('aria-invalid');
  await page.waitForTimeout(1000);
  await expect(email).toHaveAttribute('aria-invalid', 'true');

  await email.fill('taken@example.com');
  await expect(email).toHaveAccessibleDescription(
    /This email is already registered\./u,
  );

  // A taken email blocks the submit.
  await submit.click();
  await page.waitForTimeout(1000);
  await expect(page.getByText(/Signed up as/u)).toHaveCount(0);

  await email.fill('ada@example.com');
  await expect(email).not.toHaveAttribute('aria-invalid');
  await submit.click();
  await expect(page.getByText('Signed up as Ada.')).toBeVisible();
});

async function leaveForm(page: Page) {
  await gotoHydrated(page, '/docs/guides/tanstack-form');
  const segment = (name: RegExp) => page.getByRole('spinbutton', { name });
  return {
    endDay: segment(/^day, End Date, Leave/u),
    reviewDay: segment(/^day, Manager review by/u),
    reviewMonth: segment(/^month, Manager review by/u),
    startMonth: segment(/^month, Start Date, Leave/u),
    submit: page.getByRole('button', { name: 'Request leave' }),
    type: async (target: Locator, digits: string) => {
      await target.click();
      await page.keyboard.type(digits);
    },
  };
}

test('the TanStack Form date demo checks the leave dates', async ({ page }) => {
  const { endDay, startMonth, submit, type } = await leaveForm(page);

  await submit.click();
  await expect(startMonth).toHaveAccessibleDescription(/Pick your dates\./u);

  // React Aria's own reversed-range check yields to isInvalid, so the schema
  // carries it.
  await type(startMonth, '0314202603132026');
  await expect(startMonth).toHaveAccessibleDescription(
    /End on or after the first day\./u,
  );
  await type(endDay, '14');
  await expect(startMonth).not.toHaveAttribute('aria-invalid');
  await type(endDay, '28');
  await expect(startMonth).toHaveAccessibleDescription(
    /Take 14 days at most\./u,
  );
  await type(endDay, '27');
  await expect(startMonth).not.toHaveAttribute('aria-invalid');
});

test('the TanStack Form date demo checks the review date and submits ISO strings', async ({
  page,
}) => {
  const { reviewDay, reviewMonth, startMonth, submit, type } =
    await leaveForm(page);

  await type(startMonth, '0314202603162026');
  await submit.click();
  await expect(reviewMonth).toHaveAccessibleDescription(
    /Pick a review date\./u,
  );
  // On the first day, so the rule compares with the start, not the end.
  await type(reviewMonth, '03142026');
  await expect(reviewMonth).toHaveAccessibleDescription(
    /Review before the leave starts\./u,
  );
  await type(reviewDay, '13');
  await expect(reviewMonth).not.toHaveAttribute('aria-invalid');
  await submit.click();
  await expect(
    page.getByText('Requested 2026-03-14 to 2026-03-16.'),
  ).toBeVisible();
});

test('the dates guide demo prints each conversion of the value', async ({
  page,
}) => {
  await gotoHydrated(page, '/docs/guides/dates');
  const values = page.locator('dd');
  await expect(values).toHaveText([
    '2026-03-14T09:30:00-04:00[America/New_York]',
    '2026-03-14T13:30:00.000Z',
    '2026-03-14T13:30:00.000Z',
  ]);
  await page.getByRole('spinbutton', { name: /^hour, Meeting/u }).click();
  await page.keyboard.press('ArrowUp');
  await expect(values).toHaveText([
    '2026-03-14T10:30:00-04:00[America/New_York]',
    '2026-03-14T14:30:00.000Z',
    '2026-03-14T14:30:00.000Z',
  ]);
});
