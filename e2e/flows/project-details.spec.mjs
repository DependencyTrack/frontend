import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('edit a project in the details modal', async ({ page, api }) => {
  const removed = uniqueName('tag');
  const { uuid } = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-details'),
    version: '1.0.0',
    tags: [{ name: removed }],
  });
  const description = uniqueName('description');
  const tag = uniqueName('tag');
  await login(page);
  await page.goto(`projects/${uuid}`);
  await page.getByText('View Details').click();

  const modal = page.getByRole('dialog', { name: 'Project Details' });
  await modal.getByLabel('Description').fill(description);
  await modal.getByRole('button', { name: `Remove ${removed}` }).click();
  await modal.getByPlaceholder('Add Tag').fill(tag);
  await modal.getByPlaceholder('Add Tag').press('Enter');
  await modal.getByText('Is latest version').click();
  await modal.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Project updated')).toBeVisible();
  await expect(modal).toBeHidden();

  await page.reload();
  await expect(page.getByRole('main').getByText(tag)).toBeVisible();
  await expect(page.getByRole('main').getByText(removed)).toBeHidden();
  await page.getByText('View Details').click();
  await expect(modal.getByLabel('Description')).toHaveValue(description);
  await expect(modal.getByLabel('Is latest version')).toBeChecked();
});

test('delete a project from its details', async ({ page, api }) => {
  const name = uniqueName('e2e-delete');
  const { uuid } = await api.send('PUT', '/v1/project', { name });
  await login(page);
  await page.goto(`projects/${uuid}`);
  await page.getByText('View Details').click();
  await page
    .getByRole('dialog', { name: 'Project Details' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await page
    .getByRole('dialog', { name: 'Confirm Project Deletion' })
    .getByRole('button', { name: 'OK' })
    .click();
  await expect(page.getByText('Project deleted')).toBeVisible();
  await expect(page).toHaveURL(/\/projects$/);
});

test('close the delete confirmation when leaving the project', async ({
  page,
  api,
}) => {
  const name = uniqueName('e2e-delete');
  await api.send('PUT', '/v1/project', { name });
  await login(page);
  await page.goto('projects');
  await search(page, name);
  await page.getByRole('link', { name, exact: true }).click();
  await page.getByText('View Details').click();
  await page
    .getByRole('dialog', { name: 'Project Details' })
    .getByRole('button', { name: 'Delete' })
    .click();
  const confirm = page.getByRole('dialog', {
    name: 'Confirm Project Deletion',
  });
  await expect(confirm).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects(\?.*)?$/);
  await expect(confirm).toBeHidden();
});

test('label each severity count in the project header and explain it', async ({
  page,
  api,
}) => {
  const { uuid } = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-severity'),
  });
  await login(page);
  await page.goto(`projects/${uuid}`);
  for (const severity of ['Critical', 'High', 'Medium', 'Low', 'Unassigned']) {
    const figure = page.getByRole('figure', { name: severity });
    await expect(figure).toHaveText(`0${severity}`);
    await figure.hover();
    await expect(
      page.getByRole('tooltip', {
        name: new RegExp(`^${severity} .*\\(excluding aliases\\)$`),
      }),
    ).toBeVisible();
  }
});
