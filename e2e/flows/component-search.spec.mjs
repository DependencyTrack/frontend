import { test, expect, login } from '../test.mjs';

test('filter components by name with a filter pill', async ({ page }) => {
  await login(page);
  await page.goto('components');
  await page.getByRole('button', { name: 'Add Filter' }).click();
  await page.getByRole('menuitem', { name: 'Name' }).click();
  await page.getByLabel('Name contains').fill('jackson-databind');
  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByText('~ "jackson-databind"')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'jackson-databind' }).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'jackson-core' })).toHaveCount(0);
});

test('verify the hashes of a component', async ({ page }) => {
  const sha1 = '0a6a0e0620d51833feffc67bccb51937b2345763';
  await login(page);
  await page.goto(`components?hash_type=SHA1&hash=${sha1}`);
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Integrity' }).check();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Hashes match' }).first().click();
  const modal = page.getByRole('dialog', { name: 'Hash verification' });
  await expect(modal).toContainText(sha1);
});
