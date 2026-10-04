import { expect, test } from '@playwright/test';

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
