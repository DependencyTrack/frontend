import { uniqueName } from '../api.mjs';
import { test, expect, login, filter } from '../test.mjs';

test('update a notification template in its row details', async ({
  page,
  api,
}) => {
  const name = uniqueName('e2e-template');
  const description = uniqueName('description');
  await api.send('PUT', '/v1/notification/publisher', {
    name,
    description: 'before',
    extensionName: 'console',
    template: '{{ notification.title }}',
    templateMimeType: 'text/plain',
    defaultPublisher: false,
  });
  await login(page);
  await page.goto('admin/notifications/templates');
  await filter(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await filter(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await expect(page.getByLabel('Description')).toHaveValue(description);
});

test('delete a template after confirming', async ({ page, api }) => {
  const name = uniqueName('e2e-delete');
  await api.send('PUT', '/v1/notification/publisher', {
    name,
    description: 'delete',
    extensionName: 'console',
    template: '{{ notification.title }}',
    templateMimeType: 'text/plain',
    defaultPublisher: false,
  });
  await login(page);
  await page.goto('admin/notifications/templates');
  await filter(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page
    .getByRole('button', { name: 'Delete Template', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Delete Template' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(page.getByRole('cell', { name, exact: true })).toBeHidden();
});
