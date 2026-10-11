import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('edit a project in the details modal', async ({ page, api }) => {
  const { uuid } = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-details'),
    version: '1.0.0',
  });
  const description = uniqueName('description');
  const tag = uniqueName('tag');
  await login(page);
  await page.goto(`projects/${uuid}`);
  await page.getByText('View Details').click();

  const modal = page.getByRole('dialog', { name: 'Project Details' });
  await modal.getByLabel('Description').fill(description);
  await modal.getByPlaceholder('Add Tag').fill(tag);
  await modal.getByPlaceholder('Add Tag').press('Enter');
  await modal.getByText('Is latest version').click();
  await modal.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Project updated')).toBeVisible();
  await expect(modal).toBeHidden();

  await page.reload();
  await expect(page.getByRole('main').getByText(tag)).toBeVisible();
  await page.getByText('View Details').click();
  await expect(modal.getByLabel('Description')).toHaveValue(description);
  await expect(modal.getByLabel('Is latest version')).toBeChecked();
});
