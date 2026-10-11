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
