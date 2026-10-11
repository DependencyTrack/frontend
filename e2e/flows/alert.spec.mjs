import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('create a notification alert and limit it to a tag', async ({ page }) => {
  const name = uniqueName('e2e-alert');
  const tag = uniqueName('tag');
  await login(page);
  await page.goto('admin/notifications/alerts');
  await page.getByRole('button', { name: 'Create Alert' }).click();

  const modal = page.getByRole('dialog', { name: 'Create Alert' });
  await modal.getByLabel('Name').fill(name);
  await modal.getByLabel('Publisher').selectOption({ label: 'Console' });
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Alert created')).toBeVisible();
  // Closing returns focus to the Create Alert button, where a keypress would reopen the dialog.
  await expect(modal).toBeHidden();

  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page.getByText('NEW_VULNERABILITY', { exact: true }).click();
  await page.getByRole('button', { name: 'Limit To' }).click();
  await page.getByPlaceholder('Add Tag').fill(tag);
  await page.getByPlaceholder('Add Tag').press('Enter');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'NEW_VULNERABILITY' }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Limit To' }).click();
  await expect(page.getByText(tag)).toBeVisible();
});
