import { test, expect, login } from '../test.mjs';

test('filter components by name with a filter pill', async ({ page }) => {
  await login(page);
  await page.goto('components');
  await page.getByRole('button', { name: 'Add Filter' }).click();
  await page.getByRole('menuitem', { name: 'Name' }).click();
  await page.getByLabel('Name contains').click();
  await page.getByLabel('Name contains').fill('jackson-databind');
  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByText('~ "jackson-databind"')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'jackson-databind' }).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'jackson-core' })).toHaveCount(0);
});

test('move through a dropdown with the keyboard and close it', async ({
  page,
}) => {
  await login(page);
  await page.goto('components');
  const menu = page.getByRole('menu');
  await page.getByRole('button', { name: 'Add Filter' }).click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('show the vulnerabilities of a component in a tooltip', async ({
  page,
}) => {
  await login(page);
  await page.goto('components?name_contains=jackson-databind');
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Vulnerabilities' }).check();
  await page.keyboard.press('Escape');
  await page.getByRole('progressbar').filter({ visible: true }).first().hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Severity' }),
  ).toBeVisible();
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
