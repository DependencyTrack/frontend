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
