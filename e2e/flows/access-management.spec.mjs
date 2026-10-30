import { uniqueName } from '../api.mjs';
import {
  test,
  expect,
  login,
  search,
  filter,
  selectRow,
  expectCreateToSurviveFailure,
} from '../test.mjs';

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
  await selectRow(modal, team);
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
  await api.send('PUT', '/v1/project', { name: project, version: '1.0.0' });

  await login(page);
  await page.goto('admin/accessManagement/portfolioAccessControl');
  await search(page, team);
  await page.getByRole('cell', { name: team, exact: true }).click();
  await page.locator(addButton).click();
  const modal = page.getByRole('dialog', { name: 'Select Project' });
  await search(page, project, modal);
  await selectRow(modal, project, '1.0.0');
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await search(page, team);
  await page.getByRole('cell', { name: team, exact: true }).click();
  await expect(page.getByRole('link', { name: project })).toBeVisible();
});

test('keep the input of a OIDC group that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/oidc\/group 409$/);
  await login(page);
  await page.goto('admin/accessManagement/oidcGroups');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/oidc/group',
    open: () => page.getByRole('button', { name: 'Create Group' }).click(),
    dialog: 'Create Group',
    first: /^Group Name/,
    fill: async (modal) => {
      const name = uniqueName('e2e-OIDC-group');
      await modal.getByRole('textbox', { name: /^Group Name/ }).fill(name);
    },
    created: 'OpenID Connect group created',
  });
});

test('keep the input of a LDAP user that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/user\/ldap 409$/);
  await login(page);
  await page.goto('admin/accessManagement/ldapUsers');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/user/ldap',
    open: () => page.getByRole('button', { name: 'Create User' }).click(),
    dialog: 'Create LDAP User',
    first: /^Username/,
    fill: async (modal) => {
      const name = uniqueName('e2e-LDAP-user');
      await modal.getByRole('textbox', { name: /^Username/ }).fill(name);
    },
    created: 'User created',
  });
});

test('keep the input of a OIDC user that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/user\/oidc 409$/);
  await login(page);
  await page.goto('admin/accessManagement/oidcUsers');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/user/oidc',
    open: () => page.getByRole('button', { name: 'Create User' }).click(),
    dialog: 'Create OpenID Connect User',
    first: /^Username/,
    fill: async (modal) => {
      const name = uniqueName('e2e-OIDC-user');
      await modal.getByRole('textbox', { name: /^Username/ }).fill(name);
    },
    created: 'User created',
  });
});

test('keep the input of a managed user that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/user\/managed 409$/);
  await login(page);
  await page.goto('admin/accessManagement/managedUsers');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/user/managed',
    open: () => page.getByRole('button', { name: 'Create User' }).click(),
    dialog: 'Create Managed User',
    first: /^Username/,
    fill: async (modal) => {
      const name = uniqueName('e2e-managed-user');
      await modal.getByRole('textbox', { name: /^Username/ }).fill(name);
      await modal.getByRole('textbox', { name: /^Full name/ }).fill(name);
      await modal
        .getByRole('textbox', { name: /^Email/ })
        .fill(`${name}@example.com`);
      await modal
        .getByLabel('Password', { exact: true })
        .fill('e2e-password-123');
      await modal.getByLabel(/^Confirm password/).fill('e2e-password-123');
    },
    created: 'User created',
  });
});
