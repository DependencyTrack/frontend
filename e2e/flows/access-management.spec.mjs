import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

// The add buttons in row details are icons without an accessible name.
const addButton = '.expanded-row .fa-plus-square';

// The OIDC group table searches the loaded rows without an API request, so search() would wait forever.
async function filter(page, text) {
  const box = page.getByRole('searchbox', { name: 'Search' });
  await box.fill(text);
  await box.press('Enter');
}

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
