import { test, expect, login } from '../test.mjs';

test('switch the language with the locale picker', async ({ page }) => {
  const germanMessages = [];
  page.on('request', (req) => {
    if (/\/de-[\w-]+\.js$/.test(req.url())) germanMessages.push(req.url());
  });
  await login(page);
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
  expect(germanMessages).toEqual([]);
  await page.locator('.fa-user-circle-o').click();
  const picker = page
    .getByRole('combobox')
    .filter({ has: page.getByRole('option', { name: /DE$/ }) });
  await expect(picker.getByRole('option', { name: /UK-UA$/ })).toHaveAttribute(
    'title',
    'Ukrainian',
  );
  await picker.selectOption('de');
  await expect(page.getByRole('link', { name: 'Projekte' })).toBeVisible();
  expect(germanMessages).toHaveLength(1);
});
