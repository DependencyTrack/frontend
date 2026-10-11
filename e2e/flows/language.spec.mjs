import { test, expect, login } from '../test.mjs';

test('switch the language with the locale picker', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
  // The picker sits in the profile dropdown, whose toggle has no accessible name.
  await page
    .getByRole('combobox', { includeHidden: true })
    .filter({
      has: page.getByRole('option', { name: /DE$/, includeHidden: true }),
    })
    // eslint-disable-next-line playwright/no-force-option -- The dropdown stays closed.
    .selectOption('de', { force: true });
  await expect(page.getByRole('link', { name: 'Projekte' })).toBeVisible();
});
