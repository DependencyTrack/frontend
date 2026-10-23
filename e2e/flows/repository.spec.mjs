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

test('change the password secret of a repository', async ({ page, api }) => {
  const identifier = uniqueName('e2e-repository');
  const [before, secret] = [uniqueName('e2e-secret'), uniqueName('e2e-secret')];
  for (const name of [before, secret]) {
    await api.send('POST', '/v2/secrets', { name, value: 'hunter2' });
  }
  await api.send('PUT', '/v1/repository', {
    type: 'MAVEN',
    identifier,
    url: 'https://secret.example.com',
    internal: false,
    authenticationRequired: true,
    username: 'e2e',
    password: before,
    enabled: true,
  });
  await login(page);
  await page.goto('admin/repositories/maven');
  await filter(page, identifier);
  await page.getByRole('cell', { name: identifier, exact: true }).click();
  const search = page.getByLabel('Password');
  await page.getByRole('combobox').filter({ has: search }).click();
  await search.fill(secret);
  await page.getByRole('option', { name: secret }).click();
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  const repositories = await api.get('/v1/repository/MAVEN');
  expect(repositories.find((r) => r.identifier === identifier)).toMatchObject({
    password: secret,
  });
});
