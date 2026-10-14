import { seed, uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

const button = (name) => (page) => page.getByRole('button', { name });
const link = (name) => (page) => page.getByRole('link', { name });

async function closeWithEscape(modal) {
  // A modal only handles Escape once it has taken the focus.
  await expect
    .poll(() => modal.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await modal.page().keyboard.press('Escape');
  await expect(modal).toBeHidden();
}

const modals = [
  ['projects', button('Create Project'), 'Create Project'],
  [
    () => `projects/${seed().project.uuid}`,
    link('View Details'),
    'Project Details',
  ],
  [() => `projects/${seed().project.uuid}`, button('Upload BOM'), 'Upload BOM'],
  [() => `projects/${seed().project.uuid}`, button('Apply VEX'), 'Upload VEX'],
  [() => `projects/${seed().project.uuid}`, button('Export'), 'Export Project'],
  [
    () => `projects/${seed().project.uuid}`,
    async (page) => {
      await page.locator('.version-dropdown-toggle').click();
      return page.getByRole('menuitem', { name: 'Add Version' });
    },
    'Add Version',
  ],
  [
    () => `components/${seed().componentUuid}`,
    button('View Details'),
    'Component Details',
  ],
  [
    () => `services/${seed().serviceUuid}`,
    button('View Details'),
    'Service Details',
  ],
  ['vulnerabilities', button('Create Vulnerability'), 'Create Vulnerability'],
  ['licenses', button('Add License'), 'Add License'],
  ['policy/policies', button('Create Policy'), 'Create Policy'],
  [
    'policy/licenseGroups',
    button('Create License Group'),
    'Create License Group',
  ],
  ['admin/accessManagement/teams', button('Create Team'), 'Create Team'],
  [
    'admin/accessManagement/ldapUsers',
    button('Create User'),
    'Create LDAP User',
  ],
  [
    'admin/accessManagement/managedUsers',
    button('Create User'),
    'Create Managed User',
  ],
  [
    'admin/accessManagement/oidcUsers',
    button('Create User'),
    'Create OpenID Connect User',
  ],
  ['admin/accessManagement/oidcGroups', button('Create Group'), 'Create Group'],
  [
    'admin/accessManagement/serviceAccounts',
    button('Create'),
    'Create Service Account',
  ],
  [
    'admin/accessManagement/workloadIdentityProviders',
    button('Create'),
    'Create Workload Identity Provider',
  ],
  ['admin/notifications/alerts', button('Create Alert'), 'Create Alert'],
  [
    'admin/notifications/templates',
    button('Create Template'),
    'Create Template',
  ],
  [
    'admin/repositories/maven',
    button('Create Repository'),
    'Create Repository',
  ],
  ['admin/secrets/management', button('Create'), 'Create secret'],
  [
    'admin/workflows/taskQueues',
    (page) => page.locator('.capacity-value').first(),
    'Edit Capacity',
  ],
  [
    'dashboard',
    (page) =>
      page.getByRole('button', { name: 'Dependency-Track', exact: true }),
    'About',
  ],
  [
    'dashboard',
    async (page) => {
      await page.locator('.fa-user-circle-o').click();
      return page.getByRole('menuitem', { name: 'Update Profile' });
    },
    'Update Profile',
  ],
];

for (const [path, opener, name, allow = []] of modals) {
  test(`open the ${name} modal again after closing it`, async ({
    page,
    problems,
  }) => {
    allow.forEach((pattern) => problems.allow(pattern));
    await login(page);
    await page.goto(typeof path === 'function' ? path() : path);
    const modal = page.getByRole('dialog', { name });
    for (let i = 0; i < 2; i++) {
      await (await opener(page)).click();
      await expect(modal).toBeVisible();
      await closeWithEscape(modal);
    }
  });
}

for (const [kind, path] of [
  ['Project', () => `projects/${seed().project.uuid}`],
  ['Component', () => `components/${seed().componentUuid}`],
]) {
  test(`open the ${kind.toLowerCase()} properties from its details`, async ({
    page,
  }) => {
    await login(page);
    await page.goto(path());
    const details = page.getByRole('dialog', { name: `${kind} Details` });
    const properties = page.getByRole('dialog', { name: `${kind} Properties` });
    const create = page.getByRole('dialog', {
      name: `Create ${kind} Property`,
    });
    await page.getByText('View Details').click();
    await details.getByRole('button', { name: 'Properties' }).click();
    await expect(properties).toBeVisible();
    await expect(details).toBeHidden();
    await properties.getByRole('button', { name: 'Create Property' }).click();
    await expect(create).toBeVisible();
    await expect(properties).toBeHidden();
    await closeWithEscape(create);

    await page.getByText('View Details').click();
    await expect(details).toBeVisible();
  });
}

test('edit the secret that was clicked', async ({ page, api }) => {
  const prefix = uniqueName('e2e-secret');
  for (const name of [`${prefix}-a`, `${prefix}-b`]) {
    await api.send('POST', '/v2/secrets', { name, value: 'hunter2' });
  }
  await login(page);
  await page.goto('admin/secrets/management');
  await search(page, prefix);
  for (const name of [`${prefix}-a`, `${prefix}-b`]) {
    await page
      .getByRole('row', { name: new RegExp(name) })
      .getByTitle('Edit secret')
      .click();
    const modal = page.getByRole('dialog', { name: `Update secret ${name}` });
    await expect(modal).toBeVisible();
    await closeWithEscape(modal);
  }
});

test('show why a login failed every time', async ({ page, problems }) => {
  problems.allow(/^POST \/api\/v1\/user\/login 401$/);
  await page.goto('login');
  await page.getByPlaceholder('Username').fill(uniqueName('e2e-nobody'));
  await page.getByPlaceholder('Password').fill('wrong');
  const modal = page.getByRole('dialog', { name: 'Information' });
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
  }
});
