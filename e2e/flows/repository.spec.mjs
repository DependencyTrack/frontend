import { uniqueName } from '../api.mjs';
import { test, expect, login, filter } from '../test.mjs';

test('change a repository URL in its row details', async ({ page, api }) => {
  const identifier = uniqueName('e2e-repository');
  const url = `https://${uniqueName('maven')}.example.com`;
  await api.send('PUT', '/v1/repository', {
    type: 'MAVEN',
    identifier,
    url: 'https://before.example.com',
    internal: false,
    authenticationRequired: false,
    enabled: true,
  });
  await login(page);
  await page.goto('admin/repositories/maven');
  await filter(page, identifier);
  await page.getByRole('cell', { name: identifier, exact: true }).click();
  await page.getByRole('textbox', { name: 'URL' }).fill(url);
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await filter(page, identifier);
  await page.getByRole('cell', { name: identifier, exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'URL' })).toHaveValue(url);
});
