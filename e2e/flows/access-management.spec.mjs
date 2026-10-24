import { uniqueName } from '../api.mjs';
import { test, expect, login, search, filter } from '../test.mjs';

// The add buttons in row details are icons without an accessible name.
const addButton = '.expanded-row .fa-plus-square';

test('map a team to an OIDC group in its row details', async ({
  page,
  api,
}) => {
  const group = uniqueName('e2e-group');
  const team = uniqueName('e2e-team');
  await api.send('PUT', '/v1/oidc/group', { name: group });
  await api.send('PUT', '/v1/team', { name: team });

  await login(page);
  await page.goto('admin/accessManagement/oidcGroups');
  await filter(page, group);
  await page.getByRole('cell', { name: group, exact: true }).click();
  await page.locator(addButton).click();
  const modal = page.getByRole('dialog', { name: 'Select Team' });
  await search(page, team, modal);
  await modal.getByRole('row', { name: team }).getByRole('checkbox').check();
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await filter(page, group);
  await page.getByRole('cell', { name: group, exact: true }).click();
  await expect(page.getByText(team)).toBeVisible();
});

test('grant a team access to a project in its row details', async ({
  page,
  api,
}) => {
  const team = uniqueName('e2e-team');
  const project = uniqueName('e2e-project');
  await api.send('PUT', '/v1/team', { name: team });
  await api.send('PUT', '/v1/project', { name: project });

  await login(page);
  await page.goto('admin/accessManagement/portfolioAccessControl');
  await search(page, team);
  await page.getByRole('cell', { name: team, exact: true }).click();
  await page.locator(addButton).click();
  const modal = page.getByRole('dialog', { name: 'Select Project' });
  await search(page, project, modal);
  await modal.getByRole('row', { name: project }).getByRole('checkbox').check();
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await search(page, team);
  await page.getByRole('cell', { name: team, exact: true }).click();
  await expect(page.getByRole('link', { name: project })).toBeVisible();
});

test('delete a managed user after confirming', async ({ page, api }) => {
  const name = uniqueName('e2e-delete');
  await api.send('PUT', '/v1/user/managed', {
    username: name,
    fullname: 'E2E User',
    email: `${name}@example.com`,
    newPassword: 'initial-password',
    confirmPassword: 'initial-password',
  });
  await login(page);
  await page.goto('admin/accessManagement/managedUsers');
  await filter(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Delete User', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Delete User' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(page.getByRole('cell', { name, exact: true })).toBeHidden();
});

test('delete an OIDC group after confirming', async ({ page, api }) => {
  const name = uniqueName('e2e-delete');
  await api.send('PUT', '/v1/oidc/group', { name });
  await login(page);
  await page.goto('admin/accessManagement/oidcGroups');
  await filter(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Delete Group', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Delete Group' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(page.getByRole('cell', { name, exact: true })).toBeHidden();
});

test('copy a new service account API key', async ({ page, context, api }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const name = uniqueName('e2e-service-account');
  await api.send('POST', '/v2/service-accounts', { name });

  await login(page);
  await page.goto('admin/accessManagement/serviceAccounts');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page
    .getByRole('group', { name: 'API Keys' })
    .locator('.fa-plus-square')
    .click();
  const modal = page.getByRole('dialog', { name: 'New API Key' });
  await modal.getByRole('button', { name: 'Create' }).click();
  await modal.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByText('Copied to clipboard')).toBeVisible();
  const key = await modal.locator('pre').textContent();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    key.trim(),
  );
});
