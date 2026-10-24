import { uniqueName } from '../api.mjs';
import {
  test,
  expect,
  login,
  filter,
  expectCreateToSurviveFailure,
} from '../test.mjs';

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

test('keep the input of a template that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/notification\/publisher 409$/);
  await login(page);
  await page.goto('admin/notifications/templates');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/notification/publisher',
    open: () => page.getByRole('button', { name: 'Create Template' }).click(),
    dialog: 'Create Template',
    first: /^Name/,
    fill: async (modal) => {
      await modal
        .getByLabel('Name', { exact: true })
        .fill(uniqueName('e2e-template'));
      await modal
        .getByLabel('Extension name')
        .selectOption({ label: 'console' });
      await modal.getByLabel('Description').fill('e2e');
      await modal.getByLabel('Mime type').fill('text/plain');
      await modal
        .getByRole('textbox', { name: 'Template', exact: true })
        .fill('{{ notification.title }}');
    },
    created: 'Template created',
  });
});
