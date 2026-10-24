import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('rename a team and see the row update', async ({ page, api }) => {
  const name = uniqueName('e2e-team');
  const renamed = `${name}-renamed`;
  await api.send('PUT', '/v1/team', { name });

  await login(page);
  await page.goto('admin/accessManagement/teams');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  const teamName = page.getByRole('textbox', { name: /^Team Name/ });
  await teamName.fill(renamed);
  // The name is saved after a debounced keyup, which fill() doesn't fire.
  await teamName.press('End');
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('cell', { name: renamed, exact: true }),
  ).toBeVisible();
});

test('show a new team API key and remove it after confirming', async ({
  page,
  api,
}) => {
  const name = uniqueName('e2e-team');
  await api.send('PUT', '/v1/team', { name });

  await login(page);
  await page.goto('admin/accessManagement/teams');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  const keys = page.getByRole('group', { name: 'API Keys' });
  await keys.locator('.fa-plus-square').click();
  const created = page.getByRole('dialog', { name: 'New API Key' });
  await expect(created).toContainText('will only be displayed once');
  await expect(created.locator('pre')).not.toBeEmpty();
  await created.getByRole('button', { name: 'OK' }).click();
  await expect(created).toBeHidden();
  const publicId = keys.getByText(/^Public ID:/);
  await expect(publicId).toHaveCount(1);

  await keys.locator('.fa-repeat').click();
  const regenerate = page.getByRole('dialog', { name: 'Regenerate API Key' });
  await regenerate.getByRole('button', { name: 'Regenerate' }).click();
  await expect(regenerate).toContainText('will only be displayed once');
  await expect(regenerate.locator('pre')).not.toBeEmpty();
  await regenerate.getByRole('button', { name: 'OK' }).click();
  await expect(regenerate).toBeHidden();

  const remove = page.getByRole('dialog', { name: 'Remove API Key' });
  await keys.locator('.fa-trash-o').click();
  await remove.getByRole('button', { name: 'Cancel' }).click();
  await expect(remove).toBeHidden();
  await expect(publicId).toHaveCount(1);
  await keys.locator('.fa-trash-o').click();
  await remove.getByRole('button', { name: 'Delete' }).click();
  await expect(publicId).toHaveCount(0);
});

test('delete a team only after confirming', async ({ page, api }) => {
  const name = uniqueName('e2e-team');
  await api.send('PUT', '/v1/team', { name });

  await login(page);
  await page.goto('admin/accessManagement/teams');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Delete Team' });
  await page.getByRole('button', { name: 'Delete Team' }).click();
  await confirm.getByRole('button', { name: 'Cancel' }).click();
  await expect(confirm).toBeHidden();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete Team' }).click();
  await confirm.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Team deleted')).toBeVisible();
  await expect(page.getByRole('cell', { name, exact: true })).toBeHidden();
});
