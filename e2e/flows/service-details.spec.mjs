import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('add a provider to a service', async ({ page, api }) => {
  const project = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-service'),
  });
  const { uuid } = await api.send(
    'PUT',
    `/v1/service/project/${project.uuid}`,
    {
      name: uniqueName('service'),
      endpoints: ['https://example.com'],
    },
  );
  const provider = uniqueName('provider');
  await login(page);
  await page.goto(`services/${uuid}`);
  await page.getByRole('button', { name: 'View Details' }).click();

  const modal = page.getByRole('dialog', { name: 'Service Details' });
  await modal.getByRole('tab', { name: 'Provider' }).click();
  await modal.getByLabel('Provider name').fill(provider);
  await modal.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Service updated')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'View Details' }).click();
  await modal.getByRole('tab', { name: 'Provider' }).click();
  await expect(modal.getByLabel('Provider name')).toHaveValue(provider);
});

test('keep the service details when cancelling its deletion', async ({
  page,
  api,
}) => {
  const project = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-service'),
  });
  const { uuid } = await api.send(
    'PUT',
    `/v1/service/project/${project.uuid}`,
    { name: uniqueName('service'), endpoints: ['https://example.com'] },
  );
  const name = uniqueName('service');
  await login(page);
  await page.goto(`services/${uuid}`);
  await page.getByRole('button', { name: 'View Details' }).click();
  const modal = page.getByRole('dialog', { name: 'Service Details' });
  await modal.getByLabel('Service name').fill(name);
  await modal.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete' })
    .getByRole('button', { name: 'Cancel' })
    .click();
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel('Service name')).toHaveValue(name);
});
