import { uniqueName } from '../api.mjs';
import {
  test,
  expect,
  login,
  search,
  filter,
  expressionErrors,
  pickOption,
} from '../test.mjs';

test('create a license group', async ({ page }) => {
  const name = uniqueName('e2e-license-group');
  await login(page);
  await page.goto('policy/licenseGroups');
  await page.getByRole('button', { name: 'Create License Group' }).click();
  const modal = page.getByRole('dialog', { name: 'Create License Group' });
  await modal.getByLabel('Name').fill(name);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('License group created')).toBeVisible();
  await expect(modal).toBeHidden();

  await search(page, name);
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
});

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
  await expect(modal).toBeHidden();
  await expect(
    page.getByText('Updated', { exact: true }).filter({ visible: true }),
  ).toBeVisible();

  await page.reload();
  await search(page, group);
  await page.getByRole('cell', { name: group, exact: true }).click();
  await expect(page.getByRole('link', { name: '0BSD' })).toBeVisible();
});

test('create a policy', async ({ page }) => {
  const name = uniqueName('e2e-policy');
  await login(page);
  await page.goto('policy/policies');
  await page.getByRole('button', { name: 'Create Policy' }).click();
  const modal = page.getByRole('dialog', { name: 'Create Policy' });
  await modal.getByLabel('Name').fill(name);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Policy created')).toBeVisible();
  await expect(modal).toBeHidden();

  await search(page, name);
  await expect(page.getByRole('cell', { name })).toBeVisible();
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

test('show why an expression condition cannot be added', async ({
  page,
  api,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/policy\/.*\/condition 400$/);
  const policy = uniqueName('e2e-policy');
  await api.send('PUT', '/v1/policy', {
    name: policy,
    operator: 'ANY',
    violationState: 'INFO',
  });

  await login(page);
  await page.goto('policy/policies');
  await search(page, policy);
  await page.getByRole('cell', { name: policy }).click();
  // The add button is an icon without an accessible name.
  await page.locator('.expanded-row .fa-plus-square').first().click();
  await page.getByLabel('Subject').selectOption({ label: 'Expression' });
  await page
    .getByLabel('Violation Type')
    .selectOption({ label: 'Operational' });
  const editor = page
    .getByRole('group', { name: 'Conditions' })
    .getByRole('textbox');
  await editor.fill('component.name.size()');
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(await expressionErrors(editor)).toContainText(
    'Expression must return bool or string, but returns int',
  );
});

test('show the conditions of a policy in its row details', async ({
  page,
  api,
}) => {
  const policy = uniqueName('e2e-policy');
  const { uuid } = await api.send('PUT', '/v1/policy', {
    name: policy,
    operator: 'ANY',
    violationState: 'INFO',
  });
  await api.send('PUT', `/v1/policy/${uuid}/condition`, {
    subject: 'PACKAGE_URL',
    operator: 'MATCHES',
    value: 'pkg:maven/com.example/e2e',
  });

  await login(page);
  await page.goto('policy/policies');
  await search(page, policy);
  await page.getByRole('cell', { name: policy }).click();
  await expect(page.getByLabel('Subject')).toHaveValue('PACKAGE_URL');
  await expect(page.getByLabel('Value')).toHaveValue(
    'pkg:maven/com.example/e2e',
  );
});

test('search the license of a license condition', async ({ page, api }) => {
  const policy = uniqueName('e2e-policy');
  const { uuid } = await api.send('PUT', '/v1/policy', {
    name: policy,
    operator: 'ANY',
    violationState: 'INFO',
  });
  const licenses = await api.get('/v1/license/concise');
  const apache = licenses.find((l) => l.licenseId === 'Apache-2.0');

  await login(page);
  await page.goto('policy/policies');
  await search(page, policy);
  await page.getByRole('cell', { name: policy }).click();
  // The add button is an icon without an accessible name.
  await page.locator('.expanded-row .fa-plus-square').first().click();
  await page.getByLabel('Subject').selectOption({ label: 'License' });
  await page
    .getByRole('combobox', { name: 'Operator *', exact: true })
    .selectOption({ label: 'is' });
  await pickOption(page, 'Value', apache.name);
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(
    page.getByText('Updated', { exact: true }).filter({ visible: true }),
  ).toBeVisible();

  const { policyConditions } = await api.get(`/v1/policy/${uuid}`);
  expect(policyConditions).toMatchObject([
    { subject: 'LICENSE', value: apache.uuid },
  ]);
});
