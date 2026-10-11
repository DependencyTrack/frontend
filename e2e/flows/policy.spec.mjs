import { uniqueName } from '../api.mjs';
import { test, expect, login, search, filter } from '../test.mjs';

test('add a license to a license group in its row details', async ({
  page,
  api,
}) => {
  const group = uniqueName('e2e-license-group');
  await api.send('PUT', '/v1/licenseGroup', { name: group });

  await login(page);
  await page.goto('policy/licenseGroups');
  await search(page, group);
  await page.getByRole('cell', { name: group, exact: true }).click();
  // The add button is an icon without an accessible name.
  await page.locator('.expanded-row .fa-plus-square').click();
  const modal = page.getByRole('dialog', { name: 'Select License' });
  await filter(modal, '0BSD');
  await modal.getByRole('row', { name: /0BSD/ }).getByRole('checkbox').check();
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(
    page.getByText('Updated', { exact: true }).filter({ visible: true }),
  ).toBeVisible();

  await page.reload();
  await search(page, group);
  await page.getByRole('cell', { name: group, exact: true }).click();
  await expect(page.getByRole('link', { name: '0BSD' })).toBeVisible();
});

test('limit a policy to a project in its row details', async ({
  page,
  api,
}) => {
  const policy = uniqueName('e2e-policy');
  const project = uniqueName('e2e-project');
  await api.send('PUT', '/v1/policy', {
    name: policy,
    operator: 'ANY',
    violationState: 'INFO',
  });
  await api.send('PUT', '/v1/project', { name: project });

  await login(page);
  await page.goto('policy/policies');
  await search(page, policy);
  await page.getByRole('cell', { name: policy }).click();
  await page.getByRole('button', { name: 'Limit To' }).click();
  // The add button is an icon without an accessible name.
  await page.locator('#projectLimitsList .fa-plus-square').click();
  const modal = page.getByRole('dialog', { name: 'Select Project' });
  await search(page, project, modal);
  await modal.getByRole('row', { name: project }).getByRole('checkbox').check();
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(
    page.getByText('Updated', { exact: true }).filter({ visible: true }),
  ).toBeVisible();

  // A reload would keep the search text in the URL, which fails on a redundant navigation.
  await page.goto('policy/policies');
  await search(page, policy);
  await page.getByRole('cell', { name: policy }).click();
  await page.getByRole('button', { name: 'Limit To' }).click();
  await expect(page.getByText(project)).toBeVisible();
});
